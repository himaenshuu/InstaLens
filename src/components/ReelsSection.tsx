import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Heart,
  MessageCircle,
  Eye,
  Play,
  RefreshCw,
  Rss,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { apiService, ReelData } from "../services/api";
import { ContentInsightsTags } from "./ContentInsights";
import { analyzePost, getVisionApiKey } from "../services/analysisIntegration";
import { AnalysisResult } from "../services/contentAnalysis";

interface ReelsSectionProps {
  isVisible?: boolean;
}
export function ReelsSection({ isVisible = true }: ReelsSectionProps) {
  const [reels, setReels] = useState<ReelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Content analysis state
  const [analysisResults, setAnalysisResults] = useState<
    Map<string, AnalysisResult>
  >(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadReels = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const result = await apiService.fetchReels(pageNum, 5);

      if (reset) {
        setReels(result.reels);
      } else {
        setReels((prev) => [...prev, ...result.reels]);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      setError("Failed to load reels. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      loadReels(1, true);
    }
  }, [isVisible, loadReels]);

  // Analyze reels when they're loaded
  useEffect(() => {
    const analyzeReels = async () => {
      if (reels.length === 0 || isAnalyzing) return;

      setIsAnalyzing(true);
      const apiKey = getVisionApiKey();
      const config = { visionApiKey: apiKey, analyzeVideos: true };

      const newResults = new Map(analysisResults);

      // Analyze reels that don't have results yet
      for (const reel of reels) {
        if (!newResults.has(reel.id)) {
          try {
            // Convert ReelData to format expected by analyzePost
            // For reels, we analyze the thumbnail
            const reelData = {
              thumbnail: reel.thumbnail, // Use 'thumbnail' property
              caption: reel.caption,
              type: "video" as const,
            };

            const result = await analyzePost(reelData, config);
            if (result) {
              newResults.set(reel.id, result);
              // Update state immediately so user sees progressive results
              setAnalysisResults(new Map(newResults));
            }

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (err) {
            console.error(`Failed to analyze reel ${reel.id}:`, err);
          }
        }
      }

      setIsAnalyzing(false);
    };

    analyzeReels();
  }, [reels]); // Deliberately excluding analysisResults and isAnalyzing to avoid loops

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadReels(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadReels(1, true);
  };
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const ReelSkeleton = () => (
    <Card className="flex-shrink-0 w-[280px] border-0 shadow-sm overflow-hidden">
      <Skeleton className="aspect-[9/16] w-full" />
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rss className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">Live Reels Feed</span>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <ScrollArea className="w-full scroll-left">
        <div className="flex gap-4 pb-4">
          {isLoading && reels.length === 0
            ? Array.from({ length: 5 }).map((_, i) => <ReelSkeleton key={i} />)
            : reels.map((reel) => (
                <Card
                  key={reel.id}
                  className="flex-shrink-0 w-[280px] border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="relative aspect-[9/16] overflow-hidden">
                    <ImageWithFallback
                      src={reel.thumbnail}
                      alt="Reel thumbnail"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        <Play
                          className="h-5 w-5 text-white ml-0.5"
                          fill="white"
                        />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-black/70 text-white border-0"
                      >
                        {reel.duration}
                      </Badge>
                    </div>

                    {/* Live Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-purple-600 text-white border-0"
                      >
                        Live
                      </Badge>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Stats Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {formatNumber(reel.views)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {formatNumber(reel.likes)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {formatNumber(reel.comments)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium line-clamp-2 leading-relaxed">
                        {reel.caption}
                      </p>

                      {/* Content Analysis Tags */}
                      {analysisResults.get(reel.id) && (
                        <div className="pt-2 border-t border-border/50">
                          <ContentInsightsTags
                            insights={analysisResults.get(reel.id)!.insights}
                          />
                        </div>
                      )}

                      {/* Analysis Loading Indicator */}
                      {!analysisResults.get(reel.id) && isAnalyzing && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3 animate-pulse" />
                          <span>Analyzing...</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          ▶️ Reel
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {reel.timestamp}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </ScrollArea>

      {/* Load More Button */}
      {hasMore && reels.length > 0 && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={isLoadingMore}
            className="min-w-32"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Reels"
            )}
          </Button>
        </div>
      )}

      {/* Mobile Grid View */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        {reels.slice(0, 4).map((reel) => (
          <Card
            key={`mobile-${reel.id}`}
            className="border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="relative aspect-[9/16] overflow-hidden">
              <ImageWithFallback
                src={reel.thumbnail}
                alt="Reel thumbnail"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
                </div>
              </div>

              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-black/70 text-white border-0"
                >
                  {reel.duration}
                </Badge>
              </div>

              <div className="absolute top-2 left-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-600 text-white border-0"
                >
                  Live
                </Badge>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-2 left-2 right-2 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span>{formatNumber(reel.views)}</span>
                    <span>{formatNumber(reel.likes)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
