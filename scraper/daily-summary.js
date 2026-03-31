require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const CAMPUS_LAT = 40.2518;
const CAMPUS_LNG = -111.6493;
const SUMMARY_INTERVAL_MS = {
  "every-new": 0,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

const AMENITY_PATTERNS = [
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
];

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials for daily summary generation.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distanceMiles(lat1, lng1, lat2, lng2) {
  const radiusMiles = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return radiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inferAmenities(title, description) {
  const haystack = [title, description].filter(Boolean).join(" ");
  return AMENITY_PATTERNS.filter(({ patterns }) =>
    patterns.some((pattern) => pattern.test(haystack))
  ).map(({ amenity }) => amenity);
}

function getPriorityWeight(rank) {
  if (!rank || rank < 1) return 0;
  return Math.max(5 - rank + 1, 1);
}

function isSummaryDue(preferences) {
  const frequency = preferences.notification_frequency || "daily";
  if (frequency === "every-new") return true;
  if (!preferences.last_daily_summary_at) return true;

  const intervalMs = SUMMARY_INTERVAL_MS[frequency] ?? SUMMARY_INTERVAL_MS.daily;
  const lastRun = new Date(preferences.last_daily_summary_at).getTime();
  if (!Number.isFinite(lastRun)) return true;

  return Date.now() - lastRun >= intervalMs;
}

function scorePrice(listing, preferences) {
  const min = preferences.min_price ?? null;
  const max = preferences.max_price ?? null;
  if (min == null && max == null) return null;

  const rent = listing.montly_rent;
  const targetMin = min ?? 0;
  const targetMax = max ?? Math.max(rent, targetMin);

  if (rent >= targetMin && rent <= targetMax) {
    const midpoint = (targetMin + targetMax) / 2;
    const spread = Math.max((targetMax - targetMin) / 2, 100);
    const centeredBonus = clamp(1 - Math.abs(rent - midpoint) / spread, 0, 1);
    return clamp(0.85 + centeredBonus * 0.15, 0, 1);
  }

  const closestBoundary = rent < targetMin ? targetMin : targetMax;
  const tolerance = Math.max(closestBoundary * 0.35, 150);
  return clamp(1 - Math.abs(rent - closestBoundary) / tolerance, 0, 1);
}

function scoreLocation(listing, preferences) {
  if (preferences.max_distance_miles == null) return null;
  if (listing.latitude == null || listing.longitude == null) return 0.2;

  const miles = distanceMiles(CAMPUS_LAT, CAMPUS_LNG, listing.latitude, listing.longitude);
  const target = Number(preferences.max_distance_miles);

  if (miles <= target) {
    const closeness = clamp(1 - miles / Math.max(target, 0.5), 0, 1);
    return clamp(0.8 + closeness * 0.2, 0, 1);
  }

  const overflowLimit = Math.max(target, 1) * 1.5;
  return clamp(1 - (miles - target) / overflowLimit, 0, 1);
}

function scoreMinimum(listingValue, preferenceValue) {
  if (preferenceValue == null || preferenceValue <= 0) return null;
  if (listingValue == null) return 0.25;
  if (listingValue >= preferenceValue) return 1;
  return clamp(listingValue / preferenceValue, 0, 1);
}

function scoreAmenities(listing, preferences) {
  const desiredAmenities = preferences.desired_amenities || [];
  if (desiredAmenities.length === 0) return null;

  const listingAmenities = new Set((listing.amenities || []).map((amenity) => amenity.toLowerCase()));
  const matches = desiredAmenities.filter((amenity) => listingAmenities.has(amenity.toLowerCase()));
  return matches.length / desiredAmenities.length;
}

function scoreListing(listing, preferences) {
  const criteria = [
    { weight: getPriorityWeight(preferences.price_rank), score: scorePrice(listing, preferences) },
    { weight: getPriorityWeight(preferences.location_rank), score: scoreLocation(listing, preferences) },
    { weight: getPriorityWeight(preferences.rooms_rank), score: scoreMinimum(listing.num_bedrooms, preferences.min_bedrooms) },
    { weight: getPriorityWeight(preferences.sociability_rank), score: scoreMinimum(listing.num_bathrooms, preferences.min_bathrooms) },
    { weight: getPriorityWeight(preferences.amenities_rank), score: scoreAmenities(listing, preferences) },
  ].filter((item) => item.weight > 0 && item.score != null);

  const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0);
  const score =
    totalWeight === 0
      ? 0
      : (criteria.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight) * 100;

  const distance =
    listing.latitude != null && listing.longitude != null
      ? distanceMiles(CAMPUS_LAT, CAMPUS_LNG, listing.latitude, listing.longitude)
      : null;

  return {
    ...listing,
    matchScore: Math.round(score * 10) / 10,
    distanceMiles: distance == null ? null : Math.round(distance * 10) / 10,
  };
}

async function fetchPreferences(supabase) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select(
      [
        "user_id",
        "min_price",
        "max_price",
        "max_distance_miles",
        "min_bedrooms",
        "min_bathrooms",
        "desired_amenities",
        "price_rank",
        "location_rank",
        "rooms_rank",
        "sociability_rank",
        "amenities_rank",
        "notification_frequency",
        "last_daily_summary_at",
      ].join(", ")
    );

  if (error) throw new Error(`Could not load user preferences: ${error.message}`);
  return data || [];
}

