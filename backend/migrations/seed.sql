-- Demo user (user_id=1)
INSERT INTO users (email, password_hash, phone_number, notification_frequency)
VALUES (
  'demo@university.edu',
  'scrypt$0f1e2d3c4b5a69788796a5b4c3d2e1f0$86894233de5a05caf4a4fd3795ca8bf818d6a974f6708e9add4d8ebffbee3c6b522b2abb57ee7648c6a3a68e604a29dfbdb816acf543425736e2c4c01d28f5fa',
  '555-0100',
  'daily'
);

-- Default preferences for demo user
INSERT INTO user_preferences
  (user_id, min_price, max_price, max_distance_miles, price_rank, location_rank, rooms_rank, sociability_rank, amenities_rank)
VALUES
  (1, 0, 800, 2.0, 1, 2, 3, 4, 5);

-- Listings
INSERT INTO listings (title, street_address, city, montly_rent, num_bedrooms, num_bathrooms, description, source_url) VALUES
  ('CollegeTown Apartments', '100 College Ave',      'Provo', 450, 1, 1, 'Great location near campus with modern amenities.',       'https://www.facebook.com/marketplace'),
  ('CollegeHouse',           '200 University Blvd',  'Provo', 475, 2, 1, 'Spacious house with in-unit laundry and parking.',        'https://www.facebook.com/marketplace'),
  ('DormPlace',              '300 Campus Dr',        'Provo', 460, 1, 1, 'Affordable dormitory-style housing close to campus.',     'https://www.facebook.com/marketplace'),
  ('DormHouse',              '400 Dorm Ln',          'Provo', 460, 2, 2, 'Large house with multiple rooms and shared spaces.',      'https://www.facebook.com/marketplace'),
  ('DormsRUs',               '500 Student Way',      'Provo', 495, 1, 1, 'Popular student housing with great community vibe.',      'https://www.facebook.com/marketplace');

-- Amenities
INSERT INTO amenities (amenity_name) VALUES
  ('In-unit laundry'),
  ('Street parking'),
  ('Shared room'),
  ('Parking garage'),
  ('Parking lot');

-- Listing amenities junction
INSERT INTO listing_amenities (listing_id, amenity_id) VALUES
  (1,1),(1,2),(1,3),
  (2,1),(2,4),
  (3,5),(3,1),
  (4,2),(4,1),(4,3),
  (5,3),(5,5),(5,1);

-- Listing images
INSERT INTO listing_images (listing_id, image_url, display_order) VALUES
  (1, '/images/listing-1.jpg', 1),
  (2, '/images/listing-2.jpg', 1),
  (3, '/images/listing-3.jpg', 1),
  (4, '/images/listing-4.jpg', 1),
  (5, '/images/listing-5.jpg', 1);

-- Saved listings (demo user has saved two listings)
INSERT INTO saved_listings (user_id, listing_id) VALUES
  (1, 1),
  (1, 3);
