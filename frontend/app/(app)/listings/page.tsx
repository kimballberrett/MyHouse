"use client"

export const dynamic = 'force-dynamic'

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { ListingCard } from "@/components/listings/listing-card"
import { getPreferences } from "@/lib/api"
import { getListingsFromSupabase } from "@/lib/listings"
import type { Listing } from "@/lib/listings"
import type { Preferences } from "@/lib/api"

// BYU Provo campus coordinates
const CAMPUS_LAT = 40.2518
const CAMPUS_LNG = -111.6493

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(lat: number | null | undefined, lng: number | null | undefined): string {
  if (lat == null || lng == null) return "—"
  const miles = distanceMiles(CAMPUS_LAT, CAMPUS_LNG, lat, lng)
  return `${miles.toFixed(1)} mi`
}

function filterByPreferences(listings: Listing[], prefs: Preferences): Listing[] {
  return listings.filter((listing) => {
    if (prefs.min_price != null && listing.montly_rent < prefs.min_price) return false
    if (prefs.max_price != null && listing.montly_rent > prefs.max_price) return false
    if (prefs.max_distance_miles != null && listing.latitude != null && listing.longitude != null) {
      const miles = distanceMiles(CAMPUS_LAT, CAMPUS_LNG, listing.latitude, listing.longitude)
      if (miles > prefs.max_distance_miles) return false
    }
    return true
  })
}

export default function ListingsPage() {
  const listingsQuery = useQuery({
    queryKey: ["listings"],
    queryFn: () => getListingsFromSupabase(),
    retry: false,
  })

  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: getPreferences,
    retry: false,
  })

  const filteredListings = useMemo(() => {
    const listings = listingsQuery.data ?? []
    const prefs = preferencesQuery.data
    if (!prefs) return listings
    return filterByPreferences(listings, prefs)
  }, [listingsQuery.data, preferencesQuery.data])

  const isLoading = listingsQuery.isLoading || preferencesQuery.isLoading
  const hasPreferences = preferencesQuery.data != null

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
            Listings matching your saved preferences
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

      {isLoading ? (
        <p className="py-20 text-center text-sm text-muted-foreground">Loading...</p>
      ) : !hasPreferences ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-medium text-foreground">No preferences set up yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your preferences so we can find listings that match.
          </p>
          <Link
            href="/preferences"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Set Up Preferences
          </Link>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-medium text-foreground">No listings match your preferences</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your price range or distance in preferences.
          </p>
          <Link
            href="/preferences/quick"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Adjust Preferences
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              title={listing.title}
              price={listing.montly_rent}
              beds={listing.num_bedrooms}
              baths={listing.num_bathrooms}
              city={listing.city}
              distance={formatDistance(listing.latitude, listing.longitude)}
              listingUrl={listing.source_url}
              imageUrl={listing.image_url}
            />
          ))}
        </div>
      )}
    </main>
  )
}
