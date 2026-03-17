import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", cors());
app.use("*", logger(console.log));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PROFILE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHED_PROFILES = 10;

const buildDefaultAvatar = (username: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username,
  )}&background=6366f1&color=fff&size=128`;

const pickProfileImage = (profileData: any, username: string): string => {
  const candidates = [
    profileData?.profilePicUrl,
    profileData?.profilePic,
    profileData?.profilePicture,
    profileData?.profileImageUrl,
    profileData?.profile_image_url,
    profileData?.hdProfilePicUrl,
    profileData?.profilePicUrlHD,
    profileData?.profile_pic_url,
    profileData?.profile_pic_url_hd,
    profileData?.avatar,
  ];

  const firstValid = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return firstValid || buildDefaultAvatar(username);
};

const pruneProfileCache = async () => {
  try {
    const { data, error } = await supabase
      .from("kv_store_b9769089")
      .select("key,value")
      .like("key", "profile:%");

    if (error || !data) {
      if (error) {
        console.error("Failed to list profile cache entries:", error);
      }
      return;
    }

    const entries = data
      .map((entry: any) => ({
        key: entry.key as string,
        timestamp: Number(entry?.value?.timestamp || 0),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    if (entries.length <= MAX_CACHED_PROFILES) {
      return;
    }

    const keysToDelete = entries
      .slice(MAX_CACHED_PROFILES)
      .map((entry) => entry.key);

    for (const key of keysToDelete) {
      await kv.del(key);
    }

    console.log(`Pruned ${keysToDelete.length} old profile cache entries`);
  } catch (error) {
    console.error("Error pruning profile cache:", error);
  }
};

const pruneDatabaseProfileCache = async () => {
  try {
    const { data, error } = await supabase
      .from("influencer_profiles")
      .select("id")
      .order("last_scraped_at", { ascending: false, nullsFirst: false });

    if (error || !data) {
      if (error) {
        console.error("Failed to list DB profile cache entries:", error);
      }
      return;
    }

    if (data.length <= MAX_CACHED_PROFILES) {
      return;
    }

    const idsToDelete = data
      .slice(MAX_CACHED_PROFILES)
      .map((row: any) => row.id);

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("influencer_profiles")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error(
          "Failed to prune old DB profile cache entries:",
          deleteError,
        );
      } else {
        console.log(`Pruned ${idsToDelete.length} old DB cached profiles`);
      }
    }
  } catch (error) {
    console.error("Error pruning DB profile cache:", error);
  }
};

// Health check endpoint
app.get("/make-server-b9769089/health", async (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "InstaLens API",
    version: "1.0.0",
  });
});

// Scrape Instagram profile using Apify
app.post("/make-server-b9769089/scrape-profile", async (c) => {
  const startTime = Date.now();
  let username = "";

  try {
    console.log("=== SCRAPE PROFILE REQUEST START ===");

    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await c.req.json();
      username = requestBody.username;
      console.log(`Request body parsed successfully:`, requestBody);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return c.json(
        {
          error: "Invalid JSON in request body",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        400,
      );
    }

    if (!username || typeof username !== "string" || username.trim() === "") {
      console.error("Invalid username provided:", username);
      return c.json({ error: "Valid username is required" }, 400);
    }

    username = username.trim().toLowerCase();
    console.log(`Processing username: ${username}`);

    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    if (!apifyToken) {
      console.error("APIFY_API_TOKEN environment variable not set");
      return c.json({ error: "Apify API token not configured" }, 500);
    }

    console.log(`Starting scrape for Instagram profile: ${username}`);

    // Check database cache first (7 days)
    try {
      const { data: cachedProfile, error: cachedProfileError } = await supabase
        .from("influencer_profiles")
        .select(
          "id, username, display_name, profile_image_url, bio, followers_count, following_count, posts_count, is_verified, last_scraped_at",
        )
        .eq("username", username)
        .maybeSingle();

      if (cachedProfileError) {
        console.error("Error reading database cache:", cachedProfileError);
      }

      const lastScrapedAt = cachedProfile?.last_scraped_at
        ? new Date(cachedProfile.last_scraped_at).getTime()
        : null;

      if (
        cachedProfile &&
        lastScrapedAt &&
        Date.now() - lastScrapedAt < PROFILE_CACHE_TTL_MS
      ) {
        const [postsResult, reelsResult] = await Promise.all([
          supabase
            .from("posts")
            .select(
              "instagram_post_id, image_url, caption, likes_count, comments_count, posted_at",
            )
            .eq("profile_id", cachedProfile.id)
            .order("updated_at", { ascending: false })
            .limit(12),
          supabase
            .from("reels")
            .select(
              "instagram_reel_id, thumbnail_url, caption, views_count, likes_count, comments_count, duration, posted_at",
            )
            .eq("profile_id", cachedProfile.id)
            .order("updated_at", { ascending: false })
            .limit(8),
        ]);

        const cachedData = {
          profileImage:
            cachedProfile.profile_image_url || buildDefaultAvatar(username),
          name: cachedProfile.display_name || cachedProfile.username,
          username: cachedProfile.username,
          followers: cachedProfile.followers_count || 0,
          following: cachedProfile.following_count || 0,
          postsCount: cachedProfile.posts_count || 0,
          isVerified: cachedProfile.is_verified || false,
          bio: cachedProfile.bio || "",
          posts: (postsResult.data || []).map((post: any, index: number) => ({
            id: post.instagram_post_id || `post-${index}`,
            image: post.image_url,
            caption: post.caption || "",
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            timestamp: post.posted_at || "Recently",
            type: "post",
          })),
          reels: (reelsResult.data || []).map((reel: any, index: number) => ({
            id: reel.instagram_reel_id || `reel-${index}`,
            thumbnail: reel.thumbnail_url,
            caption: reel.caption || "",
            views: reel.views_count || 0,
            likes: reel.likes_count || 0,
            comments: reel.comments_count || 0,
            duration: reel.duration || "0:30",
            timestamp: reel.posted_at || "Recently",
          })),
        };

        console.log(`Returning database-cached data for ${username}`);
        return c.json({
          success: true,
          data: cachedData,
          cached: true,
          timestamp: lastScrapedAt,
        });
      }
    } catch (dbCacheError) {
      console.error("Database cache lookup failed:", dbCacheError);
    }

    // Check if we have recent cached data (valid for 7 days)
    const cacheKey = `profile:${username.toLowerCase()}`;
    let cachedData = null;

    try {
      console.log(`Checking cache for key: ${cacheKey}`);
      cachedData = await kv.get(cacheKey);
      console.log(
        `Cache result:`,
        cachedData ? "Data found" : "No cached data",
      );
    } catch (cacheError) {
      console.error("Cache read error (table may not exist):", cacheError);
      console.log("Continuing without cache - will scrape from Apify directly");
    }

    if (
      cachedData &&
      cachedData.timestamp &&
      Date.now() - cachedData.timestamp < PROFILE_CACHE_TTL_MS
    ) {
      console.log(`Returning cached data for ${username}`);
      return c.json({
        success: true,
        data: cachedData.data,
        cached: true,
        timestamp: cachedData.timestamp,
      });
    }

    if (cachedData?.timestamp) {
      console.log(`Cache expired for ${username}, fetching fresh data`);
      try {
        await kv.del(cacheKey);
      } catch (deleteError) {
        console.error("Failed to remove expired cache entry:", deleteError);
      }
    }

    // Start Apify scraping task
    const actorId = "apify~instagram-scraper";
    const runInput = {
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: "details",
      resultsLimit: 1,
    };

    let runResponse;
    try {
      console.log(`Making request to Apify API with actor: ${actorId}`);
      console.log(`Run input:`, JSON.stringify(runInput, null, 2));

      runResponse = await fetch(
        `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apifyToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(runInput),
        },
      );

      console.log(`Apify API response status: ${runResponse.status}`);
    } catch (fetchError) {
      console.error("Network error calling Apify API:", fetchError);
      return c.json(
        {
          error: "Network error connecting to scraping service",
          details:
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError),
        },
        500,
      );
    }

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error("Failed to start Apify run:", errorText);
      console.error("Response status:", runResponse.status);
      console.error(
        "Response headers:",
        Object.fromEntries(runResponse.headers.entries()),
      );

      return c.json(
        {
          error: "Failed to start scraping",
          details: errorText,
          status: runResponse.status,
        },
        500,
      );
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    console.log(`Apify run started with ID: ${runId}`);

    // Poll for completion (max 60 seconds)
    let attempts = 0;
    const maxAttempts = 30;
    let runResult = null;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        {
          headers: { Authorization: `Bearer ${apifyToken}` },
        },
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const status = statusData.data.status;

        console.log(`Run ${runId} status: ${status}`);

        if (status === "SUCCEEDED") {
          // Get the results
          const resultsResponse = await fetch(
            `https://api.apify.com/v2/datasets/${statusData.data.defaultDatasetId}/items`,
            {
              headers: { Authorization: `Bearer ${apifyToken}` },
            },
          );

          if (resultsResponse.ok) {
            runResult = await resultsResponse.json();
            break;
          }
        } else if (status === "FAILED" || status === "ABORTED") {
          return c.json({ error: "Scraping failed" }, 500);
        }
      }

      attempts++;
    }

    if (!runResult || runResult.length === 0) {
      console.log("No data found or scraping timeout, returning fallback data");

      // Return fallback data structure
      const fallbackData = {
        profileImage: buildDefaultAvatar(username),
        name: username,
        username: username,
        followers: 0,
        following: 0,
        postsCount: 0,
        isVerified: false,
        bio: `Profile data for @${username} could not be scraped. This may be due to privacy settings or rate limits.`,
        posts: [],
        reels: [],
      };

      // Cache the fallback data for a shorter time (5 minutes)
      try {
        await kv.set(cacheKey, {
          data: fallbackData,
          timestamp: Date.now(),
        });
        console.log(`Fallback data cached successfully for ${username}`);
      } catch (cacheError) {
        console.error("Failed to cache fallback data:", cacheError);
        // Continue without caching if there's an error
      }

      return c.json({
        success: true,
        data: fallbackData,
        cached: false,
        timestamp: Date.now(),
        note: "Fallback data - profile could not be scraped",
      });
    }

    // Process and format the scraped data
    const profileData = runResult[0];
    const formattedData = {
      profileImage: pickProfileImage(profileData, username),
      name: profileData.fullName || profileData.name || username,
      username: profileData.username || username,
      followers: profileData.followersCount || profileData.followers || 0,
      following: profileData.followsCount || profileData.following || 0,
      postsCount: profileData.postsCount || profileData.posts || 0,
      isVerified: profileData.verified || false,
      bio: profileData.biography || profileData.bio || "",
      posts: (profileData.latestPosts || [])
        .slice(0, 12)
        .map((post: any, index: number) => ({
          id: post.shortCode || `post-${index}`,
          image: post.displayUrl || post.url,
          caption: post.caption || "",
          likes: post.likesCount || 0,
          comments: post.commentsCount || 0,
          timestamp: post.timestamp
            ? new Date(post.timestamp).toLocaleDateString()
            : "Recently",
          type: "post",
        })),
      reels: (profileData.latestPosts || [])
        .filter((post: any) => post.isVideo)
        .slice(0, 8)
        .map((reel: any, index: number) => ({
          id: reel.shortCode || `reel-${index}`,
          thumbnail: reel.displayUrl || reel.url,
          caption: reel.caption || "",
          views: reel.videoViewCount || 0,
          likes: reel.likesCount || 0,
          comments: reel.commentsCount || 0,
          duration: reel.videoDurationSecs
            ? `${Math.floor(reel.videoDurationSecs / 60)}:${(
                reel.videoDurationSecs % 60
              )
                .toString()
                .padStart(2, "0")}`
            : "0:30",
          timestamp: reel.timestamp
            ? new Date(reel.timestamp).toLocaleDateString()
            : "Recently",
        })),
    };

    // Cache the data
    try {
      await kv.set(cacheKey, {
        data: formattedData,
        timestamp: Date.now(),
      });
      await pruneProfileCache();
      console.log(`Successfully scraped and cached data for ${username}`);
    } catch (cacheError) {
      console.error("Failed to cache scraped data:", cacheError);
      // Continue without caching if there's an error
      console.log(
        `Successfully scraped data for ${username} (cache write failed)`,
      );
    }

    // Persist durable cache in database tables
    try {
      const { data: profileRow, error: profileError } = await supabase
        .from("influencer_profiles")
        .upsert(
          {
            username: formattedData.username,
            display_name: formattedData.name,
            profile_image_url: formattedData.profileImage,
            bio: formattedData.bio,
            followers_count: formattedData.followers,
            following_count: formattedData.following,
            posts_count:
              formattedData.postsCount || formattedData.posts?.length || 0,
            is_verified: formattedData.isVerified,
            last_scraped_at: new Date().toISOString(),
          },
          { onConflict: "username" },
        )
        .select("id")
        .single();

      if (profileError) {
        console.error(
          "Failed to upsert influencer_profiles cache:",
          profileError,
        );
      } else if (profileRow?.id) {
        const profileId = profileRow.id;

        await supabase.from("posts").delete().eq("profile_id", profileId);
        await supabase.from("reels").delete().eq("profile_id", profileId);

        if (formattedData.posts?.length) {
          const postsPayload = formattedData.posts.map((post: any) => ({
            profile_id: profileId,
            instagram_post_id: post.id,
            image_url: post.image,
            caption: post.caption || "",
            likes_count: post.likes || 0,
            comments_count: post.comments || 0,
            post_type: "post",
            posted_at: post.timestamp || "Recently",
          }));

          const { error: postsError } = await supabase
            .from("posts")
            .insert(postsPayload);
          if (postsError) {
            console.error("Failed to cache posts in database:", postsError);
          }
        }

        if (formattedData.reels?.length) {
          const reelsPayload = formattedData.reels.map((reel: any) => ({
            profile_id: profileId,
            instagram_reel_id: reel.id,
            thumbnail_url: reel.thumbnail,
            caption: reel.caption || "",
            views_count: reel.views || 0,
            likes_count: reel.likes || 0,
            comments_count: reel.comments || 0,
            duration: reel.duration || "0:30",
            posted_at: reel.timestamp || "Recently",
          }));

          const { error: reelsError } = await supabase
            .from("reels")
            .insert(reelsPayload);
          if (reelsError) {
            console.error("Failed to cache reels in database:", reelsError);
          }
        }

        await pruneDatabaseProfileCache();
      }
    } catch (dbPersistError) {
      console.error("Failed to persist database cache:", dbPersistError);
    }

    return c.json({
      success: true,
      data: formattedData,
      cached: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.error("=== SCRAPING ERROR ===");
    console.error("Username:", username);
    console.error("Duration:", duration + "ms");
    console.error("Error:", error);
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Return fallback data in case of any error
    console.log("Returning fallback data due to error");

    const fallbackData = {
      profileImage: buildDefaultAvatar(username),
      name: username,
      username: username,
      followers: 0,
      following: 0,
      postsCount: 0,
      isVerified: false,
      bio: `Profile data for @${username} could not be scraped due to an error.`,
      posts: [],
      reels: [],
    };

    return c.json({
      success: true,
      data: fallbackData,
      cached: false,
      timestamp: Date.now(),
      note: "Fallback data - scraping encountered an error",
      error_info: {
        message: error instanceof Error ? error.message : String(error),
        duration: duration,
      },
    });
  }
});

