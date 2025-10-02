/**
 * Google Cloud Vision API Service
 *
 * Implements image analysis using Google Cloud Vision API
 * Reference: https://cloud.google.com/vision/docs/samples
 *
 * Features:
 * - Label detection (objects, scenes)
 * - Text detection (OCR)
 * - Face detection
 * - Dominant colors
 * - Safe search (content moderation)
 * - Automatic fallback to caption analysis
 */

export interface VisionLabel {
  description: string;
  score: number;
  topicality?: number;
}

export interface VisionText {
  description: string;
  locale?: string;
}

export interface VisionFace {
  detectionConfidence: number;
  joyLikelihood: string;
  sorrowLikelihood: string;
  angerLikelihood: string;
  surpriseLikelihood: string;
}

export interface VisionColor {
  red: number;
  green: number;
  blue: number;
  score: number;
  pixelFraction: number;
}

export interface VisionSafeSearch {
  adult: string;
  spoof: string;
  medical: string;
  violence: string;
  racy: string;
}

export interface VisionAnalysisResult {
  labels: VisionLabel[];
  text: string[];
  faces: {
    count: number;
    emotions: string[];
  };
  colors: VisionColor[];
  safeSearch: VisionSafeSearch | null;
  error?: string;
}

export interface ContentInsights {
  // High-level categorization
  contentType: string;
  topics: string[];
  descriptiveTags: string[]; // Enhanced auto-generated keywords

  // Visual analysis
  objects: string[];
  scene: string;
  
  // Vibe/Ambience classification
  vibe: {
    primary: string; // Main vibe: 'casual', 'aesthetic', 'luxury', 'energetic', etc.
    secondary?: string; // Optional secondary vibe
    intensity: 'subtle' | 'moderate' | 'strong'; // How pronounced the vibe is
  };

  // Quality indicators
  quality: {
    lighting: 'poor' | 'good' | 'excellent' | 'professional';
    visualAppeal: number; // 0-100 score
    composition: 'poor' | 'average' | 'good' | 'excellent';
    clarity: 'low' | 'medium' | 'high';
  };

  // People analysis
  peopleCount: number;
  emotions: string[];

  // Text in image
  textDetected: string[];

  // Colors
  dominantColors: string[];

  // Metadata
  isAppropriate: boolean;
  confidence: number;
}

/**
 * Analyzes an image using Google Cloud Vision API
 *
 * @param imageUrl - URL of the image to analyze
 * @param apiKey - Google Cloud API key
 * @returns Vision analysis result with fallback handling
 */
