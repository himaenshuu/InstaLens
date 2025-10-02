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
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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
  try {
    const { username } = await c.req.json();

    if (!username) {
      return c.json({ error: "Username is required" }, 400);
    }

    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    if (!apifyToken) {
      return c.json({ error: "Apify API token not configured" }, 500);
    }

    console.log(`Starting scrape for Instagram profile: ${username}`);

    // Check if we have recent cached data (less than 1 hour old)
    const cacheKey = `profile:${username.toLowerCase()}`;
    const cachedData = await kv.get(cacheKey);

    if (
      cachedData &&
      cachedData.timestamp &&
      Date.now() - cachedData.timestamp < 3600000
    ) {
      // 1 hour
      console.log(`Returning cached data for ${username}`);
      return c.json({
        success: true,
        data: cachedData.data,
        cached: true,
        timestamp: cachedData.timestamp,
      });
    }

    // Start Apify scraping task
    const actorId = "apify/instagram-scraper";
    const runInput = {
      usernames: [username],
      resultsType: "details",
      resultsLimit: 100,
    };

    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(runInput),
      }
    );

    if (!runResponse.ok) {
      console.error("Failed to start Apify run:", await runResponse.text());
      return c.json({ error: "Failed to start scraping" }, 500);
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
        `https://api.apify.com/v2/acts/runs/${runId}`,
        {
          headers: { Authorization: `Bearer ${apifyToken}` },
        }
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
            }
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
        profileImage: `https://ui-avatars.com/api/?name=${username}&background=6366f1&color=fff&size=128`,
        name: username,
        username: username,
        followers: 0,
        following: 0,
        posts: 0,
        isVerified: false,
        bio: `Profile data for @${username} could not be scraped. This may be due to privacy settings or rate limits.`,
        posts: [],
        reels: [],
      };

      // Cache the fallback data for a shorter time (5 minutes)
      await kv.set(cacheKey, {
        data: fallbackData,
        timestamp: Date.now(),
      });

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
      profileImage: profileData.profilePicUrl || profileData.profilePic || "",
      name: profileData.fullName || profileData.name || username,
      username: profileData.username || username,
      followers: profileData.followersCount || profileData.followers || 0,
      following: profileData.followsCount || profileData.following || 0,
      posts: profileData.postsCount || profileData.posts || 0,
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
    await kv.set(cacheKey, {
      data: formattedData,
      timestamp: Date.now(),
    });

    console.log(`Successfully scraped and cached data for ${username}`);

    return c.json({
      success: true,
      data: formattedData,
      cached: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error scraping profile:", error);
    return c.json(
      {
        error: "Internal server error during scraping",
        details: error.message,
      },
      500
    );
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
    }

    return c.json({ error: "Profile not found in cache" }, 404);
  } catch (error) {
    console.error("Error fetching cached profile:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Clear cache for a profile
app.delete("/make-server-b9769089/profile/:username/cache", async (c) => {
  try {
    const username = c.req.param("username");
    const cacheKey = `profile:${username.toLowerCase()}`;

    await kv.del(cacheKey);

    return c.json({ success: true, message: "Cache cleared" });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Health check endpoint
app.get("/make-server-b9769089/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
