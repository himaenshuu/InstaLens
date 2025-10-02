import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function EnvTest() {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_APIFY_API_TOKEN: import.meta.env.VITE_APIFY_API_TOKEN,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  };

  const getStatus = (value: string | undefined, name: string) => {
    if (!value) {
      return {
        status: "missing",
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        color: "bg-red-100 text-red-800",
      };
    }
    if (name.includes("KEY") || name.includes("TOKEN")) {
      return {
        status: "present",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        color: "bg-green-100 text-green-800",
      };
    }
    return {
      status: "present",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      color: "bg-green-100 text-green-800",
    };
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Environment Variables Check
        </CardTitle>
        <CardDescription>
          Verify that all required environment variables are loaded
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(envVars).map(([key, value]) => {
          const { status, icon, color } = getStatus(value, key);
          return (
            <div
              key={key}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex items-center gap-2">
                {icon}
                <span className="font-medium text-sm">{key}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={color}>
                  {status === "missing" ? "Missing" : "Present"}
                </Badge>
                {value && !key.includes("KEY") && !key.includes("TOKEN") && (
                  <span className="text-xs text-muted-foreground">
                    {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                  </span>
                )}
                {value && (key.includes("KEY") || key.includes("TOKEN")) && (
                  <span className="text-xs text-muted-foreground">
                    {value.length} chars
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> If any variables show as "Missing", make sure
            your .env file is in the project root and restart the development
            server.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
