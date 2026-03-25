const axios = require("axios");
const cheerio = require("cheerio");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// Parse the post ID out of a Craigslist listing URL.
// e.g. https://provo.craigslist.org/apa/d/some-title/7920962027.html → "7920962027"
function extractPostId(url) {
  const match = url.match(/\/(\d+)\.html/);
  return match ? match[1] : null;
}

// Parse price string "$1,750" → 1750 (integer). Returns null if unparseable.
function parsePrice(text) {
  const digits = text.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

// Fetch the Craigslist search page and return an array of listing objects
// that combine HTML card data (price, title, URL) with JSON-LD structured
// data (bedrooms, bathrooms, lat/lng) using position index as the join key.
async function fetchListings(config) {
  const res = await axios.get(config.baseUrl, {
    headers: HEADERS,
    params: config.params,
  });

  const html = res.data;
  const $ = cheerio.load(html);

  // --- Extract HTML cards ---
  const cards = [];
  $("li.cl-static-search-result").each((i, el) => {
    const a = $(el).find("a").first();
    const url = a.attr("href") || "";
    const title = $(el).find(".title").text().trim();
    const price = parsePrice($(el).find(".price").text());
    const location = $(el).find(".location").text().trim();
    const cl_id = extractPostId(url);

    const imgEl = $(el).find("img").first();
    const image_url = imgEl.attr("src") || imgEl.attr("data-src") || null;
    cards.push({ cl_id, title, price, location, url, image_url });
  });

  // --- Extract JSON-LD structured data (Script[1] is the ItemList) ---
  // Build a map from position index → structured data for O(1) lookup.
  const structuredByPosition = new Map();
  $("script").each((i, el) => {
    const content = $(el).html() || "";
    if (!content.includes('"ItemList"')) return;
    try {
      const data = JSON.parse(content);
      if (data["@type"] !== "ItemList") return;
      for (const entry of data.itemListElement ?? []) {
        const pos = parseInt(entry.position, 10);
        const item = entry.item ?? {};
        structuredByPosition.set(pos, {
          beds: item.numberOfBedrooms ?? null,
          baths: item.numberOfBathroomsTotal ?? null,
          latitude: item.latitude ?? null,
          longitude: item.longitude ?? null,
          property_type: item["@type"] ?? null,
          image_url_ld: (Array.isArray(item.image) ? item.image[0] : item.image) ?? null,
        });
      }
    } catch {
      // Not valid JSON or wrong block — skip
    }
  });

  // --- Merge cards with structured data by index ---
  return cards.map((card, i) => {
    const structured = structuredByPosition.get(i) ?? {};
    const { image_url_ld, ...rest } = structured;
    return { ...card, ...rest, image_url: image_url_ld || card.image_url || null };
  });
}

// Fetch the first image from an individual Craigslist listing page.
// Returns the image URL string or null if none found / request fails.
async function fetchListingImage(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await axios.get(url, {
      headers: HEADERS,
      timeout: 8000,
      signal: controller.signal,
      maxRedirects: 3,
    });
    clearTimeout(timer);
    const $ = cheerio.load(res.data);
    const src =
      $(".swipe-wrap img").first().attr("src") ||
      $("figure img").first().attr("src") ||
      $("#thumbs img").first().attr("src") ||
      null;
    return src;
  } catch {
    return null;
  }
}

module.exports = { fetchListings, fetchListingImage };
