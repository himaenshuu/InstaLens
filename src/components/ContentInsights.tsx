/**
 * Content Insights Component
 *
 * Displays analysis results from Google Vision API or caption fallback
 * Shows content type, tags, objects, emotions, and other metadata
 */

import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  ChevronDown,
  Eye,
  Tag,
  Users,
  Heart,
  Hash,
  AlertCircle,
} from "lucide-react";
import { ContentInsights } from "../services/visionService";
import { CaptionAnalysis } from "../services/contentAnalysis";

interface ContentInsightsProps {
  insights: ContentInsights;
  caption: CaptionAnalysis;
  source: "vision-api" | "caption-fallback" | "thumbnail-fallback";
  compact?: boolean;
}

/**
 * Displays content analysis insights with expandable details
 */
export function ContentInsightsDisplay({
  insights,
  caption,
  source,
  compact = false,
}: ContentInsightsProps) {
  // Compact view - show only essential tags
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {/* Content type badge */}
        <Badge
          variant="outline"
          className="bg-purple-500/10 border-purple-500/20"
        >
          <Tag className="h-3 w-3 mr-1" />
          {insights.contentType}
        </Badge>

        {/* Vibe badge */}
        {insights.vibe && (
          <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 text-xs">
            ✨ {insights.vibe.primary}
          </Badge>
        )}

        {/* Top 2 descriptive tags or topics */}
        {(insights.descriptiveTags && insights.descriptiveTags.length > 0 
          ? insights.descriptiveTags 
          : insights.topics
        ).slice(0, 2).map((tag: string, i: number) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}

        {/* People count if present */}
        {insights.peopleCount > 0 && (
          <Badge
            variant="outline"
            className="bg-blue-500/10 border-blue-500/20"
          >
            <Users className="h-3 w-3 mr-1" />
            {insights.peopleCount}{" "}
            {insights.peopleCount === 1 ? "person" : "people"}
          </Badge>
        )}

        {/* Show source indicator */}
        <Badge
          variant="outline"
          className="bg-gray-500/10 border-gray-500/20 text-xs"
        >
          {source === "vision-api" ? "🔍 Vision AI" : "📝 Caption"}
        </Badge>
      </div>
    );
  }

  // Full view - expandable card with all details
  return (
    <Collapsible>
      <Card className="border border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm font-medium">
                Content Analysis
              </CardTitle>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
          </CollapsibleTrigger>

          {/* Quick preview */}
          <CardDescription className="text-xs mt-2">
            {insights.contentType} •{" "}
            {insights.confidence > 0.7 ? "High" : "Medium"} confidence
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Content Type & Scene */}
            <div>
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                Classification
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30">
                  {insights.contentType}
                </Badge>
                {insights.scene && insights.scene !== "Unknown" && (
                  <Badge variant="outline">{insights.scene}</Badge>
                )}
              </div>
            </div>

            {/* Vibe & Ambience */}
            {insights.vibe && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                  Vibe & Ambience
                </h4>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30">
                    {insights.vibe.primary}
                  </Badge>
                  {insights.vibe.secondary && (
                    <Badge variant="outline" className="bg-purple-500/5 border-purple-500/20">
                      {insights.vibe.secondary}
                    </Badge>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      insights.vibe.intensity === 'strong' ? 'bg-orange-500/20 border-orange-500/30' :
                      insights.vibe.intensity === 'moderate' ? 'bg-yellow-500/20 border-yellow-500/30' :
                      'bg-gray-500/20 border-gray-500/30'
                    }`}
                  >
                    {insights.vibe.intensity}
                  </Badge>
                </div>
              </div>
            )}

            {/* Quality Metrics */}
            {insights.quality && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                  Quality Indicators
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Lighting:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        insights.quality.lighting === 'professional' ? 'bg-green-500/20 border-green-500/30' :
                        insights.quality.lighting === 'excellent' ? 'bg-blue-500/20 border-blue-500/30' :
                        insights.quality.lighting === 'good' ? 'bg-yellow-500/20 border-yellow-500/30' :
                        'bg-red-500/20 border-red-500/30'
                      }`}
                    >
                      {insights.quality.lighting}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Visual Appeal:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${insights.quality.visualAppeal}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-8 text-right">{insights.quality.visualAppeal}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Composition:</span>
                    <Badge variant="outline" className="text-xs">
                      {insights.quality.composition}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Clarity:</span>
                    <Badge variant="outline" className="text-xs">
                      {insights.quality.clarity}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Descriptive Tags */}
            {insights.descriptiveTags && insights.descriptiveTags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Descriptive Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {insights.descriptiveTags.slice(0, 15).map((tag: string, i: number) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Topics & Tags */}
            {insights.topics.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Topics
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {insights.topics.map((topic: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Objects Detected */}
            {insights.objects.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                  Objects Detected
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {insights.objects
                    .slice(0, 8)
                    .map((obj: string, i: number) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs bg-blue-500/5 border-blue-500/20"
                      >
                        {obj}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* People & Emotions */}
            {(insights.peopleCount > 0 || insights.emotions.length > 0) && (
              <div className="flex gap-4">
                {insights.peopleCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">
                      {insights.peopleCount}{" "}
                      {insights.peopleCount === 1 ? "person" : "people"}
                    </span>
                  </div>
                )}

                {insights.emotions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-muted-foreground">
                      {insights.emotions.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Text Detected */}
            {insights.textDetected.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                  Text in Image
                </h4>
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                  {insights.textDetected.slice(0, 3).join(" • ")}
                </div>
              </div>
            )}

            {/* Hashtags from Caption */}
            {caption.hashtags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Hashtags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {caption.hashtags.slice(0, 10).map((tag, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs bg-green-500/5 border-green-500/20"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sentiment & CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">
                  Sentiment:{" "}
                  <span
                    className={
                      caption.sentiment === "positive"
                        ? "text-green-500"
                        : caption.sentiment === "negative"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }
                  >
                    {caption.sentiment}
                  </span>
                </span>

                {caption.callToAction && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-orange-500/10 border-orange-500/20"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Call to Action
                  </Badge>
                )}
              </div>

              {/* Analysis source */}
              <span className="text-xs text-muted-foreground">
                {source === "vision-api" && "🔍 Vision AI"}
                {source === "thumbnail-fallback" && "🖼️ Thumbnail"}
                {source === "caption-fallback" && "📝 Caption"}
              </span>
            </div>

            {/* Dominant Colors */}
            {insights.dominantColors.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                  Dominant Colors
                </h4>
                <div className="flex gap-2">
                  {insights.dominantColors.map((color: string, i: number) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/**
 * Simple inline tags display (for grid views)
 */
export function ContentInsightsTags({
  insights,
}: {
  insights: ContentInsights;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <Badge
        variant="outline"
        className="text-xs bg-purple-500/10 border-purple-500/20"
      >
        {insights.contentType}
      </Badge>

      {/* Vibe badge */}
      {insights.vibe && (
        <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 text-xs">
          ✨ {insights.vibe.primary}
        </Badge>
      )}

      {insights.peopleCount > 0 && (
        <Badge
          variant="outline"
          className="text-xs bg-blue-500/10 border-blue-500/20"
        >
          <Users className="h-3 w-3 mr-1" />
          {insights.peopleCount}
        </Badge>
      )}

      {/* Show descriptive tags if available, otherwise topics */}
      {(insights.descriptiveTags && insights.descriptiveTags.length > 0 
        ? insights.descriptiveTags 
        : insights.topics
      ).slice(0, 2).map((tag: string, i: number) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
