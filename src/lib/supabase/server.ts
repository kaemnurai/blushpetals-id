// All Supabase access now uses the universal browser client.
// This file is kept for import compatibility only.
export {
  getSupabaseBrowserClient as getSupabaseServerClient,
  isSupabaseConfigured,
} from "./client";
