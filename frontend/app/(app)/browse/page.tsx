"use client"

import { useQuery } from "@tanstack/react-query"
import { BrowseListings } from "@/components/preferences/browse-listings"
import { getPreferences } from "@/lib/api"
import { getListingsFromSupabase } from "@/lib/listings"

async function fetchListings() {
  return getListingsFromSupabase()
}

async function fetchPreferences() {
  return getPreferences()
}

export default function BrowsePage() {
  const listingsQuery = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
    retry: false,
  })

  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
    retry: false,
  })

  const listingsErrorMessage =
    listingsQuery.error instanceof Error
      ? listingsQuery.error.message
      : undefined

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

      {listingsQuery.isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
          Loading listings...
        </div>
      ) : (
        <BrowseListings
          listings={listingsQuery.data}
          preferences={preferencesQuery.data}
          listingsError={listingsQuery.isError}
          listingsErrorMessage={listingsErrorMessage}
        />
      )}
    </main>
  )
}
