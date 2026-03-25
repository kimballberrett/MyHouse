const config = require("./config");
const { fetchListings, fetchListingImage } = require("./craigslist");
const { upsertListing, getCount } = require("./db");
const { upsertToDb, updateImageUrl } = require("./insert");

const IMAGE_DELAY_MS = 300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Fetching listings from ${config.baseUrl} ...\n`);

  const listings = await fetchListings(config);
  console.log(`Got ${listings.length} listings from Craigslist.\n`);

  let newLocal = 0;
  let newDb    = 0;
  let dupCount = 0;

  for (const listing of listings) {
    if (!listing.cl_id) continue;

    // Write to local SQLite (raw cache)
    const isNewLocal = upsertListing({
      cl_id:         listing.cl_id,
      title:         listing.title         ?? null,
      price:         listing.price         ?? null,
      location:      listing.location      ?? null,
      url:           listing.url           ?? null,
      beds:          listing.beds          ?? null,
      baths:         listing.baths         ?? null,
      latitude:      listing.latitude      ?? null,
      longitude:     listing.longitude     ?? null,
      property_type: listing.property_type ?? null,
      raw_json:      JSON.stringify(listing),
    });

    // Write to PostgreSQL (main app database)
    const isNewDb = await upsertToDb(listing);

    if (isNewLocal || isNewDb) {
      newLocal += isNewLocal ? 1 : 0;
      newDb    += isNewDb    ? 1 : 0;

      const bed   = listing.beds  != null ? `${listing.beds}bd`  : "?bd";
      const bath  = listing.baths != null ? `${listing.baths}ba` : "?ba";
      const price = listing.price != null ? `$${listing.price}`  : "$?";
      console.log(`  NEW  ${price} | ${bed} ${bath} | ${listing.location || "no location"}`);
    } else {
      dupCount++;
    }
  }

  console.log(`\nDone inserting.`);
  console.log(`  SQLite   — ${newLocal} new`);
  console.log(`  Postgres — ${newDb} new`);
  console.log(`  Skipped  — ${dupCount} duplicates`);
  console.log(`  SQLite total: ${getCount()}`);

  // --- Fetch images for all listings (visits each detail page) ---
  console.log(`\nFetching images for ${listings.length} listings...`);
  let imgFound = 0;
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    if (!listing.cl_id || !listing.url) continue;
    await sleep(IMAGE_DELAY_MS);
    const imageUrl = await fetchListingImage(listing.url);
    if (imageUrl) {
      await updateImageUrl(listing.cl_id, imageUrl);
      imgFound++;
    }
    if ((i + 1) % 10 === 0) {
      console.log(`  Progress: ${i + 1}/${listings.length} — images found so far: ${imgFound}`);
    }
  }
  console.log(`  Images saved: ${imgFound}/${listings.length}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
