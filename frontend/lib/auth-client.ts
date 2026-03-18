const AUTH_COOKIE_NAME = "myhouse_user_id";

function parseCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedPrefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(encodedPrefix));
  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(encodedPrefix.length));
}

export function getAuthenticatedUserId(): number | null {
  const cookieValue = parseCookieValue(AUTH_COOKIE_NAME);
  if (!cookieValue) {
    return null;
  }

  const parsed = Number(cookieValue);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function setAuthenticatedUserId(userId: number): void {
  const safeUserId = Math.trunc(userId);
  if (!Number.isInteger(safeUserId) || safeUserId <= 0) {
    return;
  }

  // Basic session persistence for route gating in Next middleware.
  document.cookie = `${AUTH_COOKIE_NAME}=${safeUserId}; Path=/; Max-Age=604800; SameSite=Lax`;
}

export function clearAuthenticatedUserId(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const authCookieName = AUTH_COOKIE_NAME;
