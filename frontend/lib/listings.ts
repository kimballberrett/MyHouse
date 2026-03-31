import { supabase } from "./supabase"

export interface Listing {
  listing_id: number
  title: string
  street_address: string | null
  city: string | null
  montly_rent: number
  num_bedrooms: number | null
  num_bathrooms: number | null
  description: string | null
  date_scraped: string
  source_url: string | null
  image_url: string | null
  latitude?: number | null
  longitude?: number | null
  amenities: string[]
}

interface GetListingsOptions {
  limit?: number
}

export const KNOWN_AMENITIES = [
  "Laundry",
  "Parking",
  "Private Room",
  "Furnished",
  "Pet Friendly",
  "Air Conditioning",
  "Dishwasher",
  "Gym",
  "Pool",
  "Utilities Included",
] as const

const AMENITY_PATTERNS: Array<{ amenity: string; patterns: RegExp[] }> = [
  { amenity: "Laundry", patterns: [/\blaundry\b/i, /\bwasher\b/i, /\bdryer\b/i] },
  { amenity: "Parking", patterns: [/\bparking\b/i, /\bgarage\b/i, /\bcarport\b/i] },
  { amenity: "Private Room", patterns: [/\bprivate room\b/i, /\bown room\b/i] },
  { amenity: "Furnished", patterns: [/\bfurnished\b/i, /\bfully furnished\b/i] },
  { amenity: "Pet Friendly", patterns: [/\bpet friendly\b/i, /\bpets?\b/i] },
  { amenity: "Air Conditioning", patterns: [/\bair conditioning\b/i, /\bac\b/i, /\ba\/c\b/i] },
  { amenity: "Dishwasher", patterns: [/\bdishwasher\b/i] },
  { amenity: "Gym", patterns: [/\bgym\b/i, /\bfitness center\b/i] },
  { amenity: "Pool", patterns: [/\bpool\b/i, /\bswimming\b/i] },
  { amenity: "Utilities Included", patterns: [/\butilities included\b/i, /\bincludes utilities\b/i] },
]

export function inferAmenitiesFromListing(
  title: string | null | undefined,
  description: string | null | undefined
): string[] {
  const haystack = [title, description].filter(Boolean).join(" ")

  return AMENITY_PATTERNS.filter(({ patterns }) =>
    patterns.some((pattern) => pattern.test(haystack))
  ).map(({ amenity }) => amenity)
}

export async function getListingsFromSupabase(
  options: GetListingsOptions = {}
): Promise<Listing[]> {
  let query = supabase
    .from("listings")
    .select(
      "listing_id, title, street_address, city, montly_rent, num_bedrooms, num_bathrooms, description, date_scraped, source_url, image_url, latitude, longitude"
    )
    .order("date_scraped", { ascending: false })

  if (options.limit && options.limit > 0) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []).map((listing) => ({
    ...listing,
    image_url: listing.image_url ?? null,
    amenities: inferAmenitiesFromListing(listing.title, listing.description),
  }))
}
