// Quick local test for email notifications using real listings from Supabase.
// Run with: node test-notify.js
// Requires RESEND_API_KEY and Supabase env vars in scraper/.env

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { sendNotificationEmails } = require("./notify");

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: listings, error } = await supabase
    .from("listings")
    .select("source_id, title, montly_rent, num_bedrooms, num_bathrooms, city, source_url, image_url, latitude, longitude")
    .order("date_scraped", { ascending: false })
    .limit(50);

  if (error) throw new Error(`Failed to fetch listings: ${error.message}`);

  // Map Supabase column names to the scraper's field names that notify.js expects
  const mapped = listings.map((l) => ({
    cl_id:     l.source_id,
    title:     l.title,
    price:     l.montly_rent,
    beds:      l.num_bedrooms,
    baths:     l.num_bathrooms,
    location:  l.city,
    url:       l.source_url,
    image_url: l.image_url,
    latitude:  l.latitude,
    longitude: l.longitude,
  }));

  console.log(`Loaded ${mapped.length} real listings from Supabase.`);
  await sendNotificationEmails(mapped, "kdber45@byu.edu");
}

main().catch((err) => console.error("Error:", err.message));
