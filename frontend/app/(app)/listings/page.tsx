"use client"

export const dynamic = "force-dynamic"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { ListingCard } from "@/components/listings/listing-card"
import { getPreferences } from "@/lib/api"
import { getTopListingMatches } from "@/lib/listing-summary"
import { getListingsFromSupabase } from "@/lib/listings"

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

  const scoredListings = useMemo(() => {
    const listings = listingsQuery.data ?? []
    const preferences = preferencesQuery.data

    if (!preferences) return []
    return getTopListingMatches(listings, preferences, listings.length)
  }, [listingsQuery.data, preferencesQuery.data])

  const isLoading = listingsQuery.isLoading || preferencesQuery.isLoading
  const preferences = preferencesQuery.data
  const hasPreferences = preferences != null

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Listings Ranked for You
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Ranked by how well they match your saved preferences
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
        <p className="py-20 text-center text-sm text-muted-foreground">Loading your summary...</p>
      ) : !hasPreferences ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-medium text-foreground">No preferences set up yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your priorities and criteria so we can build your scored daily summary.
          </p>
          <Link
            href="/preferences"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Set Up Preferences
          </Link>
        </div>
      ) : scoredListings.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-medium text-foreground">No listings match your preferences</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try widening your budget, distance, or bedroom and bathroom minimums.
          </p>
          <Link
            href="/preferences/quick"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Adjust Preferences
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {scoredListings.map((listing) => (
              <ListingCard
                key={listing.listing_id}
                title={listing.title}
                price={listing.montly_rent}
                beds={listing.num_bedrooms}
                baths={listing.num_bathrooms}
                city={listing.city}
                distance={listing.distanceMiles == null ? "N/A" : `${listing.distanceMiles.toFixed(1)} mi`}
                listingUrl={listing.source_url}
                imageUrl={listing.image_url}
                matchScore={listing.matchScore}
              />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
