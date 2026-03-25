require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) in your environment."
    );
  }
  if (!supabaseKey) {
    throw new Error(
      "Missing Supabase key. Set SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY) in your environment."
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return supabaseClient;
}

// Extract the primary city name from a Craigslist location string.
// "Heber City - Hwy 40 and Hwy 189" → "Heber City"
// "Orem"                             → "Orem"
// ""                                 → null
function parseCity(location) {
  if (!location || !location.trim()) return null;
  const dashIdx = location.indexOf(" - ");
  return dashIdx !== -1 ? location.slice(0, dashIdx).trim() : location.trim();
}

// Insert a scraped listing into Supabase.
// Uses source_id (Craigslist post ID) as the unique key — safe to call repeatedly.
// Returns true if the row was inserted, false if it already existed.
async function upsertToDb(listing) {
  if (!listing.cl_id || !listing.price) return false;
  const supabase = getSupabaseClient();

  const { error, data } = await supabase
    .from("listings")
    .upsert(
      {
        title:         listing.title || "Rental Listing",
        street_address: null,
        city:          parseCity(listing.location),
        montly_rent:   listing.price,
        num_bedrooms:  listing.beds   ?? null,
        num_bathrooms: listing.baths  ?? null,
        description:   null,
        source_url:    listing.url    ?? null,
        source_id:     listing.cl_id,
        latitude:      listing.latitude  ?? null,
        longitude:     listing.longitude ?? null,
      },
      { onConflict: "source_id", ignoreDuplicates: true }
    )
    .select("listing_id");

  if (error) throw new Error(`Supabase insert error: ${error.message}`);
  return data && data.length > 0;
}

module.exports = { upsertToDb };
