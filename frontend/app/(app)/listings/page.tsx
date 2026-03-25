import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'
import { ListingCard } from "@/components/listings/listing-card"
import { Calendar, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

// BYU Provo campus coordinates — used for distance calculation
const CAMPUS_LAT = 40.2518
const CAMPUS_LNG = -111.6493

// Haversine formula: returns distance in miles between two lat/lng points
function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "—"
  const miles = distanceMiles(CAMPUS_LAT, CAMPUS_LNG, lat, lng)
  return `${miles.toFixed(1)} mi`
}

export default async function ListingsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: listings, error } = await supabase
    .from("listings")
    .select("listing_id, title, montly_rent, num_bedrooms, num_bathrooms, city, source_url, latitude, longitude")
    .order("date_scraped", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Failed to load listings:", error.message)
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Calendar className="h-3 w-3" />
            Daily Summary
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {"Here's Your Daily Summary!"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            These are the top listings matching your requirements
          </p>
        </div>
        <Link
          href="/preferences/quick"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Edit Preferences
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">
          No listings found. Check back after the next scrape.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              title={listing.title}
              price={listing.montly_rent}
              beds={listing.num_bedrooms}
              baths={listing.num_bathrooms}
              city={listing.city}
              distance={formatDistance(listing.latitude, listing.longitude)}
              listingUrl={listing.source_url}
            />
          ))}
        </div>
      )}
    </main>
  )
}
