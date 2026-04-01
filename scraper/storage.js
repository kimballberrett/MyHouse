require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const BUCKET = "listing-images";

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY;

  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Downloads a Craigslist image and uploads it to Supabase Storage.
// Returns the public Storage URL, or null on failure.
async function uploadListingImage(clId, imageUrl) {
  if (!imageUrl) return null;

  // Download image from Craigslist with proper headers to bypass hotlink block
  let imageBuffer;
  let contentType = "image/jpeg";
  try {
    const res = await fetch(imageUrl, {
      headers: {
        Referer: "https://provo.craigslist.org/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    contentType = res.headers.get("content-type") || "image/jpeg";
    imageBuffer = Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }

  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `${clId}.${ext}`;
  const supabase = getSupabaseClient();

  // Upsert so re-running the scraper doesn't fail on duplicate
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, imageBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.warn(`  Storage upload failed for ${clId}: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

module.exports = { uploadListingImage };
