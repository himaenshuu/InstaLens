import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileContent } from "./components/ProfileContent";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignUpPage } from "./components/SignUpPage";
import { AuthCallback } from "./components/AuthCallback";
import { SearchWithSuggestions } from "./components/SearchWithSuggestions";
import { UserAvatar } from "./components/UserAvatar";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { Toaster } from "./components/ui/sonner";
import { apiService, ProfileData } from "./services/api";
import { supabase } from "./utils/supabase/client";
import { generatePDFReport } from "./utils/pdfGenerator";
import {
  ArrowLeft,
  BarChart3,
  LayoutGrid,
  FileImage,
  Play,
  TrendingUp,
  Download,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { FloatingElements } from "./components/FloatingElements";
import { MobileMenu, MobileMenuItem } from "./components/MobileMenu";
import Kairo from "./components/Kairo";

function AppContent() {
  const [currentView, setCurrentView] = useState<
    "landing" | "login" | "signup" | "dashboard" | "auth-callback"
  >("landing");
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [searchedInfluencer, setSearchedInfluencer] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || "");

        // Restore last view state from localStorage
        const savedView = localStorage.getItem("instalens-last-view");
        const savedInfluencer = localStorage.getItem("instalens-last-search");

        if (savedView && savedView !== "landing") {
          setCurrentView(savedView as any);
          if (savedInfluencer) {
            setSearchedInfluencer(savedInfluencer);
            // Optionally reload the profile data
            loadProfile(savedInfluencer);
          }
        }

        toast.success("Welcome back!", {
          description: `Logged in as ${session.user.email}`,
          duration: 2000,
        });
      } else {
        // Clear saved state if not logged in
        localStorage.removeItem("instalens-last-view");
        localStorage.removeItem("instalens-last-search");
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || "");
        toast.success("Welcome back!", {
          description: `Signed in as ${session.user.email}`,
        });
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setUserEmail("");
        setCurrentView("landing");
        setProfileData(null);
        // Clear saved state on sign out
        localStorage.removeItem("instalens-last-view");
        localStorage.removeItem("instalens-last-search");
        toast.info("Signed out successfully");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for auth callback in URL
  useEffect(() => {
    if (
      window.location.pathname === "/auth/callback" ||
      window.location.hash.includes("access_token") ||
      window.location.hash.includes("error")
    ) {
      setCurrentView("auth-callback");
    }
  }, []);

  const loadProfile = async (username?: string) => {
    try {
      setIsLoadingProfile(true);

      if (username) {
        // Scrape real Instagram data
        setSearchedInfluencer(username);
        toast.loading(`Scraping @${username}'s profile...`, {
          description: "This may take 10-30 seconds",
          id: "scraping",
        });

        const scrapedData = await apiService.scrapeProfile(username);
        setProfileData(scrapedData);

        if (scrapedData.bio?.includes("Demo profile")) {
          toast.warning(`Demo data loaded for @${username}`, {
            description: "Real-time scraping temporarily unavailable",
            id: "scraping",
          });
        } else {
          toast.success(`Successfully scraped @${username}'s profile!`, {
            description: "Fresh data loaded from Instagram",
            id: "scraping",
          });
        }
      } else {
        // Load default/cached data
        const data = await apiService.fetchProfile();
        setProfileData(data);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast.error("Scraping failed", {
        description: `Unable to scrape profile: ${errorMessage}`,
        id: "scraping",
      });

      // Show error state but keep existing data if any
      if (!profileData) {
        const fallbackData = await apiService.fetchProfile();
        setProfileData(fallbackData);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSearchInfluencer = async (username: string) => {
    // Clean username (remove @ if present)
    const cleanUsername = username.replace("@", "");
    setCurrentView("dashboard");
    setActiveTab("overview");

    // Save to localStorage if logged in
    if (isLoggedIn) {
      localStorage.setItem("instalens-last-view", "dashboard");
      localStorage.setItem("instalens-last-search", cleanUsername);
    }

    await loadProfile(cleanUsername);

    // Show different messages based on auth status
    if (!isLoggedIn) {
      toast.info("Guest Access", {
        description: "Login for advanced analytics and unlimited searches",
        action: {
          label: "Login",
          onClick: () => setCurrentView("login"),
        },
      });
    }
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
    setProfileData(null);
    setSearchedInfluencer("");
    // Clear saved state when going back to landing
    localStorage.removeItem("instalens-last-view");
    localStorage.removeItem("instalens-last-search");
  };

  const handleLogin = () => {
    setCurrentView("login");
  };

  const handleSignUp = () => {
    setCurrentView("signup");
  };

  const handleLoginSuccess = () => {
    // After login, go back to landing page so user can search
    setCurrentView("landing");
    // Clear any previous search state
    setSearchedInfluencer("");
    setProfileData(null);
  };

  const handleSignUpSuccess = () => {
    setCurrentView("dashboard");
    if (searchedInfluencer) {
      loadProfile(searchedInfluencer);
    }
  };

  const handleAuthSuccess = () => {
    setCurrentView("dashboard");
    // Clear the callback URL
    window.history.replaceState({}, document.title, "/");
  };

  const handleDownloadReport = async () => {
    if (!profileData || !searchedInfluencer) {
      toast.error("No profile data available", {
        description: "Please search for an influencer first",
      });
      return;
    }

    try {
      toast.loading("Generating PDF report...", { id: "pdf-generation" });
      await generatePDFReport(profileData as any, searchedInfluencer);
      toast.success("Report generated!", {
        description: "Check your print dialog to save as PDF",
        id: "pdf-generation",
      });
    } catch (error) {
      toast.error("Failed to generate report", {
        description:
          error instanceof Error ? error.message : "Please try again",
        id: "pdf-generation",
      });
    }
  };

  const handleAuthError = (error: string) => {
    toast.error("Authentication failed", {
      description: error,
    });
    setCurrentView("landing");
    // Clear the callback URL
    window.history.replaceState({}, document.title, "/");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView("landing");
  };

  // Handle auth callback view
  if (currentView === "auth-callback") {
    return (
      <AuthCallback
        onAuthSuccess={handleAuthSuccess}
        onAuthError={handleAuthError}
      />
    );
  }

  // Handle different views
  if (currentView === "landing") {
    return <LandingPage onLogin={handleLogin} />;
  }

  if (currentView === "login") {
    return (
      <LoginPage
        onSignUp={handleSignUp}
        onBack={handleBackToLanding}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentView === "signup") {
    return (
      <SignUpPage
        onSignIn={handleLogin}
        onBack={handleBackToLanding}
        onSignUpSuccess={handleSignUpSuccess}
      />
    );
  }

  // Authentication gate for dashboard
  if (currentView === "dashboard" && !isLoggedIn) {
    toast.info("Authentication required", {
      description:
        "Please login to access the dashboard and search functionality",
    });
    setCurrentView("login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Interactive Elements */}
      <FloatingElements />

      {/* Glass Header */}
      <div className="border-b border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between p-3 md:p-4">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-base md:text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                InstaLens
              </span>
            </div>
          </div>

          {/* Right Section - Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {searchedInfluencer && profileData && isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchedInfluencer("");
                  setProfileData(null);
                  toast.info("Ready for new search", {
                    description: "Enter a username to search another profile",
                  });
                }}
                className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Another
              </Button>
            )}
            {searchedInfluencer && profileData && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
            {searchedInfluencer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadProfile(searchedInfluencer)}
                disabled={isLoadingProfile}
                className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                {isLoadingProfile ? "Refreshing..." : "Refresh Data"}
              </Button>
            )}
            {isLoggedIn && <UserAvatar userEmail={userEmail} />}
            {!isLoggedIn && <ThemeToggle />}
          </div>

          {/* Mobile Menu Button + Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <MobileMenu
              isOpen={mobileMenuOpen}
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {isLoggedIn && (
                <>
                  <div className="px-4 py-3 border-b border-white/10 mb-2">
                    <p className="text-xs text-muted-foreground">
                      Logged in as
                    </p>
                    <p className="text-sm font-medium truncate">{userEmail}</p>
                  </div>

                  {searchedInfluencer && profileData && (
                    <>
                      <MobileMenuItem
                        icon={<Search className="h-5 w-5" />}
                        onClick={() => {
                          setSearchedInfluencer("");
                          setProfileData(null);
                          setMobileMenuOpen(false);
                          toast.info("Ready for new search");
                        }}
                      >
                        Search Another Profile
                      </MobileMenuItem>

                      <MobileMenuItem
                        icon={<Download className="h-5 w-5" />}
                        onClick={() => {
                          handleDownloadReport();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Download Report
                      </MobileMenuItem>

                      <MobileMenuItem
                        icon={<TrendingUp className="h-5 w-5" />}
                        onClick={() => {
                          loadProfile(searchedInfluencer);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {isLoadingProfile ? "Refreshing..." : "Refresh Data"}
                      </MobileMenuItem>
                    </>
                  )}

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <MobileMenuItem
                      icon={<ArrowLeft className="h-5 w-5" />}
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </MobileMenuItem>
                  </div>
                </>
              )}

              {!isLoggedIn && (
                <MobileMenuItem
                  icon={<ArrowLeft className="h-5 w-5" />}
                  onClick={() => {
                    handleBackToLanding();
                    setMobileMenuOpen(false);
                  }}
                >
                  Back to Landing
                </MobileMenuItem>
              )}
            </MobileMenu>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Search Section - Only visible when logged in */}
        {!profileData && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 rounded-2xl p-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Search Instagram Influencers
                </h2>
                <p className="text-sm text-muted-foreground/70">
                  Search from previously scraped profiles or enter a new
                  username
                </p>
              </div>
              <SearchWithSuggestions
                onSearch={handleSearchInfluencer}
                isLoading={isLoadingProfile}
              />
            </div>
          </div>
        )}

        {/* Profile Header */}
        <ProfileHeader
          profileData={profileData || undefined}
          isLoading={isLoadingProfile}
        />

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 md:space-y-8"
        >
          {/* Mobile-Optimized Tabs - Horizontal Scroll */}
          <div className="flex justify-center overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex md:grid md:grid-cols-4 gap-2 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 rounded-2xl p-2 min-w-max">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 whitespace-nowrap touch-manipulation data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 rounded-xl transition-all duration-300 active:scale-95 md:hover:scale-105"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="flex items-center gap-2 whitespace-nowrap touch-manipulation data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 rounded-xl transition-all duration-300 active:scale-95 md:hover:scale-105"
              >
                <FileImage className="h-4 w-4" />
                <span className="hidden sm:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger
                value="reels"
                className="flex items-center gap-2 whitespace-nowrap touch-manipulation data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 rounded-xl transition-all duration-300 active:scale-95 md:hover:scale-105"
              >
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Reels</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 whitespace-nowrap touch-manipulation data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 rounded-xl transition-all duration-300 active:scale-95 md:hover:scale-105"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="focus-visible:outline-none">
            <ProfileContent
              activeTab="overview"
              profileData={profileData || undefined}
            />
          </TabsContent>

          <TabsContent value="posts" className="focus-visible:outline-none">
            <ProfileContent
              activeTab="posts"
              profileData={profileData || undefined}
            />
          </TabsContent>

          <TabsContent value="reels" className="focus-visible:outline-none">
            <ProfileContent
              activeTab="reels"
              profileData={profileData || undefined}
            />
          </TabsContent>

          <TabsContent value="analytics" className="focus-visible:outline-none">
            <ProfileContent
              activeTab="analytics"
              profileData={profileData || undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="instalens-theme">
      <AppContent />
      <Kairo />
      <Toaster />
    </ThemeProvider>
  );
}
