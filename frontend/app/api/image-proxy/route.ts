import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) return new NextResponse("Missing url param", { status: 400 })

  let imageUrl: URL
  try {
    imageUrl = new URL(url)
  } catch {
    return new NextResponse("Invalid url", { status: 400 })
  }

  // Only proxy images from Craigslist CDN
  if (!imageUrl.hostname.endsWith("craigslist.org")) {
    return new NextResponse("URL not allowed", { status: 403 })
  }

  const response = await fetch(imageUrl.toString(), {
    headers: {
      Referer: "https://provo.craigslist.org/",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })

  if (!response.ok) {
    return new NextResponse("Failed to fetch image", { status: response.status })
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg"
  const buffer = await response.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  })
}
