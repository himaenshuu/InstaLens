// Helper function to ensure images use the proxy to avoid CORS issues
import { projectId, publicAnonKey } from "./supabase/info";

export function createProxiedImageUrl(originalUrl: string): string {
  // Don't proxy UI avatars, data URLs, or already proxied URLs
  if (
    !originalUrl ||
    originalUrl.includes("ui-avatars.com") ||
    originalUrl.startsWith("data:") ||
    originalUrl.includes("supabase.co/functions")
  ) {
    return originalUrl;
  }

  // If it's an Instagram URL, use the proxy
  if (
    originalUrl.includes("instagram.com") ||
    originalUrl.includes("cdninstagram.com") ||
    originalUrl.includes("fbcdn.net")
  ) {
    const proxiedUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b9769089/proxy-image?url=${encodeURIComponent(
      originalUrl
    )}&apikey=${publicAnonKey}`;
    return proxiedUrl;
  }

  // For other external URLs, also use proxy to be safe
  if (originalUrl.startsWith("http")) {
    const proxiedUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b9769089/proxy-image?url=${encodeURIComponent(
      originalUrl
    )}&apikey=${publicAnonKey}`;
    return proxiedUrl;
  }

  return originalUrl;
}
