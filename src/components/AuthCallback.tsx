import { useEffect } from "react";
import { supabase } from "../utils/supabase/client";

interface AuthCallbackProps {
  onAuthSuccess: () => void;
  onAuthError: (error: string) => void;
}

export function AuthCallback({
  onAuthSuccess,
  onAuthError,
}: AuthCallbackProps) {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          onAuthError(error.message);
          return;
        }

        if (data.session) {
          onAuthSuccess();
        } else {
          onAuthError("No active session found");
        }
      } catch (error) {
        onAuthError("Authentication failed");
      }
    };

    // Check URL hash for auth callback
    if (
      window.location.hash.includes("access_token") ||
      window.location.hash.includes("error")
    ) {
      handleAuthCallback();
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        onAuthSuccess();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onAuthSuccess, onAuthError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
}
