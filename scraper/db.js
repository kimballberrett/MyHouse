const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const DB_PATH = path.join(__dirname, "listings.db");
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS raw_listings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    fetched_at    TEXT DEFAULT (datetime('now')),
    cl_id         TEXT UNIQUE,
    title         TEXT,
    price         INTEGER,
    location      TEXT,
    url           TEXT,
    beds          INTEGER,
    baths         INTEGER,
    latitude      REAL,
    longitude     REAL,
    property_type TEXT,
    raw_json      TEXT
  );
`);

const upsert = db.prepare(`
  INSERT INTO raw_listings
    (cl_id, title, price, location, url, beds, baths, latitude, longitude, property_type, raw_json)
  VALUES
    (:cl_id, :title, :price, :location, :url, :beds, :baths, :latitude, :longitude, :property_type, :raw_json)
  ON CONFLICT (cl_id) DO NOTHING
`);

// Returns true if the listing was new, false if it was a duplicate.
function upsertListing(row) {
  const result = upsert.run(row);
  return result.changes > 0;
}

function getCount() {
  return db.prepare("SELECT COUNT(*) AS n FROM raw_listings").get().n;
}

module.exports = { upsertListing, getCount };
