import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // 🔑 wichtig für Redirect-Logins
  },
});