export async function analyzeImageWithVision(
  imageUrl: string,
  apiKey: string
): Promise<VisionAnalysisResult> {
  try {
    // Google Cloud Vision API endpoint
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    // Build request body following official documentation
    // https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate
    const requestBody = {
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl,
            },
          },
          features: [
            { type: "LABEL_DETECTION", maxResults: 10 },
            { type: "TEXT_DETECTION", maxResults: 5 },
            { type: "FACE_DETECTION", maxResults: 10 },
            { type: "IMAGE_PROPERTIES", maxResults: 10 },
            { type: "SAFE_SEARCH_DETECTION" },
          ],
        },
      ],
    };

    // Call Google Cloud Vision API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.responses[0];

    // Check for API errors
    if (result.error) {
      throw new Error(result.error.message);
    }

    // Parse labels (objects, scenes, concepts)
    const labels: VisionLabel[] = (result.labelAnnotations || []).map(
      (label: any) => ({
        description: label.description,
        score: label.score,
        topicality: label.topicality,
      })
    );

    // Parse text detections (OCR)
    const textAnnotations = result.textAnnotations || [];
    const text: string[] = textAnnotations
      .slice(0, 5) // First 5 text detections
      .map((t: any) => t.description);

    // Parse face detections
    const faceAnnotations = result.faceAnnotations || [];
    const faces = {
      count: faceAnnotations.length,
      emotions: extractEmotions(faceAnnotations),
    };

    // Parse dominant colors
    const imageProperties = result.imagePropertiesAnnotation;
    const colors: VisionColor[] = imageProperties?.dominantColors?.colors || [];

    // Parse safe search
    const safeSearch: VisionSafeSearch | null =
      result.safeSearchAnnotation || null;

    return {
      labels,
      text,
      faces,
      colors,
      safeSearch,
    };
  } catch (error) {
    console.error("Google Vision API error:", error);

    // Return empty result on error (fallback will handle this)
    return {
      labels: [],
      text: [],
      faces: { count: 0, emotions: [] },
      colors: [],
      safeSearch: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extracts dominant emotions from face annotations
 *
 * @param faceAnnotations - Array of face detection results
 * @returns Array of detected emotions
 */
function extractEmotions(faceAnnotations: any[]): string[] {
  const emotions = new Set<string>();

  faceAnnotations.forEach((face) => {
    // Check likelihood levels (VERY_LIKELY, LIKELY, POSSIBLE)
    if (["VERY_LIKELY", "LIKELY"].includes(face.joyLikelihood)) {
      emotions.add("happy");
    }
    if (["VERY_LIKELY", "LIKELY"].includes(face.sorrowLikelihood)) {
      emotions.add("sad");
    }
    if (["VERY_LIKELY", "LIKELY"].includes(face.angerLikelihood)) {
      emotions.add("angry");
    }
    if (["VERY_LIKELY", "LIKELY"].includes(face.surpriseLikelihood)) {
      emotions.add("surprised");
    }
  });

  return Array.from(emotions);
}

/**
 * Classifies the vibe/ambience of the content based on labels, colors, and context
 * 
 * @param labels - Detected labels from Vision API
 * @param colors - Dominant colors
 * @param peopleCount - Number of people detected
 * @returns Vibe classification with intensity
 */
function classifyVibe(
  labels: VisionLabel[],
  colors: VisionColor[],
  peopleCount: number
): ContentInsights['vibe'] {
  const labelText = labels.map(l => l.description.toLowerCase()).join(' ');
  const topLabels = labels.slice(0, 5).map(l => l.description.toLowerCase());
  
  // Analyze color palette for luxury indicators
  const hasGold = colors.some(c => c.red > 200 && c.green > 170 && c.blue < 100);
  const hasDarkTones = colors.some(c => c.red < 80 && c.green < 80 && c.blue < 80);
  const hasBrightColors = colors.some(c => Math.max(c.red, c.green, c.blue) > 220);
  
  // Luxury/Lavish indicators
  const luxuryKeywords = ['luxury', 'elegant', 'premium', 'lavish', 'expensive', 'sophisticated', 'upscale', 'exclusive', 'designer', 'high-end'];
  const isLuxury = luxuryKeywords.some(k => labelText.includes(k)) || hasGold;
  
  // Aesthetic indicators
  const aestheticKeywords = ['aesthetic', 'artistic', 'beautiful', 'symmetry', 'minimal', 'clean', 'modern', 'design', 'style', 'creative'];
  const isAesthetic = aestheticKeywords.some(k => labelText.includes(k)) || (hasDarkTones && !hasBrightColors);
  
  // Energetic/Party indicators
  const energeticKeywords = ['party', 'crowd', 'festival', 'concert', 'dance', 'celebration', 'nightlife', 'club', 'energy', 'dynamic'];
  const isEnergetic = energeticKeywords.some(k => labelText.includes(k)) || (peopleCount > 3 && hasBrightColors);
  
  // Casual indicators
  const casualKeywords = ['casual', 'everyday', 'simple', 'relaxed', 'comfort', 'daily', 'routine', 'ordinary'];
  const isCasual = casualKeywords.some(k => labelText.includes(k));
  
  // Travel/Adventure indicators
  const travelKeywords = ['travel', 'vacation', 'adventure', 'explore', 'journey', 'destination', 'tourism', 'outdoor'];
  const isTravel = travelKeywords.some(k => labelText.includes(k));
  
  // Professional/Corporate indicators
  const professionalKeywords = ['professional', 'business', 'corporate', 'office', 'formal', 'meeting', 'conference'];
  const isProfessional = professionalKeywords.some(k => labelText.includes(k));
  
  // Nature/Calm indicators
  const natureKeywords = ['nature', 'peaceful', 'calm', 'serene', 'tranquil', 'zen', 'natural', 'organic'];
  const isNature = natureKeywords.some(k => labelText.includes(k));
  
  // Calculate intensity based on label scores
  const avgScore = labels.slice(0, 3).reduce((sum, l) => sum + l.score, 0) / Math.min(3, labels.length);
  const intensity: 'subtle' | 'moderate' | 'strong' = 
    avgScore > 0.85 ? 'strong' : avgScore > 0.7 ? 'moderate' : 'subtle';
  
  // Determine primary and secondary vibes
  if (isLuxury) {
    return {
      primary: 'luxury',
      secondary: isAesthetic ? 'aesthetic' : isProfessional ? 'professional' : undefined,
      intensity
    };
  }
  
  if (isEnergetic) {
    return {
      primary: 'energetic',
      secondary: isTravel ? 'adventure' : 'party',
      intensity: 'strong'
    };
  }
  
  if (isAesthetic) {
    return {
      primary: 'aesthetic',
      secondary: isNature ? 'natural' : 'minimalist',
      intensity
    };
  }
  
  if (isTravel) {
    return {
      primary: 'adventure',
      secondary: isNature ? 'natural' : 'exploratory',
      intensity
    };
  }
  
  if (isProfessional) {
    return {
      primary: 'professional',
      secondary: 'corporate',
      intensity
    };
  }
  
  if (isNature) {
    return {
      primary: 'natural',
      secondary: 'calm',
      intensity
    };
  }
  
  // Default to casual
  return {
    primary: isCasual || peopleCount > 0 ? 'casual' : 'general',
    secondary: peopleCount > 0 ? 'social' : undefined,
    intensity
  };
}

/**
 * Analyzes image quality indicators from Vision API data
 * 
 * @param labels - Detected labels
 * @param colors - Color information
 * @param confidence - Overall detection confidence
 * @returns Quality metrics
 */
function analyzeQuality(
  labels: VisionLabel[],
  colors: VisionColor[],
  confidence: number
): ContentInsights['quality'] {
  const labelText = labels.map(l => l.description.toLowerCase()).join(' ');
  
  // Lighting analysis from labels and colors
  const lightingKeywords = {
    excellent: ['studio', 'professional', 'illuminated', 'bright', 'well-lit'],
    good: ['natural light', 'daylight', 'clear', 'sunny'],
    poor: ['dark', 'shadow', 'dim', 'low light', 'night', 'underexposed']
  };
  
  let lighting: ContentInsights['quality']['lighting'] = 'good';
  if (lightingKeywords.excellent.some(k => labelText.includes(k))) {
    lighting = 'excellent';
  } else if (lightingKeywords.poor.some(k => labelText.includes(k))) {
    lighting = 'poor';
  }
  
  // Check for professional indicators
  if (['professional', 'studio', 'commercial', 'advertising'].some(k => labelText.includes(k))) {
    lighting = 'professional';
  }
  
  // Visual appeal score based on multiple factors
  let visualAppeal = Math.round(confidence * 100);
  
  // Boost for aesthetic indicators
  if (['aesthetic', 'beautiful', 'stunning', 'gorgeous'].some(k => labelText.includes(k))) {
    visualAppeal = Math.min(100, visualAppeal + 15);
  }
  
  // Boost for color harmony (similar colors or complementary)
  if (colors.length >= 2) {
    const colorVariance = calculateColorVariance(colors);
    if (colorVariance < 50) visualAppeal = Math.min(100, visualAppeal + 10); // Monochromatic
  }
  
  // Composition analysis
  const compositionKeywords = {
    excellent: ['symmetry', 'balance', 'composition', 'framing'],
    good: ['centered', 'focus', 'sharp'],
    poor: ['blurry', 'unfocused', 'cropped']
  };
  
  let composition: ContentInsights['quality']['composition'] = 'average';
  if (compositionKeywords.excellent.some(k => labelText.includes(k))) {
    composition = 'excellent';
  } else if (compositionKeywords.good.some(k => labelText.includes(k))) {
    composition = 'good';
  } else if (compositionKeywords.poor.some(k => labelText.includes(k))) {
    composition = 'poor';
  } else if (confidence > 0.85) {
    composition = 'good';
  }
  
  // Clarity based on confidence and labels
  const clarity: ContentInsights['quality']['clarity'] = 
    confidence > 0.85 && !labelText.includes('blurry') ? 'high' :
    confidence > 0.7 ? 'medium' : 'low';
  
  return {
    lighting,
    visualAppeal,
    composition,
    clarity
  };
}

/**
 * Calculates color variance for harmony detection
 */
function calculateColorVariance(colors: VisionColor[]): number {
  if (colors.length < 2) return 0;
  
  const avgR = colors.reduce((sum, c) => sum + c.red, 0) / colors.length;
  const avgG = colors.reduce((sum, c) => sum + c.green, 0) / colors.length;
  const avgB = colors.reduce((sum, c) => sum + c.blue, 0) / colors.length;
  
  const variance = colors.reduce((sum, c) => {
    return sum + Math.abs(c.red - avgR) + Math.abs(c.green - avgG) + Math.abs(c.blue - avgB);
  }, 0) / colors.length;
  
  return variance;
}

/**
 * Generates enhanced descriptive tags from labels
 * 
 * @param labels - Vision API labels
 * @param contentType - Detected content type
 * @returns Array of smart, descriptive tags
 */
function generateDescriptiveTags(
  labels: VisionLabel[],
  contentType: string
): string[] {
  const tags = new Set<string>();
  
  // Add high-confidence labels as tags
  labels
    .filter(l => l.score > 0.6)
    .slice(0, 15)
    .forEach(l => {
      const tag = l.description.toLowerCase();
      tags.add(tag);
      
      // Add related contextual tags
      if (tag.includes('food')) tags.add('culinary');
      if (tag.includes('fashion') || tag.includes('clothing')) tags.add('style');
      if (tag.includes('nature') || tag.includes('outdoor')) tags.add('outdoor');
      if (tag.includes('person') || tag.includes('people')) tags.add('portrait');
      if (tag.includes('city') || tag.includes('urban')) tags.add('urban');
      if (tag.includes('beach') || tag.includes('ocean')) tags.add('coastal');
      if (tag.includes('night')) tags.add('nighttime');
      if (tag.includes('car') || tag.includes('vehicle')) tags.add('automotive');
    });
  
  // Add content type as tag
  tags.add(contentType.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'));
  
  return Array.from(tags).slice(0, 20);
}

/**
 * Converts Vision API result to user-friendly content insights
 *
 * @param visionResult - Raw Vision API result
 * @returns Formatted content insights
 */
export function formatContentInsights(
  visionResult: VisionAnalysisResult
): ContentInsights {
  // Determine content type from labels
  const contentType = determineContentType(visionResult.labels);

  // Extract top topics (labels with high confidence)
  const topics = visionResult.labels
    .filter((label) => label.score > 0.7)
    .map((label) => label.description.toLowerCase())
    .slice(0, 5);

  // Extract objects (labels with medium confidence)
  const objects = visionResult.labels
    .filter((label) => label.score > 0.5)
    .map((label) => label.description)
    .slice(0, 10);

  // Determine scene (highest confidence label)
  const scene = visionResult.labels[0]?.description || "Unknown";

  // Get dominant colors in hex format
  const dominantColors = visionResult.colors
    .slice(0, 3)
    .map((color) => rgbToHex(color.red, color.green, color.blue));

  // Check if content is appropriate
  const isAppropriate = checkContentSafety(visionResult.safeSearch);

  // Calculate overall confidence
  const confidence = calculateConfidence(visionResult.labels);

  // Generate enhanced descriptive tags
  const descriptiveTags = generateDescriptiveTags(visionResult.labels, contentType);

  // Classify vibe/ambience
  const vibe = classifyVibe(visionResult.labels, visionResult.colors, visionResult.faces.count);

  // Analyze quality indicators
  const quality = analyzeQuality(visionResult.labels, visionResult.colors, confidence);

  return {
    contentType,
    topics,
    descriptiveTags,
    objects,
    scene,
    vibe,
    quality,
    peopleCount: visionResult.faces.count,
    emotions: visionResult.faces.emotions,
    textDetected: visionResult.text,
    dominantColors,
    isAppropriate,
    confidence,
  };
}

/**
 * Determines content type from detected labels
 *
 * @param labels - Array of detected labels
 * @returns Content type category
 */
function determineContentType(labels: VisionLabel[]): string {
  const labelText = labels.map((l) => l.description.toLowerCase()).join(" ");

  // Content type mapping
  const typeKeywords = {
    "Food & Dining": ["food", "meal", "dish", "cuisine", "restaurant"],
    "Fashion & Style": ["fashion", "clothing", "outfit", "style", "apparel"],
    "Fitness & Sports": ["fitness", "sport", "exercise", "gym", "athletic"],
    "Travel & Nature": ["travel", "landscape", "nature", "outdoor", "scenery"],
    "Beauty & Makeup": ["beauty", "makeup", "cosmetic", "skincare"],
    Technology: ["technology", "gadget", "device", "electronic", "computer"],
    "People & Lifestyle": ["person", "people", "portrait", "selfie"],
    "Product & Commercial": ["product", "commercial", "brand", "advertisement"],
    "Art & Design": ["art", "design", "creative", "illustration"],
    "Event & Celebration": ["event", "party", "celebration", "festival"],
  };

  // Find matching category
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((keyword) => labelText.includes(keyword))) {
      return type;
    }
  }

  return "General Content";
}

/**
 * Checks if content is safe/appropriate
 *
 * @param safeSearch - Safe search detection result
 * @returns True if content is appropriate
 */
function checkContentSafety(safeSearch: VisionSafeSearch | null): boolean {
  if (!safeSearch) return true;

  const unsafe = ["LIKELY", "VERY_LIKELY"];

  return (
    !unsafe.includes(safeSearch.adult) &&
    !unsafe.includes(safeSearch.violence) &&
    !unsafe.includes(safeSearch.racy)
  );
}

/**
 * Calculates overall confidence score
 *
 * @param labels - Array of detected labels
 * @returns Confidence score (0-1)
 */
function calculateConfidence(labels: VisionLabel[]): number {
  if (labels.length === 0) return 0;

  const avgScore =
    labels.reduce((sum, label) => sum + label.score, 0) / labels.length;

  return Math.round(avgScore * 100) / 100;
}

/**
 * Converts RGB color to hex format
 *
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
