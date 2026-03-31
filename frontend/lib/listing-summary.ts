import type { Preferences } from "./api"
import type { Listing } from "./listings"

export const CAMPUS_LAT = 40.2518
export const CAMPUS_LNG = -111.6493

export const SUMMARY_FREQUENCY_LABELS: Record<string, string> = {
  "every-new": "Every new listing",
  daily: "Daily",
  weekly: "Weekly",
}

const SUMMARY_INTERVAL_MS: Record<string, number> = {
  "every-new": 0,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
}

const FEATURE_CONFIG = [
  { key: "price", label: "Price", rankField: "price_rank" },
  { key: "location", label: "Location", rankField: "location_rank" },
  { key: "bedrooms", label: "Bedrooms", rankField: "rooms_rank" },
  { key: "bathrooms", label: "Bathrooms", rankField: "sociability_rank" },
  { key: "amenities", label: "Amenities", rankField: "amenities_rank" },
] as const

type FeatureKey = (typeof FEATURE_CONFIG)[number]["key"]

export interface ScoreBreakdownItem {
  key: FeatureKey
  label: string
  weight: number
  compliance: number
  contribution: number
  explanation: string
}

export interface ScoredListing extends Listing {
  distanceMiles: number | null
  matchScore: number
  scoreBreakdown: ScoreBreakdownItem[]
  matchHighlights: string[]
}

interface CriterionResult {
  compliance: number
  explanation: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

export function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const radiusMiles = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2

