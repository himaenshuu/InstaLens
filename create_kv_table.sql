-- Create the KV store table for caching profile data
-- This table is used by the current application for temporary data storage
CREATE TABLE IF NOT EXISTS kv_store_b9769089 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_kv_store_b9769089_created_at ON kv_store_b9769089(created_at);
CREATE INDEX IF NOT EXISTS idx_kv_store_b9769089_updated_at ON kv_store_b9769089(updated_at);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_kv_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kv_store_b9769089_updated_at 
    BEFORE UPDATE ON kv_store_b9769089 
    FOR EACH ROW 
    EXECUTE FUNCTION update_kv_updated_at_column();

-- Optional: Add a cleanup function for old cache entries (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_cache_entries()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM kv_store_b9769089 
    WHERE created_at < (CURRENT_TIMESTAMP - INTERVAL '24 hours');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';