// Get cached profile data
app.get("/make-server-b9769089/profile/:username", async (c) => {
  try {
    const username = c.req.param("username");
    const cacheKey = `profile:${username.toLowerCase()}`;

    const cachedData = await kv.get(cacheKey);

    if (cachedData) {
      return c.json({
        success: true,
        data: cachedData.data,
        cached: true,
        timestamp: cachedData.timestamp,
      });
    } else {
      return c.json({ error: "Profile not found in cache" }, 404);
    }
  } catch (error) {
    console.error("Error retrieving cached profile:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Clear cached profile data
app.delete("/make-server-b9769089/profile/:username/cache", async (c) => {
  try {
    const username = c.req.param("username");
    const cacheKey = `profile:${username.toLowerCase()}`;

    await kv.del(cacheKey);

    return c.json({
      success: true,
      message: `Cache cleared for ${username}`,
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// List recently cached/saved profiles from database
app.get("/make-server-b9769089/profiles", async (c) => {
  try {
    const { data, error } = await supabase
      .from("influencer_profiles")
      .select(
        "username, display_name, profile_image_url, followers_count, is_verified",
      )
      .order("last_scraped_at", { ascending: false, nullsFirst: false })
      .limit(MAX_CACHED_PROFILES);

    if (error) {
      console.error("Error fetching profiles:", error);
      return c.json({ profiles: [] });
    }

    return c.json({ profiles: data ?? [] });
  } catch (error) {
    console.error("Unexpected error fetching profiles:", error);
    return c.json({ profiles: [] });
  }
});

// Proxy image endpoint to avoid CORS issues for external image hosts
app.get("/make-server-b9769089/proxy-image", async (c) => {
  try {
    const url = c.req.query("url");

    if (!url) {
      return c.json({ error: "Missing url query parameter" }, 400);
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return c.json({ error: "Invalid url parameter" }, 400);
    }

    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return c.json({ error: "Only http/https URLs are allowed" }, 400);
    }

    const imageResponse = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
      },
    });

    if (!imageResponse.ok || !imageResponse.body) {
      return c.json({ error: "Failed to fetch image" }, 502);
    }

    const contentType =
      imageResponse.headers.get("content-type") ?? "application/octet-stream";

    return new Response(imageResponse.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);
