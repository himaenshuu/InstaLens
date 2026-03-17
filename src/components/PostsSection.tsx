import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Heart,
  MessageCircle,
  Bookmark,
  RefreshCw,
  Rss,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { apiService, PostData, ProfileData } from "../services/api";
import { ContentInsightsTags } from "./ContentInsights";
import { analyzePost, getVisionApiKey } from "../services/analysisIntegration";
import { AnalysisResult } from "../services/contentAnalysis";

interface PostsSectionProps {
  isVisible?: boolean;
  profileData?: ProfileData & { posts?: PostData[] };
}
export function PostsSection({
  isVisible = true,
  profileData,
}: PostsSectionProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
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

  const loadPosts = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const result = await apiService.fetchPosts(pageNum, 9);

      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts((prev) => [...prev, ...result.posts]);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const scrapedPosts = profileData?.posts;
    if (Array.isArray(scrapedPosts) && scrapedPosts.length > 0) {
      const initialPageSize = 9;
      setPosts(scrapedPosts.slice(0, initialPageSize));
      setHasMore(scrapedPosts.length > initialPageSize);
      setPage(1);
      setError(null);
      setIsLoading(false);
      return;
    }

    setPage(1);
    loadPosts(1, true);
  }, [
    isVisible,
    loadPosts,
    profileData?.username,
    profileData?.postsCount,
    profileData?.followers,
  ]);

  // Analyze posts when they're loaded
  useEffect(() => {
    const analyzePosts = async () => {
      if (posts.length === 0 || isAnalyzing) return;

      setIsAnalyzing(true);
      const apiKey = getVisionApiKey();
      const config = { visionApiKey: apiKey, analyzeVideos: false };

      const newResults = new Map(analysisResults);

      // Analyze posts that don't have results yet
      for (const post of posts) {
        if (!newResults.has(post.id)) {
          try {
            // Convert PostData to format expected by analyzePost
            const postData = {
              image: post.image, // Use 'image' property, not 'url'
              caption: post.caption,
              type: "image" as const,
            };

            const result = await analyzePost(postData, config);
            if (result) {
              newResults.set(post.id, result);
              // Update state immediately so user sees progressive results
              setAnalysisResults(new Map(newResults));
            }

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (err) {
            console.error(`Failed to analyze post ${post.id}:`, err);
          }
        }
      }

      setIsAnalyzing(false);
    };

    analyzePosts();
  }, [posts]); // Deliberately excluding analysisResults and isAnalyzing to avoid loops

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadPosts(1, true);
  };
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const truncateCaption = (caption: string, maxLength: number = 80) => {
    if (caption.length <= maxLength) return caption;
    return caption.substring(0, maxLength) + "...";
  };

  const PostSkeleton = () => (
    <Card className="border-0 shadow-sm overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-16" />
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
      {/* Live Feed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rss className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Live Instagram Feed</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && posts.length === 0
          ? Array.from({ length: 9 }).map((_, i) => <PostSkeleton key={i} />)
          : posts.map((post) => (
              <Card
                key={post.id}
                className="border-0 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    >
                      <Bookmark className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Live indicator */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-600 text-white border-0"
                    >
                      Live
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed">
                      {truncateCaption(post.caption)}
                    </p>

                    {/* Content Analysis Tags */}
                    {analysisResults.get(post.id) && (
                      <div className="pt-2 border-t border-border/50">
                        <ContentInsightsTags
                          insights={analysisResults.get(post.id)!.insights}
                        />
                      </div>
                    )}

                    {/* Analysis Loading Indicator */}
                    {!analysisResults.get(post.id) && isAnalyzing && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        <span>Analyzing content...</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">
                            {formatNumber(post.likes)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            {formatNumber(post.comments)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {post.timestamp}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Load More Button */}
      {hasMore && posts.length > 0 && (
        <div className="text-center pt-4">
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
              "Load More Posts"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
