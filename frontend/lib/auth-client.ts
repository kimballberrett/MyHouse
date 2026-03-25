import { supabase } from "./supabase"

const AUTH_COOKIE_NAME = "myhouse_user_id"

function parseCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const encodedPrefix = `${encodeURIComponent(name)}=`
  const match = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(encodedPrefix))
  if (!match) return null
  return decodeURIComponent(match.slice(encodedPrefix.length)) || null
}

export function getAuthenticatedUserId(): string | null {
  return parseCookieValue(AUTH_COOKIE_NAME)
}

export function setAuthenticatedUserId(userId: string): void {
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(userId)}; Path=/; Max-Age=604800; SameSite=Lax`
}

export function clearAuthenticatedUserId(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  clearAuthenticatedUserId()
}

export const authCookieName = AUTH_COOKIE_NAME