  return radiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(distance: number | null): string {
  if (distance == null) return "Unknown distance"
  return `${distance.toFixed(1)} mi`
}

export function getSummaryFrequencyLabel(frequency: string | null | undefined): string {
  if (!frequency) return "Daily"
  return SUMMARY_FREQUENCY_LABELS[frequency] ?? frequency
}

export function isSummaryDue(
  frequency: string | null | undefined,
  lastSummaryAt: string | null | undefined,
  now = Date.now()
): boolean {
  if (!frequency || frequency === "every-new") return true
  if (!lastSummaryAt) return true

  const intervalMs = SUMMARY_INTERVAL_MS[frequency] ?? SUMMARY_INTERVAL_MS.daily
  const lastRun = new Date(lastSummaryAt).getTime()

  if (!Number.isFinite(lastRun)) return true
  return now - lastRun >= intervalMs
}

function getPriorityWeight(rank: number | undefined | null): number {
  if (!rank || rank < 1) return 0
  return Math.max(FEATURE_CONFIG.length - rank + 1, 1)
}

function scorePrice(listing: Listing, preferences: Preferences): CriterionResult | null {
  const min = preferences.min_price ?? null
  const max = preferences.max_price ?? null

  if (min == null && max == null) return null

  const rent = listing.montly_rent
  const targetMin = min ?? 0
  const targetMax = max ?? Math.max(rent, targetMin)

  if (rent >= targetMin && rent <= targetMax) {
    const midpoint = (targetMin + targetMax) / 2
    const spread = Math.max((targetMax - targetMin) / 2, 100)
    const centeredBonus = clamp(1 - Math.abs(rent - midpoint) / spread, 0, 1)
    return {
      compliance: clamp(0.85 + centeredBonus * 0.15, 0, 1),
      explanation: `Within your $${targetMin}-$${targetMax} budget`,
    }
  }

  const closestBoundary = rent < targetMin ? targetMin : targetMax
  const tolerance = Math.max(closestBoundary * 0.35, 150)
  const compliance = clamp(1 - Math.abs(rent - closestBoundary) / tolerance, 0, 1)

  return {
    compliance,
    explanation:
      rent < targetMin
        ? `$${targetMin - rent} below your minimum budget`
        : `$${rent - targetMax} above your maximum budget`,
  }
}

function scoreLocation(listing: Listing, preferences: Preferences): CriterionResult | null {
  if (preferences.max_distance_miles == null) return null

  if (listing.latitude == null || listing.longitude == null) {
    return {
      compliance: 0.2,
      explanation: "Distance from campus is unavailable",
    }
  }

  const miles = distanceMiles(CAMPUS_LAT, CAMPUS_LNG, listing.latitude, listing.longitude)
  const target = Number(preferences.max_distance_miles)

  if (miles <= target) {
    const closeness = clamp(1 - miles / Math.max(target, 0.5), 0, 1)
    return {
      compliance: clamp(0.8 + closeness * 0.2, 0, 1),
      explanation: `${miles.toFixed(1)} miles from campus`,
    }
  }

  const overflowLimit = Math.max(target, 1) * 1.5
  return {
    compliance: clamp(1 - (miles - target) / overflowLimit, 0, 1),
    explanation: `${(miles - target).toFixed(1)} miles beyond your preferred radius`,
  }
}

function scoreBedrooms(listing: Listing, preferences: Preferences): CriterionResult | null {
  const minimumBedrooms = preferences.min_bedrooms ?? null
  if (minimumBedrooms == null || minimumBedrooms <= 0) return null

  if (listing.num_bedrooms == null) {
    return {
      compliance: 0.25,
      explanation: "Bedroom count is unavailable",
    }
  }

  if (listing.num_bedrooms >= minimumBedrooms) {
    return {
      compliance: 1,
      explanation: `${listing.num_bedrooms} bedrooms meets your ${minimumBedrooms}+ target`,
    }
  }

  return {
    compliance: clamp(listing.num_bedrooms / minimumBedrooms, 0, 1),
    explanation: `${listing.num_bedrooms} bedrooms, below your ${minimumBedrooms}+ target`,
  }
}

function scoreBathrooms(listing: Listing, preferences: Preferences): CriterionResult | null {
  const minimumBathrooms = preferences.min_bathrooms ?? null
  if (minimumBathrooms == null || minimumBathrooms <= 0) return null

  if (listing.num_bathrooms == null) {
    return {
      compliance: 0.25,
      explanation: "Bathroom count is unavailable",
    }
  }

  if (listing.num_bathrooms >= minimumBathrooms) {
    return {
      compliance: 1,
      explanation: `${listing.num_bathrooms} bathrooms meets your ${minimumBathrooms}+ target`,
    }
  }

  return {
    compliance: clamp(listing.num_bathrooms / minimumBathrooms, 0, 1),
    explanation: `${listing.num_bathrooms} bathrooms, below your ${minimumBathrooms}+ target`,
  }
}

function scoreAmenities(listing: Listing, preferences: Preferences): CriterionResult | null {
  const desiredAmenities = preferences.desired_amenities ?? []
  if (desiredAmenities.length === 0) return null

  const listingAmenities = new Set((listing.amenities ?? []).map((amenity) => amenity.toLowerCase()))
  const matches = desiredAmenities.filter((amenity) => listingAmenities.has(amenity.toLowerCase()))
  const compliance = matches.length / desiredAmenities.length

  return {
    compliance,
    explanation:
      matches.length > 0
        ? `Matches ${matches.length}/${desiredAmenities.length} preferred amenities`
        : "None of your preferred amenities were detected",
  }
}

function buildCriterionResult(
  key: FeatureKey,
  listing: Listing,
  preferences: Preferences
): CriterionResult | null {
  switch (key) {
    case "price":
      return scorePrice(listing, preferences)
    case "location":
      return scoreLocation(listing, preferences)
    case "bedrooms":
      return scoreBedrooms(listing, preferences)
    case "bathrooms":
      return scoreBathrooms(listing, preferences)
    case "amenities":
      return scoreAmenities(listing, preferences)
    default:
      return null
  }
}

export function scoreListing(listing: Listing, preferences: Preferences): ScoredListing {
  const breakdown = FEATURE_CONFIG.reduce<ScoreBreakdownItem[]>((items, { key, label, rankField }) => {
    const weight = getPriorityWeight(preferences[rankField])
    const criterion = buildCriterionResult(key, listing, preferences)

    if (!criterion || weight === 0) return items

    items.push({
      key,
      label,
      weight,
      compliance: criterion.compliance,
      contribution: criterion.compliance * weight,
      explanation: criterion.explanation,
    })

    return items
  }, [])

  const totalWeight = breakdown.reduce((sum, item) => sum + item.weight, 0)
  const weightedScore =
    totalWeight === 0
      ? 0
      : (breakdown.reduce((sum, item) => sum + item.contribution, 0) / totalWeight) * 100

  const distanceFromCampus =
    listing.latitude != null && listing.longitude != null
      ? distanceMiles(CAMPUS_LAT, CAMPUS_LNG, listing.latitude, listing.longitude)
      : null

  return {
    ...listing,
    distanceMiles: distanceFromCampus == null ? null : round(distanceFromCampus),
    matchScore: round(weightedScore),
    scoreBreakdown: breakdown.sort((left, right) => right.weight - left.weight),
    matchHighlights: breakdown
      .sort((left, right) => right.compliance - left.compliance)
      .slice(0, 2)
      .map((item) => item.explanation),
  }
}

export function getTopListingMatches(
  listings: Listing[],
  preferences: Preferences,
  limit = 10
): ScoredListing[] {
  return listings
    .map((listing) => scoreListing(listing, preferences))
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore
      }

      if ((left.distanceMiles ?? Number.POSITIVE_INFINITY) !== (right.distanceMiles ?? Number.POSITIVE_INFINITY)) {
        return (left.distanceMiles ?? Number.POSITIVE_INFINITY) - (right.distanceMiles ?? Number.POSITIVE_INFINITY)
      }

      return left.montly_rent - right.montly_rent
    })
    .slice(0, limit)
}
