"use client"

import { useQuery } from "@tanstack/react-query"
import { BrowseListings } from "@/components/preferences/browse-listings"
import { getListings, getPreferences } from "@/lib/api"

async function fetchListings() {
  return getListings()
}

async function fetchPreferences() {
  return getPreferences()
}

export default function BrowsePage() {
  const {
    data: listings,
    isLoading: listingsLoading,
    isError: listingsError,
  } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
  })

  const { data: preferences } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
  })

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Browse Listings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Explore all listings and refine results with filters.
        </p>
      </div>

      {listingsLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
          Loading listings...
        </div>
      ) : (
        <BrowseListings
          listings={listings}
          preferences={preferences}
          listingsError={listingsError}
        />
      )}
    </main>
  )
}
