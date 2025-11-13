-- Create influencer profiles table
CREATE TABLE IF NOT EXISTS influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  profile_image_url TEXT,
  bio TEXT,
  followers_count BIGINT DEFAULT 0,
  following_count BIGINT DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  external_url TEXT,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  instagram_post_id VARCHAR(255) UNIQUE,
  image_url TEXT NOT NULL,
  caption TEXT,
  likes_count BIGINT DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  post_type VARCHAR(50) DEFAULT 'post',
  posted_at VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reels table
CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  instagram_reel_id VARCHAR(255) UNIQUE,
  thumbnail_url TEXT NOT NULL,
  caption TEXT,
  views_count BIGINT DEFAULT 0,
  likes_count BIGINT DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  duration VARCHAR(20),
  posted_at VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON influencer_profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_last_scraped ON influencer_profiles(last_scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_instagram_id ON posts(instagram_post_id);
CREATE INDEX IF NOT EXISTS idx_reels_profile_id ON reels(profile_id);
CREATE INDEX IF NOT EXISTS idx_reels_instagram_id ON reels(instagram_reel_id);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_influencer_profiles_updated_at 
    BEFORE UPDATE ON influencer_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reels_updated_at 
    BEFORE UPDATE ON reels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

-- Create policies to allow read access to authenticated users
CREATE POLICY "Allow read access to influencer profiles" 
  ON influencer_profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow read access to posts" 
  ON posts FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow read access to reels" 
  ON reels FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow service role full access (for the API function)
CREATE POLICY "Allow service role full access to profiles" 
  ON influencer_profiles 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to posts" 
  ON posts 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to reels" 
  ON reels 
  USING (true) 
  WITH CHECK (true);
