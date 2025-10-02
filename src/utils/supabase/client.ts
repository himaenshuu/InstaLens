import { createClient } from "@supabase/supabase-js";

// Supabase configuration from environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://rjkeumzejojdzazrckew.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2V1bXplam9qZHphenJja2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTU0MzcsImV4cCI6MjA3NDQ3MTQzN30.a7VOqr6rxMkJNBRQCsqCvDLbmQ3vl7DP55Igzq6bPfw";

// Create Supabase client with persistent session storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence in localStorage
    autoRefreshToken: true, // Automatically refresh the token before it expires
    detectSessionInUrl: true, // Detect session from URL (for OAuth callbacks)
    storage: window.localStorage, // Use localStorage for session storage
    storageKey: "sb-auth-token", // Custom storage key for clarity
  },
});

// Debug: Log localStorage access on load
console.log("🔧 Supabase client initialized with persistent session storage");
console.log(
  "📦 LocalStorage keys:",
  Object.keys(localStorage).filter((k) => k.includes("sb-"))
);

// Test database connection
export async function testDatabaseConnection() {
  try {
    console.log("Testing Supabase connection...");
    console.log("Supabase URL:", supabaseUrl);

    // Test the connection by making a simple request
    // Using a non-existent table to avoid actual database operations
    const { data, error } = await supabase
      .from("_health_check_table")
      .select("*")
      .limit(1);

    // If we get a "relation does not exist" error, that means connection is working
    if (error && error.code === "PGRST116") {
      console.log("✅ Database connection successful");
      return {
        success: true,
        message: "Database connection established successfully",
        details: "Connection to Supabase is working",
      };
    }

    // If we get other errors, log them
    if (error) {
      console.error("Database connection error:", error);
      return {
        success: false,
        message: "Database connection failed",
        details: error.message,
      };
    }

    // If no error (unlikely with non-existent table)
    return {
      success: true,
      message: "Database connection successful",
      details: "Connected and ready",
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      success: false,
      message: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Test server function connection
export async function testServerFunction() {
  try {
    console.log("Testing server function connection...");

    const response = await fetch(
      `${supabaseUrl}/functions/v1/make-server-b9769089/health`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "Server function accessible",
        details: data,
      };
    } else {
      return {
        success: false,
        message: `Server function returned ${response.status}`,
        details: `${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    console.error("Server function test error:", error);
    return {
      success: false,
      message: "Server function test failed",
      details: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Export connection info for debugging
export const connectionInfo = {
  supabaseUrl,
  projectId: "rjkeumzejojdzazrckew",
  hasAnonKey: !!supabaseAnonKey,
};
