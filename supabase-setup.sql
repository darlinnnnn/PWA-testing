-- Create the data_items table for the PWA app
CREATE TABLE IF NOT EXISTS data_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  device_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE data_items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations" ON data_items
  FOR ALL USING (true);

-- Create an index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_data_items_created_at ON data_items(created_at DESC);

-- Optional: Create a function to get the latest data
CREATE OR REPLACE FUNCTION get_latest_data(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  description TEXT,
  device_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    di.id,
    di.name,
    di.description,
    di.device_token,
    di.created_at
  FROM data_items di
  ORDER BY di.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 