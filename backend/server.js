require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const SELECT_PREFERENCES = `
  SELECT up.preference_id, up.user_id, up.min_price, up.max_price,
         up.max_distance_miles, up.price_rank, up.location_rank,
         up.rooms_rank, up.sociability_rank, up.amenities_rank,
         u.notification_frequency
  FROM user_preferences up
  JOIN users u ON u.user_id = up.user_id
  WHERE up.user_id = 1
`;

app.get("/api/preferences", async (req, res) => {
  try {
    const result = await pool.query(SELECT_PREFERENCES);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

app.put("/api/preferences", async (req, res) => {
  const {
    min_price, max_price, max_distance_miles,
    price_rank, location_rank, rooms_rank, sociability_rank, amenities_rank,
    notification_frequency,
  } = req.body;

  try {
    const existing = await pool.query(
      "SELECT preference_id FROM user_preferences WHERE user_id = 1"
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE user_preferences
         SET min_price=$1, max_price=$2, max_distance_miles=$3,
             price_rank=$4, location_rank=$5, rooms_rank=$6,
             sociability_rank=$7, amenities_rank=$8
         WHERE user_id = 1`,
        [min_price, max_price, max_distance_miles ?? null,
         price_rank, location_rank, rooms_rank, sociability_rank, amenities_rank]
      );
    } else {
      await pool.query(
        `INSERT INTO user_preferences
           (user_id, min_price, max_price, max_distance_miles,
            price_rank, location_rank, rooms_rank, sociability_rank, amenities_rank)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)`,
        [min_price, max_price, max_distance_miles ?? null,
         price_rank, location_rank, rooms_rank, sociability_rank, amenities_rank]
      );
    }

    if (notification_frequency) {
      await pool.query(
        "UPDATE users SET notification_frequency = $1 WHERE user_id = 1",
        [notification_frequency]
      );
    }

    const result = await pool.query(SELECT_PREFERENCES);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
