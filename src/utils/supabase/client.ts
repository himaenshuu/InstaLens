import { createClient } from "@supabase/supabase-js";

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

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

// Test database connection
export async function testDatabaseConnection() {
  try {
    // Test the connection by making a simple request
    // Using a non-existent table to avoid actual database operations
    const { data, error } = await supabase
      .from("_health_check_table")
      .select("*")
      .limit(1);

    // If we get a "relation does not exist" error, that means connection is working
    if (error && error.code === "PGRST116") {
      return {
        success: true,
        message: "Database connection established successfully",
        details: "Connection to Supabase is working",
      };
    }

    // If we get other errors, log them
    if (error) {
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
