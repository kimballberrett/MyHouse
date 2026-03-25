import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "myhouse_user_id"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  const isAuthed = Boolean(authCookie?.value)

  if (!isAuthed) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/preferences/:path*", "/listings/:path*", "/browse/:path*", "/notifications/:path*"],
}
