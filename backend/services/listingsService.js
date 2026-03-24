const pool = require("../migrations/database");

const getAllListings = async () => {
  const result = await pool.query(
    `SELECT
       l.listing_id,
       l.title,
       l.street_address,
       l.city,
       l.montly_rent,
       l.num_bedrooms,
       l.num_bathrooms,
       l.description,
       l.date_scraped,
       l.source_url,
       COALESCE(img.image_url, '/placeholder.svg') AS image_url,
       COALESCE(
         array_agg(DISTINCT a.amenity_name) FILTER (WHERE a.amenity_name IS NOT NULL),
         '{}'
       ) AS amenities
     FROM listings l
     LEFT JOIN LATERAL (
       SELECT li.image_url
       FROM listing_images li
       WHERE li.listing_id = l.listing_id
       ORDER BY li.display_order ASC, li.image_id ASC
       LIMIT 1
     ) img ON TRUE
     LEFT JOIN listing_amenities la ON la.listing_id = l.listing_id
     LEFT JOIN amenities a ON a.amenity_id = la.amenity_id
     GROUP BY l.listing_id, img.image_url
     ORDER BY l.montly_rent ASC, l.listing_id ASC`
  );

  return result.rows;
};

module.exports = {
  getAllListings,
};
