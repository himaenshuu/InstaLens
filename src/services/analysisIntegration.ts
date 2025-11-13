/**
 * Content Analysis Integration
 *
 * Connects content analysis services with the app
 * Handles API key management and batch processing
 */

import {
  analyzeContent,
  AnalysisResult,
  MediaContent,
} from "./contentAnalysis";

/**
 * Configuration for content analysis
 */
export interface AnalysisConfig {
  // Google Cloud Vision API key (optional)
  visionApiKey?: string;

  // Whether to enable batch processing
  enableBatch: boolean;

  // Maximum number of items to analyze per batch
  batchSize: number;

  // Whether to analyze videos (thumbnails)
  analyzeVideos: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AnalysisConfig = {
  visionApiKey: undefined,
  enableBatch: true,
  batchSize: 20, // Analyze first 20 posts
  analyzeVideos: true,
};

/**
 * Analyzes a single post/reel with content insights
 *
 * @param post - Post or reel data
 * @param config - Analysis configuration
 * @returns Analysis result or null if skipped
 */
export async function analyzePost(
  post: {
    image?: string;
    thumbnail?: string;
    caption?: string;
    type?: "image" | "video";
  },
  config: Partial<AnalysisConfig> = {}
): Promise<AnalysisResult | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    // Determine media type and URL
    const mediaType: "image" | "video" =
      post.type || (post.image ? "image" : "video");
    const mediaUrl = post.image || post.thumbnail || "";

    if (!mediaUrl) {
      return null;
    }

    // Skip video analysis if disabled
    if (mediaType === "video" && !finalConfig.analyzeVideos) {
      return null;
    }

    // Build media content object
    const media: MediaContent = {
      type: mediaType,
      url: mediaUrl,
      thumbnailUrl: post.thumbnail,
      caption: post.caption,
    };

    // Analyze content
    const result = await analyzeContent(media, finalConfig.visionApiKey);

    return result;
  } catch (error) {
    return null;
  }
}

/**
 * Analyzes multiple posts in batch
 *
 * @param posts - Array of posts/reels
 * @param config - Analysis configuration
 * @returns Map of post index to analysis result
 */
export async function analyzeBatch(
  posts: Array<{
    image?: string;
    thumbnail?: string;
    caption?: string;
    type?: "image" | "video";
  }>,
  config: Partial<AnalysisConfig> = {}
): Promise<Map<number, AnalysisResult>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const results = new Map<number, AnalysisResult>();

  // Limit batch size
  const postsToAnalyze = posts.slice(0, finalConfig.batchSize);

  // Analyze posts sequentially (to respect API rate limits)
  for (let i = 0; i < postsToAnalyze.length; i++) {
    const post = postsToAnalyze[i];

    try {
      const result = await analyzePost(post, finalConfig);

      if (result) {
        results.set(i, result);
      }

      // Small delay to respect API rate limits (100ms between requests)
      if (i < postsToAnalyze.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      // Continue with next post
    }
  }

  return results;
}

/**
 * Gets the Vision API key from environment or Supabase
 *
 * Priority:
 * 1. Environment variable (VITE_GOOGLE_VISION_API_KEY)
 * 2. Return undefined (will use caption fallback)
 *
 * @returns API key or undefined
 */
export function getVisionApiKey(): string | undefined {
  // Check environment variable
  const envKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

  if (envKey && envKey !== "your_api_key_here") {
    return envKey;
  }

  return undefined;
}

/**
 * Checks if Vision API is available
 *
 * @returns True if API key is configured
 */
export function isVisionApiAvailable(): boolean {
  return !!getVisionApiKey();
}

/**
 * Example usage:
 *
 * ```typescript
 * // Analyze single post
 * const result = await analyzePost(post, {
 *   visionApiKey: getVisionApiKey()
 * });
 *
 * // Analyze batch
 * const results = await analyzeBatch(posts, {
 *   visionApiKey: getVisionApiKey(),
 *   batchSize: 10
 * });
 * ```
 */
