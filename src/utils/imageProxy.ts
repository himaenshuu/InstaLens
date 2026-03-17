// Helper function to ensure images use the proxy to avoid CORS issues
import { projectId, publicAnonKey } from "./supabase/info";

function isBypassUrl(url: string): boolean {
  return (
    !url ||
    url.includes("ui-avatars.com") ||
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/") ||
    url.includes("supabase.co/functions")
  );
}

function createSupabaseProxyUrl(originalUrl: string): string {
  return `https://${projectId}.supabase.co/functions/v1/make-server-b9769089/proxy-image?url=${encodeURIComponent(
    originalUrl,
  )}&apikey=${encodeURIComponent(publicAnonKey)}`;
}

function createWeservProxyUrl(originalUrl: string): string {
  return `https://images.weserv.nl/?url=${encodeURIComponent(
    originalUrl,
  )}&output=webp`;
}

export function getProxiedImageCandidates(originalUrl: string): string[] {
  if (isBypassUrl(originalUrl)) {
    return originalUrl ? [originalUrl] : [];
  }

  if (!originalUrl.startsWith("http")) {
    return [originalUrl];
  }

  const candidates = [createSupabaseProxyUrl(originalUrl)];

  if (
    originalUrl.includes("instagram.com") ||
    originalUrl.includes("cdninstagram.com") ||
    originalUrl.includes("fbcdn.net")
  ) {
    candidates.push(createWeservProxyUrl(originalUrl));
  }

  candidates.push(originalUrl);

  return [...new Set(candidates)];
}

export function createProxiedImageUrl(originalUrl: string): string {
  const candidates = getProxiedImageCandidates(originalUrl);
  return candidates[0] || originalUrl;
}
