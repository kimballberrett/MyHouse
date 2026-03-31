ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS min_bedrooms INTEGER;

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS min_bathrooms NUMERIC(4,1);

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS desired_amenities TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS last_daily_summary_at TIMESTAMPTZ;

UPDATE user_preferences
SET desired_amenities = ARRAY[]::TEXT[]
WHERE desired_amenities IS NULL;
