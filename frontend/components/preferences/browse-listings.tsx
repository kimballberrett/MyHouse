"use client"

import { useEffect, useMemo, useState } from "react"
import { SlidersHorizontal, Sparkles } from "lucide-react"
import { ListingCard } from "@/components/listings/listing-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Listing, Preferences } from "@/lib/api"

interface BrowseListingsProps {
  listings: Listing[] | undefined
  preferences: Preferences | null | undefined
  listingsError: boolean
}

interface FilterState {
  minPrice: number
  maxPrice: number
  bedrooms: string
  bathrooms: string
  amenities: string[]
}

function filterListings(listings: Listing[], filters: FilterState): Listing[] {
  return listings.filter((listing) => {
    const listingPrice = listing.montly_rent
    const listingBedrooms = listing.num_bedrooms ?? 0
    const listingBathrooms = listing.num_bathrooms ?? 0
    const listingAmenitySet = new Set(
      (listing.amenities ?? []).map((amenity) => amenity.toLowerCase())
    )

    const matchesPrice =
      listingPrice >= filters.minPrice &&
      listingPrice <= filters.maxPrice

    const matchesBedrooms =
      filters.bedrooms === "any" || listingBedrooms >= Number(filters.bedrooms)

    const matchesBathrooms =
      filters.bathrooms === "any" || listingBathrooms >= Number(filters.bathrooms)

    const matchesAmenities = filters.amenities.every((amenity) =>
      listingAmenitySet.has(amenity.toLowerCase())
    )

    return matchesPrice && matchesBedrooms && matchesBathrooms && matchesAmenities
  })
}

