import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../utils/supabase/client";

interface SignUpPageProps {
  onSignIn: () => void;
  onBack: () => void;
  onSignUpSuccess: () => void;
}

export function SignUpPage({
  onSignIn,
  onBack,
  onSignUpSuccess,
}: SignUpPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Sign up error:", error.message);
        alert(`Sign up failed: ${error.message}`);
      } else if (data.user) {
        console.log("Sign up successful:", data.user);
        if (data.user.email_confirmed_at) {
          // User is already confirmed
          onSignUpSuccess();
        } else {
          // User needs to confirm email
          alert(
            "Please check your email and click the confirmation link to complete your registration."
          );
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      alert("Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (
    provider: "google" | "facebook" | "apple"
  ) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google", // For now, only Google is properly configured
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error(`${provider} sign-up error:`, error.message);
        alert(`${provider} sign-up failed: ${error.message}`);
      }
      // Note: With OAuth, the user will be redirected to the provider,
      // so we don't handle success here - it's handled in the callback
    } catch (error) {
      console.error(`${provider} sign-up error:`, error);
      alert(`${provider} sign-up failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-40 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-1100"></div>
      </div>

      {/* Header with back button */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-white">Sign Up</h2>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 mt-16"
      >
        <Card className="border border-white/10 shadow-2xl shadow-purple-500/20 bg-black/20 backdrop-blur-2xl rounded-3xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Create your account
              </h1>
              <p className="text-gray-400">Join InstaLens to get started.</p>
            </div>

            {/* Social Sign Up Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={() => handleSocialSignUp("google")}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isLoading ? "Signing up..." : "Sign up with Google"}
                </div>
              </Button>

              <Button
                onClick={() => {
                  alert(
                    "Facebook login is coming soon! We are working on this feature."
                  );
                }}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 bg-blue-600/20 border-blue-500/30 text-white hover:bg-blue-600/30 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  {isLoading ? "Signing up..." : "Sign up with Facebook"}
                </div>
              </Button>

              <Button
                onClick={() => {
                  alert(
                    "Apple login is coming soon! We are working on this feature."
                  );
                }}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 bg-black/40 border-white/20 text-white hover:bg-black/60 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  {isLoading ? "Signing up..." : "Sign up with Apple"}
                </div>
              </Button>
            </div>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative bg-black/20 px-4">
                <span className="text-gray-400 text-sm">OR</span>
              </div>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <span className="text-gray-400">Already have an account? </span>
              <button
                onClick={onSignIn}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign In
              </button>
            </div>

            {/* Terms */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500 leading-relaxed">
                By signing up, you agree to our{" "}
                <button className="text-gray-400 hover:text-white underline transition-colors">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-gray-400 hover:text-white underline transition-colors">
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
