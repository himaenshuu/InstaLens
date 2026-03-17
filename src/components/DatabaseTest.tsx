import { useState } from "react";
import { supabase } from "../utils/supabase/client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, RefreshCw, Database } from "lucide-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const projectId = supabaseUrl ? new URL(supabaseUrl).host.split(".")[0] : "N/A";

export function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [lastTestTime, setLastTestTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus("idle");
    setErrorMessage("");
    const startTime = Date.now();

    try {
      console.log("Testing Supabase connection...");
      console.log("Supabase URL:", supabaseUrl);
      console.log("API Key length:", supabaseKey?.length || 0);

      // Test basic Supabase connection by checking if we can access the service
      const { data, error } = await supabase
        .from("_supabase_test_table_that_does_not_exist")
        .select("*")
        .limit(1);

      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      console.log("Supabase response:", { data, error });

      // Log detailed error information to debug
      if (error) {
        console.log("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
      }

      // Check for various ways the "table not found" error might be reported
      if (
        error &&
        (error.code === "PGRST116" || // PostgREST table not found
          error.code === "42P01" || // PostgreSQL relation does not exist
          (error.message &&
            ((error.message.includes("relation") &&
              error.message.includes("does not exist")) ||
              (error.message.includes("table") &&
                error.message.includes("does not exist")) ||
              error.message.includes("PGRST116"))) ||
          (error.details && error.details.includes("does not exist")))
      ) {
        console.log(
          "✅ Database connection successful - table not found error expected"
        );
        setConnectionStatus("success");
        setLastTestTime(new Date().toLocaleTimeString());
      } else if (error) {
        console.error(
          "❌ Unexpected database error - this might still be OK if it's a permission error:"
        );
        console.error("Full error object:", error);

        // Check if it's just a permission/authentication issue but connection works
        if (
          error.code === "42501" || // Insufficient privilege
          error.code === "42P01" || // Relation does not exist
          (error.message && error.message.includes("permission")) ||
          (error.message && error.message.includes("JWT"))
        ) {
          console.log(
            "✅ Connection successful - authentication/permission error expected for test table"
          );
          setConnectionStatus("success");
          setLastTestTime(new Date().toLocaleTimeString());
        } else {
          throw error;
        }
      } else {
        // Unexpected success (table actually exists)
        console.log("✅ Database connection successful");
        setConnectionStatus("success");
        setLastTestTime(new Date().toLocaleTimeString());
      }
    } catch (error: any) {
      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      console.error("Database connection error:", error);
      setConnectionStatus("error");
      setErrorMessage(
        error.message || error.toString() || "Unknown error occurred"
      );
      setLastTestTime(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabaseHealth = async () => {
    setIsLoading(true);
    setConnectionStatus("idle");
    setErrorMessage("");
    const startTime = Date.now();

    try {
      console.log("Testing Supabase health endpoint...");

      // Test the Supabase REST API health
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "HEAD",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      console.log("Supabase health response status:", response.status);

      if (response.status === 200 || response.status === 404) {
        // 200 = healthy, 404 = healthy but no specific endpoint
        console.log("✅ Supabase API is accessible");
        setConnectionStatus("success");
        setLastTestTime(new Date().toLocaleTimeString());
      } else {
        throw new Error(
          `Supabase API returned ${response.status}: ${response.statusText}`
        );
      }
    } catch (error: any) {
      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      console.error("Supabase health check error:", error);
      setConnectionStatus("error");
      setErrorMessage(
        error.message || error.toString() || "Failed to reach Supabase"
      );
      setLastTestTime(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
        <CardDescription>
          Test connectivity to Supabase backend services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex items-center gap-2">
            {connectionStatus === "success" && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Connected
                </Badge>
              </>
            )}
            {connectionStatus === "error" && (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <Badge variant="destructive">Error</Badge>
              </>
            )}
            {connectionStatus === "idle" && (
              <Badge variant="outline">Not tested</Badge>
            )}
          </div>
        </div>

        {responseTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Response time:</span>
            <Badge variant="outline">{responseTime}ms</Badge>
          </div>
        )}

        {lastTestTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last tested:</span>
            <span className="text-sm text-muted-foreground">
              {lastTestTime}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={testConnection}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing Database...
              </>
            ) : (
              "Test Database Connection"
            )}
          </Button>

          <Button
            onClick={testSupabaseHealth}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing API Health...
              </>
            ) : (
              "Test API Health"
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Database URL:</strong> {supabaseUrl}
          </p>
          <p>
            <strong>Project ID:</strong> {projectId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
