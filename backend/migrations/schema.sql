DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS saved_listings CASCADE;
DROP TABLE IF EXISTS listing_amenities CASCADE;
DROP TABLE IF EXISTS listing_images CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  user_id                SERIAL PRIMARY KEY,
  email                  VARCHAR(255) NOT NULL UNIQUE,
  password_hash          VARCHAR(255) NOT NULL,
  phone_number           VARCHAR(50),
  created_at             TIMESTAMP DEFAULT NOW(),
  notification_frequency VARCHAR(50)
);

CREATE TABLE user_preferences (
  preference_id    SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  min_price        INTEGER,
  max_price        INTEGER,
  max_distance_miles NUMERIC(4,1),
  price_rank       INTEGER,
  location_rank    INTEGER,
  rooms_rank       INTEGER,
  sociability_rank INTEGER,
  amenities_rank   INTEGER,
  UNIQUE (user_id)
);

CREATE TABLE listings (
  listing_id     SERIAL PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  street_address VARCHAR(255),
  city           VARCHAR(255),
  montly_rent    INTEGER NOT NULL,
  num_bedrooms   INTEGER,
  num_bathrooms  INTEGER,
  description    TEXT,
  date_scraped   TIMESTAMP DEFAULT NOW(),
  source_url     VARCHAR(500)
);

CREATE TABLE saved_listings (
  saved_listing_id SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  listing_id       INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
  saved_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE amenities (
  amenity_id   SERIAL PRIMARY KEY,
  amenity_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE listing_amenities (
  listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
  amenity_id INTEGER NOT NULL REFERENCES amenities(amenity_id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

CREATE TABLE listing_images (
  image_id      SERIAL PRIMARY KEY,
  listing_id    INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
  image_url     VARCHAR(500) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);
