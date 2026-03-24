const config = require("./config");
const { fetchListings } = require("./craigslist");
const { upsertListing, getCount } = require("./db");

async function main() {
  console.log(`Fetching listings from ${config.baseUrl} ...`);

  const listings = await fetchListings(config);
  console.log(`Got ${listings.length} listings from Craigslist.\n`);

  let newCount = 0;
  let dupCount = 0;

  for (const listing of listings) {
    if (!listing.cl_id) continue;

    const isNew = upsertListing({
      cl_id:         listing.cl_id,
      title:         listing.title ?? null,
      price:         listing.price ?? null,
      location:      listing.location ?? null,
      url:           listing.url ?? null,
      beds:          listing.beds ?? null,
      baths:         listing.baths ?? null,
      latitude:      listing.latitude ?? null,
      longitude:     listing.longitude ?? null,
      property_type: listing.property_type ?? null,
      raw_json:      JSON.stringify(listing),
    });

    if (isNew) {
      newCount++;
      const bed  = listing.beds  != null ? `${listing.beds}bd`  : "?bd";
      const bath = listing.baths != null ? `${listing.baths}ba` : "?ba";
      const price = listing.price != null ? `$${listing.price}` : "$?";
      console.log(`  NEW  ${price} | ${bed} ${bath} | ${listing.location || "no location"}`);
    } else {
      dupCount++;
    }
  }

  console.log(`\nDone. ${newCount} new, ${dupCount} duplicates skipped.`);
  console.log(`Total in DB: ${getCount()}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