export function BrowseListings({ listings, preferences, listingsError }: BrowseListingsProps) {
  const safeListings = listings ?? []
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null)
  const [draftFilters, setDraftFilters] = useState<FilterState | null>(null)
  const [defaultFilters, setDefaultFilters] = useState<FilterState | null>(null)
  const [initializedDefaults, setInitializedDefaults] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const priceBounds = useMemo(() => {
    if (safeListings.length === 0) {
      return { min: 0, max: 3000 }
    }

    const prices = safeListings.map((listing) => listing.montly_rent)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [safeListings])

  const amenityOptions = useMemo(() => {
    const allAmenities = safeListings.flatMap((listing) => listing.amenities ?? [])
    return Array.from(new Set(allAmenities)).sort((a, b) => a.localeCompare(b))
  }, [safeListings])

  function buildFiltersFromPreferences(pref: Preferences | null | undefined): FilterState {
    const minRaw = Number(pref?.min_price ?? priceBounds.min)
    const maxRaw = Number(pref?.max_price ?? priceBounds.max)
    const normalizedMin = Math.max(priceBounds.min, Math.min(minRaw, priceBounds.max))
    const normalizedMax = Math.max(normalizedMin, Math.min(maxRaw, priceBounds.max))

    const extraPrefs = pref as Record<string, unknown> | null | undefined
    const minRooms = Number(extraPrefs?.min_rooms)
    const minBathrooms = Number(extraPrefs?.min_bathrooms)
    const savedAmenities = Array.isArray(extraPrefs?.amenities)
      ? extraPrefs.amenities.filter((value): value is string => typeof value === "string")
      : []

    return {
      minPrice: normalizedMin,
      maxPrice: normalizedMax,
      bedrooms: Number.isFinite(minRooms) && minRooms > 0
        ? String(Math.min(4, Math.floor(minRooms)))
        : "any",
      bathrooms: Number.isFinite(minBathrooms) && minBathrooms > 0
        ? String(Math.min(3, Math.floor(minBathrooms)))
        : "any",
      amenities: savedAmenities.filter((amenity) => amenityOptions.includes(amenity)),
    }
  }

  useEffect(() => {
    if (initializedDefaults) return
    if (safeListings.length === 0) return
    if (preferences === undefined) return

    const initial = buildFiltersFromPreferences(preferences)
    setDefaultFilters(initial)
    setDraftFilters(initial)
    setAppliedFilters(initial)
    setInitializedDefaults(true)
  }, [amenityOptions, initializedDefaults, preferences, priceBounds, safeListings.length])

  const filteredListings = useMemo(() => {
    if (!appliedFilters) return safeListings
    return filterListings(safeListings, appliedFilters)
  }, [appliedFilters, safeListings])

  const previewMatchCount = useMemo(() => {
    if (!draftFilters) return safeListings.length
    return filterListings(safeListings, draftFilters).length
  }, [draftFilters, safeListings])

  function updateDraftMinPrice(value: number) {
    if (!draftFilters) return
    if (!Number.isFinite(value)) return
    const nextMin = Math.max(priceBounds.min, Math.min(value, priceBounds.max))
    const nextMax = Math.max(nextMin, draftFilters.maxPrice)
    setDraftFilters({ ...draftFilters, minPrice: nextMin, maxPrice: nextMax })
  }

  function updateDraftMaxPrice(value: number) {
    if (!draftFilters) return
    if (!Number.isFinite(value)) return
    const nextMax = Math.max(priceBounds.min, Math.min(value, priceBounds.max))
    const nextMin = Math.min(nextMax, draftFilters.minPrice)
    setDraftFilters({ ...draftFilters, minPrice: nextMin, maxPrice: nextMax })
  }

  function toggleAmenity(amenity: string, checked: boolean) {
    if (!draftFilters) return
    const current = draftFilters.amenities
    const nextAmenities = (() => {
      if (checked) {
        return current.includes(amenity) ? current : [...current, amenity]
      }
      return current.filter((item) => item !== amenity)
    })()

    setDraftFilters({ ...draftFilters, amenities: nextAmenities })
  }

  function handleApplyFilters() {
    if (!draftFilters) return
    setAppliedFilters(draftFilters)
    setFiltersOpen(false)
  }

  function handleResetFilters() {
    if (!defaultFilters) return
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  function handleSeeMyMatches() {
    const matches = buildFiltersFromPreferences(preferences)
    setDefaultFilters(matches)
    setDraftFilters(matches)
    setAppliedFilters(matches)
  }

  if (listingsError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-card p-6 text-destructive">
        Could not load listings right now. Please verify the backend is running.
      </div>
    )
  }

  const activeFilterCount =
    (appliedFilters?.bedrooms !== "any" ? 1 : 0) +
    (appliedFilters?.bathrooms !== "any" ? 1 : 0) +
    ((appliedFilters?.amenities.length ?? 0) > 0 ? 1 : 0) +
    (
      (appliedFilters?.minPrice ?? priceBounds.min) !== priceBounds.min ||
      (appliedFilters?.maxPrice ?? priceBounds.max) !== priceBounds.max
      ? 1
      : 0
    )

  return (
    <section>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSeeMyMatches}
            className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Sparkles className="h-4 w-4" />
            My Matches
          </Button>
          Showing <span className="font-semibold text-foreground">{filteredListings.length}</span>{" "}
          of <span className="font-semibold text-foreground">{safeListings.length}</span> listings
        </div>
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="inline-flex items-center gap-2 rounded-xl border-border bg-card text-foreground hover:bg-muted"
            >
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={10}
            className="w-[360px] rounded-xl border-border bg-card p-5 shadow-md"
          >
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Filters</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Results update as you adjust preferences.
              </p>
            </div>

            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-accent">Price Range</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="browse-min-price">Min</Label>
                    <Input
                      id="browse-min-price"
                      type="number"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={draftFilters?.minPrice ?? priceBounds.min}
                      onChange={(event) => updateDraftMinPrice(Number(event.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="browse-max-price">Max</Label>
                    <Input
                      id="browse-max-price"
                      type="number"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={draftFilters?.maxPrice ?? priceBounds.max}
                      onChange={(event) => updateDraftMaxPrice(Number(event.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-accent">Bedrooms</h3>
                <select
                  value={draftFilters?.bedrooms ?? "any"}
                  onChange={(event) =>
                    setDraftFilters((prev) =>
                      prev ? { ...prev, bedrooms: event.target.value } : prev
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-accent">Bathrooms</h3>
                <select
                  value={draftFilters?.bathrooms ?? "any"}
                  onChange={(event) =>
                    setDraftFilters((prev) =>
                      prev ? { ...prev, bathrooms: event.target.value } : prev
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-accent">Amenities</h3>
                <div className="space-y-2">
                  {amenityOptions.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-sm text-foreground">
                      <Checkbox
                        checked={draftFilters?.amenities.includes(amenity) ?? false}
                        onCheckedChange={(checked) => toggleAmenity(amenity, checked === true)}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                  {amenityOptions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No amenities available.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{previewMatchCount}</span>{" "}
                properties match
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
                <Button onClick={handleApplyFilters}>Apply</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {filteredListings.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No listings match your current filters.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              name={listing.title}
              price={listing.montly_rent}
              image={listing.image_url}
              contracts={Math.max(1, listing.num_bedrooms ?? 1)}
              amenities={listing.amenities ?? []}
              distance={listing.city ?? "N/A"}
              fbUrl={listing.source_url ?? "https://www.facebook.com/marketplace"}
            />
          ))}
        </div>
      )}
    </section>
  )
}
