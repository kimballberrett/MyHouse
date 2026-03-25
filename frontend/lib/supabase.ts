import { createClient } from "@supabase/supabase-js"

// Fallback values prevent module evaluation from throwing during Next.js
// build-time SSR. Real values are required at runtime via Vercel env vars.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
