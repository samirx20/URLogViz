import { createClient } from "jsr:@supabase/supabase-js@2";

// This client uses the SERVICE_ROLE_KEY and should only be used in Edge Functions.
export const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);