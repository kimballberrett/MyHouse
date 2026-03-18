import { getAuthenticatedUserId } from "@/lib/auth-client"

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

const DEFAULT_API_BASE_URL = "http://localhost:3001"

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!configured) {
    return DEFAULT_API_BASE_URL
  }

  const normalized = configured.replace(/\/+$/, "")
  // Allow users to set either host root or host/api.
  return normalized.endsWith("/api")
    ? normalized.slice(0, -4)
    : normalized
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const userId = getAuthenticatedUserId()
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": String(userId) } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload?.error) {
        message = payload.error
      }
    } catch {
      // Keep default message when backend response is not JSON.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function loginWithCredentials(payload: AuthPayload): Promise<LoginResponse> {
  return requestJson<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function signupWithCredentials(payload: AuthPayload): Promise<LoginResponse> {
  return requestJson<LoginResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })
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
