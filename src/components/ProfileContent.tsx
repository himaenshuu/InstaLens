import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { PostsSection } from "./PostsSection";
import { ReelsSection } from "./ReelsSection";
import { AnalyticsSection } from "./AnalyticsSection";
import { ProfileData, PostData, ReelData } from "../services/api";

interface Post {
  id: string;
  image: string;
  likes: number;
  comments: number;
}

interface ProfileContentProps {
  activeTab: string;
  profileData?: ProfileData & { posts?: PostData[]; reels?: ReelData[] };
}

export function ProfileContent({
  activeTab,
  profileData,
}: ProfileContentProps) {
  // Mock data for demonstration - keeping for Recent Highlights section
  const mockPosts: Post[] = Array.from({ length: 4 }, (_, i) => ({
    id: `post-${i + 1}`,
    image: `https://images.unsplash.com/photo-${
      1500000000000 + i
    }?w=300&h=300&fit=crop`,
    likes: Math.floor(Math.random() * 10000) + 100,
    comments: Math.floor(Math.random() * 500) + 10,
  }));

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  if (activeTab === "overview") {
    return (
      <div className="space-y-8">
        {/* About Section */}
        <Card className="border border-white/20 shadow-2xl shadow-purple-500/10 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-3xl transition-all duration-500 hover:shadow-purple-500/20 hover:scale-[1.02]">
          <CardContent className="p-8">
            <h2 className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              About
            </h2>
            <p className="text-muted-foreground/80 mb-6 leading-relaxed">
              {profileData?.bio || "No bio available for this profile."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(profileData?.followers || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(profileData?.following || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="text-center p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatNumber(
                    profileData?.postsCount ||
                      (typeof profileData?.posts === "number"
                        ? profileData.posts
                        : 0)
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData?.isVerified && (
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 backdrop-blur-sm">
                  ✓ Verified
                </Badge>
              )}
              <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 backdrop-blur-sm">
                @{profileData?.username}
              </Badge>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 backdrop-blur-sm">
                Instagram Profile
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Highlights Section */}
        <Card className="border border-white/20 shadow-2xl shadow-purple-500/10 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-3xl transition-all duration-500 hover:shadow-purple-500/20 hover:scale-[1.02]">
          <CardContent className="p-8">
            <h2 className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Recent Highlights
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(profileData?.posts?.slice(0, 4) || mockPosts).map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <ImageWithFallback
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4">
                    <div className="text-white text-center backdrop-blur-sm bg-white/10 rounded-xl p-3 shadow-lg">
                      <div className="flex items-center gap-3 text-sm">
                        <span>❤️ {formatNumber(post.likes)}</span>
                        <span>💬 {formatNumber(post.comments)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle other tabs
  if (activeTab === "posts") {
    return <PostsSection profileData={profileData} />;
  }

  if (activeTab === "reels") {
    return <ReelsSection />;
  }

  if (activeTab === "analytics") {
    return <AnalyticsSection />;
  }

  return null;
}