async function fetchListings(supabase) {
  const { data, error } = await supabase
    .from("listings")
    .select(
      [
        "listing_id",
        "title",
        "city",
        "montly_rent",
        "num_bedrooms",
        "num_bathrooms",
        "description",
        "source_url",
        "image_url",
        "latitude",
        "longitude",
      ].join(", ")
    );

  if (error) throw new Error(`Could not load listings: ${error.message}`);

  return (data || []).map((listing) => ({
    ...listing,
    amenities: inferAmenities(listing.title, listing.description),
  }));
}

async function markSummaryRun(supabase, userId, timestamp) {
  const { error } = await supabase
    .from("user_preferences")
    .update({ last_daily_summary_at: timestamp })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Could not update last_daily_summary_at for ${userId}: ${error.message}`);
  }
}

async function main() {
  const supabase = getSupabaseClient();
  const [preferences, listings] = await Promise.all([
    fetchPreferences(supabase),
    fetchListings(supabase),
  ]);

  const dueUsers = preferences.filter(isSummaryDue);

  if (dueUsers.length === 0) {
    console.log("No daily summaries are due right now.");
    return;
  }

  const runTimestamp = new Date().toISOString();

  for (const preference of dueUsers) {
    const topMatches = listings
      .map((listing) => scoreListing(listing, preference))
      .sort((left, right) => {
        if (right.matchScore !== left.matchScore) {
          return right.matchScore - left.matchScore;
        }

        if ((left.distanceMiles ?? Number.POSITIVE_INFINITY) !== (right.distanceMiles ?? Number.POSITIVE_INFINITY)) {
          return (left.distanceMiles ?? Number.POSITIVE_INFINITY) - (right.distanceMiles ?? Number.POSITIVE_INFINITY);
        }

        return left.montly_rent - right.montly_rent;
      })
      .slice(0, 10);

    console.log(`\nDaily summary for ${preference.user_id} (${preference.notification_frequency || "daily"}):`);
    topMatches.forEach((listing, index) => {
      console.log(
        `${index + 1}. ${listing.title} | score ${listing.matchScore} | $${listing.montly_rent} | ${listing.source_url || "no url"}`
      );
    });

    await markSummaryRun(supabase, preference.user_id, runTimestamp);
  }
}

main().catch((error) => {
  console.error("Daily summary run failed:", error.message);
  process.exit(1);
});
