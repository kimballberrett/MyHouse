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
  latitude?: number | null
  longitude?: number | null
  amenities: string[]
}

interface GetListingsOptions {
  limit?: number
}

export async function getListingsFromSupabase(
  options: GetListingsOptions = {}
): Promise<Listing[]> {
  let query = supabase
    .from("listings")
    .select(
      "listing_id, title, street_address, city, montly_rent, num_bedrooms, num_bathrooms, description, date_scraped, source_url, latitude, longitude"
    )
    .order("date_scraped", { ascending: false })

  if (options.limit && options.limit > 0) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []).map((listing) => ({
    ...listing,
    amenities: [],
  }))
}
