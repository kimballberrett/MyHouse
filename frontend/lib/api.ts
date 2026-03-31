import { supabase } from "./supabase"

export interface Preferences {
  preference_id?: number
  user_id?: string
  min_price?: number
  max_price?: number
  max_distance_miles?: number
  min_bedrooms?: number
  min_bathrooms?: number
  desired_amenities?: string[]
  price_rank?: number
  location_rank?: number
  rooms_rank?: number
  sociability_rank?: number
  amenities_rank?: number
  notification_frequency?: string
  last_daily_summary_at?: string | null
}

export interface UpdatePreferencesPayload {
  min_price: number
  max_price: number
  max_distance_miles: number
  min_bedrooms: number
  min_bathrooms: number
  desired_amenities: string[]
  price_rank: number
  location_rank: number
  rooms_rank: number
  sociability_rank: number
  amenities_rank: number
  notification_frequency: string
}

export interface Notification {
  id: number
  type: "new-listing" | "daily-summary" | "price-drop"
  title: string
  description: string
  is_read: boolean
  created_at: string
  image_url?: string
  facebook_url?: string
}

export async function getPreferences(): Promise<Preferences | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export interface AuthUser {
  user_id: number
  email: string
}

interface LoginResponse {
  user: AuthUser
}

export interface AuthPayload {
  email: string
  password: string
}

export async function updatePreferences(
  payload: UpdatePreferencesPayload
): Promise<Preferences> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error("Not authenticated — please sign in again.")

  const user = session.user

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: user.id, ...payload }, { onConflict: "user_id" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Notifications not yet implemented
export async function getNotifications(): Promise<Notification[]> {
  return []
}

export async function markAllNotificationsRead(): Promise<Notification[]> {
  return []
}
