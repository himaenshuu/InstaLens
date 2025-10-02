/**
 * Content Analysis Service
 *
 * Analyzes Instagram post/video content using multiple strategies:
 * 1. Caption text analysis (always available)
 * 2. Hashtag extraction and categorization
 * 3. Emoji sentiment analysis
 * 4. Google Vision API (for images)
 * 5. Thumbnail analysis (for videos)
 *
 * Implements smart fallback system when APIs are unavailable
 */

import {
  analyzeImageWithVision,
  formatContentInsights,
  ContentInsights,
  VisionAnalysisResult,
} from "./visionService";

export interface MediaContent {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  caption?: string;
}

export interface AnalysisResult {
  // Content insights (from Vision API or fallback)
  insights: ContentInsights;

  // Caption analysis (always available)
  caption: CaptionAnalysis;

  // Source of analysis
  source: "vision-api" | "caption-fallback" | "thumbnail-fallback";

  // Raw data (for debugging)
  raw?: VisionAnalysisResult;
}

export interface CaptionAnalysis {
  hashtags: string[];
  mentions: string[];
  keywords: string[];
  sentiment: "positive" | "neutral" | "negative";
  emojis: string[];
  categories: string[];
  callToAction: boolean;
}

/**
 * Analyzes media content (image or video) with automatic fallback
 *
 * Priority order:
 * 1. Try Google Vision API (if API key available)
 * 2. Fall back to caption analysis
 * 3. For videos, analyze thumbnail if available
 *
 * @param media - Media content to analyze
 * @param apiKey - Optional Google Cloud Vision API key
 * @returns Complete analysis result
 */
export async function analyzeContent(
  media: MediaContent,
  apiKey?: string
): Promise<AnalysisResult> {
  // Always analyze caption (fast and free)
  const captionAnalysis = analyzeCaption(media.caption || "");

  // Try Vision API if available
  if (apiKey) {
    try {
      // For videos, use thumbnail; for images, use main URL
      const imageUrl =
        media.type === "video" && media.thumbnailUrl
          ? media.thumbnailUrl
          : media.url;

      // Call Google Vision API
      const visionResult = await analyzeImageWithVision(imageUrl, apiKey);

      // Check if Vision API returned valid results
      if (visionResult.labels.length > 0 && !visionResult.error) {
        return {
          insights: formatContentInsights(visionResult),
          caption: captionAnalysis,
          source: media.type === "video" ? "thumbnail-fallback" : "vision-api",
          raw: visionResult,
        };
      }
    } catch (error) {
      console.warn("Vision API failed, using caption fallback:", error);
    }
  }

  // Fallback: Generate insights from caption analysis
  const fallbackInsights = generateInsightsFromCaption(captionAnalysis);

  return {
    insights: fallbackInsights,
    caption: captionAnalysis,
    source: "caption-fallback",
  };
}

/**
 * Analyzes caption text to extract metadata
 *
 * @param caption - Instagram caption text
 * @returns Parsed caption analysis
 */
export function analyzeCaption(caption: string): CaptionAnalysis {
  // Extract hashtags
  const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
  const hashtags = (caption.match(hashtagRegex) || []).map((tag) =>
    tag.slice(1).toLowerCase()
  );

  // Extract mentions
  const mentionRegex = /@[\w.]+/g;
  const mentions = (caption.match(mentionRegex) || []).map((mention) =>
    mention.slice(1)
  );

  // Extract emojis
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojis = caption.match(emojiRegex) || [];

  // Extract keywords (words longer than 3 chars, excluding hashtags/mentions)
  const cleanText = caption
    .replace(hashtagRegex, "")
    .replace(mentionRegex, "")
    .replace(emojiRegex, "");

  const keywords = cleanText
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && /^[a-z]+$/.test(word))
    .filter((word) => !isStopWord(word))
    .slice(0, 10);

  // Analyze sentiment
  const sentiment = analyzeSentiment(caption, emojis);

  // Categorize content from hashtags and keywords
  const categories = categorizeContent([...hashtags, ...keywords]);

  // Check for call-to-action
  const callToAction = detectCallToAction(caption);

  return {
    hashtags,
    mentions,
    keywords,
    sentiment,
    emojis,
    categories,
    callToAction,
  };
}

/**
 * Generates content insights from caption analysis (fallback)
 *
 * @param captionAnalysis - Parsed caption data
 * @returns Content insights based on text analysis
 */
