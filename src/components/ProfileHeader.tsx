import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ProfileData } from "../services/api";
import { createProxiedImageUrl } from "../utils/imageProxy";

interface ProfileHeaderProps {
  profileData?: ProfileData;
  isLoading?: boolean;
}

export function ProfileHeader({
  profileData,
  isLoading = false,
}: ProfileHeaderProps) {
  // Debug: Log what URL ProfileHeader received
  if (profileData?.profileImage) {
    console.log(
      "🖼️ ProfileHeader received profileImage:",
      profileData.profileImage
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <Card className="border border-white/20 shadow-2xl shadow-purple-500/10 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-3xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center justify-center gap-6 py-8">
            <div className="relative">
              <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white/20 dark:bg-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-purple-500 to-blue-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">
                  Scraping Instagram data in real-time...
                </span>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Powered by Apify Technology • This may take 10-30 seconds
              </p>
            </div>

            {/* Simplified skeleton for layout */}
            <div className="w-full max-w-md space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-6 w-32 bg-white/20 dark:bg-white/10 rounded-xl" />
                <Skeleton className="h-5 w-16 bg-white/20 dark:bg-white/10 rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-5 w-12 mb-1 mx-auto bg-white/20 dark:bg-white/10 rounded-xl" />
                    <Skeleton className="h-4 w-10 mx-auto bg-white/20 dark:bg-white/10 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profileData) return null;

  return (
    <Card className="border border-white/20 shadow-2xl shadow-purple-500/10 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-3xl transition-all duration-500 hover:shadow-purple-500/20 hover:scale-[1.02]">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture */}
          <div className="relative group">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-gradient-to-r from-purple-500 to-blue-500 ring-offset-4 ring-offset-background transition-all duration-300 group-hover:scale-110">
              <AvatarImage
                src={createProxiedImageUrl(profileData.profileImage)}
                alt={profileData.name}
              />
              <AvatarFallback className="text-lg md:text-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                {profileData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {profileData.name}
                </h1>
                {profileData.isVerified && (
                  <Badge className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg shadow-blue-500/25">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground/80">
                @{profileData.username}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 md:gap-8 max-w-md mx-auto md:mx-0 mb-4">
              <div className="text-center md:text-left group cursor-pointer">
                <div className="font-bold text-lg md:text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {formatNumber(
                    profileData.postsCount ||
                      (typeof profileData.posts === "number"
                        ? profileData.posts
                        : 0)
                  )}
                </div>
                <div className="text-muted-foreground/80 text-sm">Posts</div>
              </div>
              <div className="text-center md:text-left group cursor-pointer">
                <div className="font-bold text-lg md:text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {formatNumber(profileData.followers)}
                </div>
                <div className="text-muted-foreground/80 text-sm">
                  Followers
                </div>
              </div>
              <div className="text-center md:text-left group cursor-pointer">
                <div className="font-bold text-lg md:text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {formatNumber(profileData.following)}
                </div>
                <div className="text-muted-foreground/80 text-sm">
                  Following
                </div>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="text-center md:text-left max-w-2xl">
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  {profileData.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Apify Attribution */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-xs text-muted-foreground/80">
                Live data
              </span>
            </div>
            <span className="text-xs text-muted-foreground/60">•</span>
            <span className="text-xs text-muted-foreground/80">
              Data powered by Apify
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
