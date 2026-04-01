"use client"

import { useEffect, useMemo, useState } from "react"
import { SlidersHorizontal, Sparkles } from "lucide-react"
import { ListingCard } from "@/components/listings/listing-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Preferences } from "@/lib/api"
import type { Listing } from "@/lib/listings"

interface BrowseListingsProps {
  listings: Listing[] | undefined
  preferences: Preferences | null | undefined
  listingsError: boolean
  listingsErrorMessage?: string
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

export function BrowseListings({
  listings,
  preferences,
  listingsError,
  listingsErrorMessage,
}: BrowseListingsProps) {
  const safeListings = listings ?? []
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null)
  const [draftFilters, setDraftFilters] = useState<FilterState | null>(null)
  const [defaultFilters, setDefaultFilters] = useState<FilterState | null>(null)
  const [initializedDefaults, setInitializedDefaults] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [minPriceInput, setMinPriceInput] = useState("")
  const [maxPriceInput, setMaxPriceInput] = useState("")

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

    const minRooms = Number(pref?.min_bedrooms)
    const minBathrooms = Number(pref?.min_bathrooms)
    const savedAmenities = Array.isArray(pref?.desired_amenities)
      ? pref.desired_amenities.filter((value): value is string => typeof value === "string")
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
    setMinPriceInput(String(initial.minPrice))
    setMaxPriceInput(String(initial.maxPrice))
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

  function commitMinPrice() {
    if (!draftFilters) return
    const value = Number(minPriceInput)
    if (!Number.isFinite(value)) { setMinPriceInput(String(draftFilters.minPrice)); return }
    const nextMin = Math.max(priceBounds.min, Math.min(value, priceBounds.max))
    const nextMax = Math.max(nextMin, draftFilters.maxPrice)
    setDraftFilters({ ...draftFilters, minPrice: nextMin, maxPrice: nextMax })
    setMinPriceInput(String(nextMin))
    setMaxPriceInput(String(nextMax))
  }

  function commitMaxPrice() {
    if (!draftFilters) return
    const value = Number(maxPriceInput)
    if (!Number.isFinite(value)) { setMaxPriceInput(String(draftFilters.maxPrice)); return }
    const nextMax = Math.max(priceBounds.min, Math.min(value, priceBounds.max))
    const nextMin = Math.min(nextMax, draftFilters.minPrice)
    setDraftFilters({ ...draftFilters, minPrice: nextMin, maxPrice: nextMax })
    setMinPriceInput(String(nextMin))
    setMaxPriceInput(String(nextMax))
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
    const cleared: FilterState = {
      minPrice: priceBounds.min,
      maxPrice: priceBounds.max,
      bedrooms: "any",
      bathrooms: "any",
      amenities: [],
    }
    setDraftFilters(cleared)
    setAppliedFilters(cleared)
    setMinPriceInput(String(cleared.minPrice))
    setMaxPriceInput(String(cleared.maxPrice))
  }

  function handleSeeMyMatches() {
    const matches = buildFiltersFromPreferences(preferences)
    setDefaultFilters(matches)
    setDraftFilters(matches)
    setAppliedFilters(matches)
    setMinPriceInput(String(matches.minPrice))
    setMaxPriceInput(String(matches.maxPrice))
  }

  if (listingsError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-card p-6 text-destructive">
        Could not load listings right now. Please check Supabase data access and table policies.
        {listingsErrorMessage ? (
          <p className="mt-2 text-sm text-destructive/90">{listingsErrorMessage}</p>
        ) : null}
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
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      onBlur={commitMinPrice}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="browse-max-price">Max</Label>
                    <Input
                      id="browse-max-price"
                      type="number"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      onBlur={commitMaxPrice}
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
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
              title={listing.title}
              price={listing.montly_rent}
              beds={listing.num_bedrooms ?? null}
              baths={listing.num_bathrooms ?? null}
              city={listing.city ?? null}
              distance="N/A"
              listingUrl={listing.source_url ?? null}
              imageUrl={listing.image_url ?? null}
            />
          ))}
        </div>
      )}
    </section>
  )
}