function generateInsightsFromCaption(
  captionAnalysis: CaptionAnalysis
): ContentInsights {
  // Determine content type from hashtags and categories
  const contentType = captionAnalysis.categories[0] || "General Content";

  // Use hashtags and keywords as topics
  const topics = [
    ...captionAnalysis.hashtags.slice(0, 3),
    ...captionAnalysis.keywords.slice(0, 2),
  ];

  // Generate descriptive tags from hashtags and keywords
  const descriptiveTags = [
    ...captionAnalysis.hashtags.slice(0, 10),
    ...captionAnalysis.keywords.slice(0, 10)
  ].filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates

  // Infer objects from keywords
  const objects = captionAnalysis.keywords.slice(0, 5);

  // Use first category as scene
  const scene = captionAnalysis.categories[0] || "Unknown";

  // Estimate people count from mentions
  const peopleCount = captionAnalysis.mentions.length;

  // Map sentiment to emotions
  const emotions =
    captionAnalysis.sentiment === "positive"
      ? ["happy"]
      : captionAnalysis.sentiment === "negative"
      ? ["sad"]
      : [];

  // Infer vibe from caption content
  const vibe = inferVibeFromCaption(captionAnalysis);

  // Estimate quality from caption indicators
  const quality = estimateQualityFromCaption(captionAnalysis);

  return {
    contentType,
    topics,
    descriptiveTags,
    objects,
    scene,
    vibe,
    quality,
    peopleCount: Math.min(peopleCount, 5), // Cap at 5
    emotions,
    textDetected: [], // Not available from caption
    dominantColors: [], // Not available from caption
    isAppropriate: true, // Assume safe
    confidence: 0.6, // Lower confidence for fallback
  };
}

/**
 * Infers vibe/ambience from caption content
 */
function inferVibeFromCaption(caption: CaptionAnalysis): ContentInsights['vibe'] {
  const allText = [...caption.hashtags, ...caption.keywords].join(' ').toLowerCase();
  
  // Check for vibe indicators
  const isLuxury = /luxury|lavish|premium|elegant|expensive|upscale|exclusive/.test(allText);
  const isAesthetic = /aesthetic|artsy|artistic|minimal|creative|design/.test(allText);
  const isEnergetic = /party|energy|hype|crazy|wild|lit|festival|dance/.test(allText);
  const isCasual = /casual|chill|relax|everyday|simple|daily/.test(allText);
  const isTravel = /travel|adventure|explore|vacation|trip|journey/.test(allText);
  const isProfessional = /professional|business|work|corporate|meeting/.test(allText);
  
  let primary = 'casual';
  let secondary: string | undefined;
  let intensity: 'subtle' | 'moderate' | 'strong' = 'moderate';
  
  if (isLuxury) {
    primary = 'luxury';
    secondary = isAesthetic ? 'aesthetic' : undefined;
    intensity = 'strong';
  } else if (isEnergetic) {
    primary = 'energetic';
    secondary = 'party';
    intensity = 'strong';
  } else if (isAesthetic) {
    primary = 'aesthetic';
    secondary = 'creative';
  } else if (isTravel) {
    primary = 'adventure';
    secondary = 'exploratory';
  } else if (isProfessional) {
    primary = 'professional';
    secondary = 'corporate';
  }
  
  // Boost intensity if sentiment is strong
  if (caption.sentiment === 'positive' && caption.emojis.length > 3) {
    intensity = 'strong';
  }
  
  return { primary, secondary, intensity };
}

/**
 * Estimates quality indicators from caption
 */
function estimateQualityFromCaption(caption: CaptionAnalysis): ContentInsights['quality'] {
  const allText = [...caption.hashtags, ...caption.keywords].join(' ').toLowerCase();
  
  // Quality indicators from text
  const hasQualityKeywords = /professional|hd|quality|studio|clear|crisp/.test(allText);
  const hasAestheticKeywords = /aesthetic|beautiful|stunning|gorgeous/.test(allText);
  
  return {
    lighting: hasQualityKeywords ? 'good' : 'poor',
    visualAppeal: hasAestheticKeywords ? 75 : 60,
    composition: hasQualityKeywords ? 'good' : 'poor',
    clarity: 'medium'
  };
}

/**
 * Analyzes text sentiment using keyword matching and emojis
 *
 * @param text - Text to analyze
 * @param emojis - Extracted emojis
 * @returns Sentiment category
 */
