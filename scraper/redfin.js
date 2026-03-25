const axios = require("axios");

// Redfin prefixes all stingray API responses with {}&& to prevent JSON hijacking.
function parseRedfinResponse(text) {
  return JSON.parse(text.slice(4));
}

const BASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
};

let sessionCookie = "";

// Visit the Redfin homepage once to establish a session cookie.
async function initSession() {
  if (sessionCookie) return;
  console.log("Initializing Redfin session...");
  const res = await axios.get("https://www.redfin.com/", {
    headers: BASE_HEADERS,
    maxRedirects: 5,
  });
  const raw = res.headers["set-cookie"] ?? [];
  sessionCookie = raw.map((c) => c.split(";")[0]).join("; ");
  console.log(`Session ready. Cookies: ${sessionCookie ? "obtained" : "none"}\n`);
}

function apiHeaders() {
  return {
    ...BASE_HEADERS,
    Accept: "application/json, text/plain, */*",
    Referer: "https://www.redfin.com/",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    ...(sessionCookie ? { Cookie: sessionCookie } : {}),
  };
}

// Resolve a location string to a Redfin region_id.
async function resolveRegionId(location) {
  await initSession();
  const url = "https://www.redfin.com/stingray/do/location-autocomplete";
  const params = { location, start: 0, count: 10, v: 2 };

  const res = await axios.get(url, { headers: apiHeaders(), params });
  const data = parseRedfinResponse(res.data);

  const results = data?.payload?.sections ?? [];
  console.log("Location autocomplete results:");
  for (const section of results) {
    for (const row of section.rows ?? []) {
      console.log(`  id=${row.id}  type=${row.type}  name=${row.name}`);
    }
  }

  const exact = data?.payload?.exactMatch;
  if (exact) {
    console.log(`\nExact match -> id=${exact.id}  name=${exact.name}`);
    return exact.id;
  }
  return null;
}

// Fetch rental listings for a configured region.
async function fetchRentals(config) {
  if (!config.region_id) {
    throw new Error(
      'region_id is not set in config.js. Run: node run.js --resolve "City, ST"'
    );
  }

  await initSession();

  const url = "https://www.redfin.com/stingray/api/gis";
  const params = {
    al: 1,
    isRentals: true,
    num_homes: config.num_homes,
    ord: "days-on-redfin-asc",
    page_number: 1,
    region_id: config.region_id,
    region_type: config.region_type,
    sf: "1,2,3,5,6,7",
    status: config.status,
    uipt: config.uipt,
    v: 8,
  };

  const res = await axios.get(url, { headers: apiHeaders(), params });
  const data = parseRedfinResponse(res.data);

  if (data?.errorMessage && data.errorMessage !== "Success") {
    throw new Error(`Redfin API error: ${data.errorMessage}`);
  }

  return data?.payload?.homes ?? [];
}

module.exports = { resolveRegionId, fetchRentals };
