/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APIFY_API_TOKEN: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_VISION_API_KEY?: string; // Optional for content analysis
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