function analyzeSentiment(
  text: string,
  emojis: string[]
): "positive" | "neutral" | "negative" {
  const lowerText = text.toLowerCase();

  // Positive keywords
  const positiveWords = [
    "love",
    "amazing",
    "awesome",
    "great",
    "excellent",
    "fantastic",
    "wonderful",
    "beautiful",
    "best",
    "perfect",
    "happy",
    "excited",
    "blessed",
    "grateful",
    "thank",
  ];

  // Negative keywords
  const negativeWords = [
    "hate",
    "bad",
    "terrible",
    "awful",
    "worst",
    "disappointed",
    "sad",
    "angry",
    "frustrated",
    "annoyed",
  ];

  // Positive emojis
  const positiveEmojis = [
    "😊",
    "😄",
    "😍",
    "🥰",
    "😎",
    "🔥",
    "⭐",
    "✨",
    "💖",
    "👍",
    "🎉",
  ];

  // Negative emojis
  const negativeEmojis = ["😢", "😭", "😡", "😤", "💔", "👎"];

  // Count positive and negative indicators
  let positiveScore = 0;
  let negativeScore = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveScore++;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeScore++;
  });

  emojis.forEach((emoji) => {
    if (positiveEmojis.includes(emoji)) positiveScore++;
    if (negativeEmojis.includes(emoji)) negativeScore++;
  });

  // Determine sentiment
  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
}

/**
 * Categorizes content based on keywords and hashtags
 *
 * @param terms - Array of hashtags and keywords
 * @returns Array of content categories
 */
function categorizeContent(terms: string[]): string[] {
  const termsLower = terms.map((t) => t.toLowerCase());
  const categories = new Set<string>();

  // Category keyword mapping
  const categoryMap: Record<string, string[]> = {
    "Food & Dining": [
      "food",
      "foodie",
      "cooking",
      "recipe",
      "meal",
      "restaurant",
      "chef",
      "yummy",
      "delicious",
    ],
    "Fashion & Style": [
      "fashion",
      "style",
      "outfit",
      "ootd",
      "clothing",
      "wear",
      "look",
      "trend",
    ],
    "Fitness & Sports": [
      "fitness",
      "workout",
      "gym",
      "exercise",
      "health",
      "sport",
      "training",
      "bodybuilding",
    ],
    "Travel & Nature": [
      "travel",
      "nature",
      "adventure",
      "explore",
      "trip",
      "vacation",
      "wanderlust",
      "tourism",
    ],
    "Beauty & Makeup": [
      "beauty",
      "makeup",
      "skincare",
      "cosmetics",
      "makeupartist",
      "beautyblogger",
    ],
    Technology: [
      "tech",
      "technology",
      "gadget",
      "innovation",
      "digital",
      "software",
    ],
    Lifestyle: [
      "lifestyle",
      "life",
      "daily",
      "routine",
      "motivation",
      "inspiration",
    ],
    Photography: [
      "photography",
      "photo",
      "photographer",
      "photooftheday",
      "picoftheday",
    ],
    "Art & Design": ["art", "design", "creative", "artist", "artwork"],
    Business: ["business", "entrepreneur", "startup", "marketing", "brand"],
  };

  // Check each category
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((keyword) => termsLower.includes(keyword))) {
      categories.add(category);
    }
  }

  return Array.from(categories).slice(0, 3);
}

/**
 * Detects call-to-action phrases in caption
 *
 * @param caption - Caption text
 * @returns True if CTA detected
 */
function detectCallToAction(caption: string): boolean {
  const lowerCaption = caption.toLowerCase();

  const ctaPhrases = [
    "link in bio",
    "check out",
    "swipe up",
    "click link",
    "shop now",
    "buy now",
    "learn more",
    "sign up",
    "follow me",
    "subscribe",
    "dm me",
    "comment below",
    "tag a friend",
    "share this",
  ];

  return ctaPhrases.some((phrase) => lowerCaption.includes(phrase));
}

/**
 * Checks if word is a common stop word
 *
 * @param word - Word to check
 * @returns True if stop word
 */
function isStopWord(word: string): boolean {
  const stopWords = [
    "the",
    "and",
    "for",
    "that",
    "this",
    "with",
    "from",
    "have",
    "been",
    "were",
    "they",
    "what",
    "when",
    "where",
    "which",
    "their",
    "there",
    "would",
    "could",
    "about",
  ];

  return stopWords.includes(word);
}
