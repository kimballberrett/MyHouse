export interface Preferences {
  preference_id?: number
  user_id?: number
  min_price?: number
  max_price?: number
  max_distance_miles?: number
  price_rank?: number
  location_rank?: number
  rooms_rank?: number
  sociability_rank?: number
  amenities_rank?: number
  notification_frequency?: string
}

export interface UpdatePreferencesPayload {
  min_price: number
  max_price: number
  max_distance_miles: number
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

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured")
  }
  return base.replace(/\/+$/, "")
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getPreferences(): Promise<Preferences | null> {
  return requestJson<Preferences | null>("/api/preferences")
}

export function updatePreferences(
  payload: UpdatePreferencesPayload
): Promise<Preferences> {
  return requestJson<Preferences>("/api/preferences", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function getNotifications(): Promise<Notification[]> {
  return requestJson<Notification[]>("/api/notifications")
}

export function markAllNotificationsRead(): Promise<Notification[]> {
  return requestJson<Notification[]>("/api/notifications/mark-all-read", {
    method: "PUT",
  })
}
