-- Instagram Influencer Profile Web Application Database Schema
-- Created: October 1, 2025
-- Description: Comprehensive database schema for storing influencer profiles, posts, reels, and analytics

-- =============================================================================
-- 1. INFLUENCERS TABLE
-- =============================================================================
-- Stores core influencer profile information
CREATE TABLE influencers (
    influencer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE, -- Instagram handle without @
    display_name VARCHAR(255), -- Influencer's display name
    profile_picture_url TEXT,
    bio TEXT,
    followers_count BIGINT DEFAULT 0,
    following_count BIGINT DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    external_url TEXT, -- Website/link in bio
    category VARCHAR(100), -- e.g., 'fashion', 'travel', 'food', etc.
    
    -- Engagement metrics (calculated fields)
    avg_likes_per_post DECIMAL(10,2) DEFAULT 0,
    avg_comments_per_post DECIMAL(10,2) DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0, -- Percentage as decimal (e.g., 0.0350 = 3.5%)
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT check_followers_count CHECK (followers_count >= 0),
    CONSTRAINT check_following_count CHECK (following_count >= 0),
    CONSTRAINT check_posts_count CHECK (posts_count >= 0),
    CONSTRAINT check_engagement_rate CHECK (engagement_rate >= 0 AND engagement_rate <= 1)
);

-- Indexes for influencers table
CREATE INDEX idx_influencers_username ON influencers(username);
CREATE INDEX idx_influencers_followers_count ON influencers(followers_count DESC);
CREATE INDEX idx_influencers_engagement_rate ON influencers(engagement_rate DESC);
CREATE INDEX idx_influencers_category ON influencers(category);
CREATE INDEX idx_influencers_last_scraped_at ON influencers(last_scraped_at);

-- =============================================================================
-- 2. POSTS TABLE
-- =============================================================================
-- Stores individual Instagram posts data
CREATE TABLE posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID NOT NULL REFERENCES influencers(influencer_id) ON DELETE CASCADE,
    instagram_post_id VARCHAR(255) UNIQUE, -- Instagram's internal post ID/shortcode
    post_type VARCHAR(20) DEFAULT 'image', -- 'image', 'carousel', 'video'
    
    -- Content data
    image_url TEXT NOT NULL, -- Main image/thumbnail URL
    thumbnail_url TEXT, -- Smaller thumbnail for quick loading
    caption_text TEXT,
    alt_text TEXT, -- Accessibility text
    
    -- Engagement metrics
    likes_count BIGINT DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0, -- If available
    saves_count INTEGER DEFAULT 0, -- If available
    
    -- Auto-generated analysis
    keywords JSONB, -- Array of extracted keywords/hashtags
    auto_tags JSONB, -- Array of auto-generated tags
    vibe_classification VARCHAR(50), -- e.g., 'professional', 'casual', 'luxury', 'minimal'
    dominant_colors JSONB, -- Array of hex color codes
    
    -- Quality indicators
    image_quality_score DECIMAL(3,2), -- 0.00 to 10.00
    text_readability_score DECIMAL(3,2), -- 0.00 to 10.00
    overall_quality_score DECIMAL(3,2), -- 0.00 to 10.00
    
    -- Metadata
    posted_at TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_likes_count CHECK (likes_count >= 0),
    CONSTRAINT check_comments_count CHECK (comments_count >= 0),
    CONSTRAINT check_quality_scores CHECK (
        image_quality_score IS NULL OR (image_quality_score >= 0 AND image_quality_score <= 10)
    )
);

-- Indexes for posts table
CREATE INDEX idx_posts_influencer_id ON posts(influencer_id);
CREATE INDEX idx_posts_instagram_post_id ON posts(instagram_post_id);
CREATE INDEX idx_posts_posted_at ON posts(posted_at DESC);
CREATE INDEX idx_posts_likes_count ON posts(likes_count DESC);
CREATE INDEX idx_posts_engagement ON posts(influencer_id, likes_count DESC, comments_count DESC);
CREATE INDEX idx_posts_vibe_classification ON posts(vibe_classification);
CREATE INDEX idx_posts_quality_score ON posts(overall_quality_score DESC);

-- GIN indexes for JSONB columns
CREATE INDEX idx_posts_keywords_gin ON posts USING gin(keywords);
CREATE INDEX idx_posts_auto_tags_gin ON posts USING gin(auto_tags);

-- =============================================================================
-- 3. REELS TABLE
-- =============================================================================
-- Stores Instagram Reels data
CREATE TABLE reels (
    reel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID NOT NULL REFERENCES influencers(influencer_id) ON DELETE CASCADE,
    instagram_reel_id VARCHAR(255) UNIQUE, -- Instagram's internal reel ID/shortcode
    
    -- Content data
    thumbnail_url TEXT NOT NULL,
    video_url TEXT, -- If available
    caption_text TEXT,
    duration_seconds INTEGER, -- Video duration
    music_info JSONB, -- Track name, artist, etc.
    
    -- Engagement metrics
    views_count BIGINT DEFAULT 0,
    likes_count BIGINT DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    
    -- Auto-generated analysis
    descriptive_tags JSONB, -- Array of descriptive tags
    vibe_classification VARCHAR(50), -- e.g., 'energetic', 'calming', 'funny', 'educational'
    objects_identified JSONB, -- Array of objects/items detected in video
    events_identified JSONB, -- Array of events/activities detected
    text_overlay_detected TEXT, -- Any text overlays found in the reel
    
    -- Quality indicators
    video_quality_score DECIMAL(3,2), -- 0.00 to 10.00
    audio_quality_score DECIMAL(3,2), -- 0.00 to 10.00
    content_relevance_score DECIMAL(3,2), -- 0.00 to 10.00
    overall_quality_score DECIMAL(3,2), -- 0.00 to 10.00
    
    -- Metadata
    posted_at TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_reel_views_count CHECK (views_count >= 0),
    CONSTRAINT check_reel_likes_count CHECK (likes_count >= 0),
    CONSTRAINT check_reel_comments_count CHECK (comments_count >= 0),
    CONSTRAINT check_reel_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0),
    CONSTRAINT check_reel_quality_scores CHECK (
        video_quality_score IS NULL OR (video_quality_score >= 0 AND video_quality_score <= 10)
    )
);

-- Indexes for reels table
CREATE INDEX idx_reels_influencer_id ON reels(influencer_id);
CREATE INDEX idx_reels_instagram_reel_id ON reels(instagram_reel_id);
CREATE INDEX idx_reels_posted_at ON reels(posted_at DESC);
CREATE INDEX idx_reels_views_count ON reels(views_count DESC);
CREATE INDEX idx_reels_engagement ON reels(influencer_id, views_count DESC, likes_count DESC);
CREATE INDEX idx_reels_vibe_classification ON reels(vibe_classification);
CREATE INDEX idx_reels_duration ON reels(duration_seconds);

-- GIN indexes for JSONB columns
CREATE INDEX idx_reels_descriptive_tags_gin ON reels USING gin(descriptive_tags);
CREATE INDEX idx_reels_objects_identified_gin ON reels USING gin(objects_identified);
CREATE INDEX idx_reels_events_identified_gin ON reels USING gin(events_identified);

-- =============================================================================
-- 4. AUDIENCE DEMOGRAPHICS TABLE (BONUS)
-- =============================================================================
-- Stores audience demographic data for influencers
CREATE TABLE audience_demographics (
    demographics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID NOT NULL REFERENCES influencers(influencer_id) ON DELETE CASCADE,
    
    -- Gender distribution (percentages as decimals)
    gender_male_percentage DECIMAL(5,2) DEFAULT 0,
    gender_female_percentage DECIMAL(5,2) DEFAULT 0,
    gender_other_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Age group distribution (percentages as decimals)
    age_13_17_percentage DECIMAL(5,2) DEFAULT 0,
    age_18_24_percentage DECIMAL(5,2) DEFAULT 0,
    age_25_34_percentage DECIMAL(5,2) DEFAULT 0,
    age_35_44_percentage DECIMAL(5,2) DEFAULT 0,
    age_45_54_percentage DECIMAL(5,2) DEFAULT 0,
    age_55_64_percentage DECIMAL(5,2) DEFAULT 0,
    age_65_plus_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Geographic distribution (stored as JSONB for flexibility)
    top_countries JSONB, -- Array of objects: [{"country": "US", "percentage": 45.2}, ...]
    top_cities JSONB, -- Array of objects: [{"city": "New York", "country": "US", "percentage": 12.5}, ...]
    
    -- Additional demographics
    languages JSONB, -- Array of objects: [{"language": "English", "percentage": 78.5}, ...]
    interests JSONB, -- Array of top audience interests
    
    -- Metadata
    data_source VARCHAR(50), -- e.g., 'instagram_insights', 'estimated', 'third_party'
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00 indicating data reliability
    collected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_gender_percentages CHECK (
        (gender_male_percentage + gender_female_percentage + gender_other_percentage) <= 100.01
    ),
    CONSTRAINT check_age_percentages CHECK (
        (age_13_17_percentage + age_18_24_percentage + age_25_34_percentage + 
         age_35_44_percentage + age_45_54_percentage + age_55_64_percentage + 
         age_65_plus_percentage) <= 100.01
    ),
    CONSTRAINT check_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Indexes for audience_demographics table
CREATE INDEX idx_demographics_influencer_id ON audience_demographics(influencer_id);
CREATE INDEX idx_demographics_collected_at ON audience_demographics(collected_at DESC);
CREATE INDEX idx_demographics_confidence_score ON audience_demographics(confidence_score DESC);

-- GIN indexes for JSONB columns
CREATE INDEX idx_demographics_countries_gin ON audience_demographics USING gin(top_countries);
CREATE INDEX idx_demographics_cities_gin ON audience_demographics USING gin(top_cities);
CREATE INDEX idx_demographics_languages_gin ON audience_demographics USING gin(languages);
CREATE INDEX idx_demographics_interests_gin ON audience_demographics USING gin(interests);

-- =============================================================================
-- 5. UTILITY TABLES
-- =============================================================================

-- Hashtags table for better hashtag management
CREATE TABLE hashtags (
    hashtag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag VARCHAR(255) NOT NULL UNIQUE, -- Without the # symbol
    usage_count INTEGER DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_hashtag_format CHECK (tag ~ '^[a-zA-Z0-9_]+$')
);

CREATE INDEX idx_hashtags_tag ON hashtags(tag);
CREATE INDEX idx_hashtags_usage_count ON hashtags(usage_count DESC);
CREATE INDEX idx_hashtags_category ON hashtags(category);

-- Post-Hashtag junction table
CREATE TABLE post_hashtags (
    post_id UUID REFERENCES posts(post_id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(hashtag_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (post_id, hashtag_id)
);

-- Reel-Hashtag junction table
CREATE TABLE reel_hashtags (
    reel_id UUID REFERENCES reels(reel_id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(hashtag_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (reel_id, hashtag_id)
);

-- =============================================================================
-- 6. TRIGGERS FOR AUTOMATED UPDATES
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all main tables
CREATE TRIGGER update_influencers_updated_at 
    BEFORE UPDATE ON influencers 
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

CREATE TRIGGER update_demographics_updated_at 
    BEFORE UPDATE ON audience_demographics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to recalculate influencer engagement metrics
CREATE OR REPLACE FUNCTION recalculate_influencer_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the influencer's metrics based on their posts
    UPDATE influencers 
    SET 
        avg_likes_per_post = (
            SELECT COALESCE(AVG(likes_count), 0)
            FROM posts 
            WHERE influencer_id = COALESCE(NEW.influencer_id, OLD.influencer_id)
        ),
        avg_comments_per_post = (
            SELECT COALESCE(AVG(comments_count), 0)
            FROM posts 
            WHERE influencer_id = COALESCE(NEW.influencer_id, OLD.influencer_id)
        ),
        posts_count = (
            SELECT COUNT(*)
            FROM posts 
            WHERE influencer_id = COALESCE(NEW.influencer_id, OLD.influencer_id)
        )
    WHERE influencer_id = COALESCE(NEW.influencer_id, OLD.influencer_id);
    
    -- Calculate engagement rate: (avg_likes + avg_comments) / followers * 100
    UPDATE influencers 
    SET engagement_rate = CASE 
        WHEN followers_count > 0 THEN 
            LEAST(((avg_likes_per_post + avg_comments_per_post) / followers_count), 1.0)
        ELSE 0 
    END
    WHERE influencer_id = COALESCE(NEW.influencer_id, OLD.influencer_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to recalculate metrics when posts are modified
CREATE TRIGGER recalculate_metrics_on_post_insert
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_influencer_metrics();

CREATE TRIGGER recalculate_metrics_on_post_update
    AFTER UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_influencer_metrics();

CREATE TRIGGER recalculate_metrics_on_post_delete
    AFTER DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_influencer_metrics();

-- =============================================================================
-- 7. VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for influencer overview with calculated metrics
CREATE VIEW influencer_overview AS
SELECT 
    i.influencer_id,
    i.username,
    i.display_name,
    i.profile_picture_url,
    i.followers_count,
    i.following_count,
    i.posts_count,
    i.is_verified,
    i.category,
    i.avg_likes_per_post,
    i.avg_comments_per_post,
    i.engagement_rate,
    COUNT(DISTINCT p.post_id) as actual_posts_count,
    COUNT(DISTINCT r.reel_id) as reels_count,
    i.last_scraped_at,
    i.created_at
FROM influencers i
LEFT JOIN posts p ON i.influencer_id = p.influencer_id
LEFT JOIN reels r ON i.influencer_id = r.influencer_id
GROUP BY i.influencer_id;

-- View for top performing posts
CREATE VIEW top_performing_posts AS
SELECT 
    p.post_id,
    p.instagram_post_id,
    i.username,
    i.display_name,
    p.image_url,
    p.caption_text,
    p.likes_count,
    p.comments_count,
    (p.likes_count + p.comments_count) as total_engagement,
    p.vibe_classification,
    p.overall_quality_score,
    p.posted_at
FROM posts p
JOIN influencers i ON p.influencer_id = i.influencer_id
ORDER BY (p.likes_count + p.comments_count) DESC;

-- View for engagement analytics
CREATE VIEW engagement_analytics AS
SELECT 
    i.influencer_id,
    i.username,
    i.followers_count,
    AVG(p.likes_count) as avg_post_likes,
    AVG(p.comments_count) as avg_post_comments,
    AVG(r.views_count) as avg_reel_views,
    AVG(r.likes_count) as avg_reel_likes,
    i.engagement_rate,
    COUNT(p.post_id) as total_posts,
    COUNT(r.reel_id) as total_reels
FROM influencers i
LEFT JOIN posts p ON i.influencer_id = p.influencer_id
LEFT JOIN reels r ON i.influencer_id = r.influencer_id
GROUP BY i.influencer_id, i.username, i.followers_count, i.engagement_rate;

-- =============================================================================
-- 8. SAMPLE QUERIES AND USAGE EXAMPLES
-- =============================================================================

/*
-- Find top influencers by engagement rate
SELECT username, followers_count, engagement_rate 
FROM influencers 
WHERE followers_count > 10000 
ORDER BY engagement_rate DESC 
LIMIT 10;

-- Get posts with specific hashtags
SELECT p.*, i.username
FROM posts p
JOIN influencers i ON p.influencer_id = i.influencer_id
JOIN post_hashtags ph ON p.post_id = ph.post_id
JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
WHERE h.tag IN ('fashion', 'style', 'ootd');

-- Find influencers with high engagement in specific categories
SELECT * FROM influencer_overview 
WHERE category = 'fashion' 
AND engagement_rate > 0.03 
ORDER BY followers_count DESC;

-- Get audience demographics for top influencers
SELECT i.username, i.followers_count, ad.*
FROM influencers i
JOIN audience_demographics ad ON i.influencer_id = ad.influencer_id
WHERE i.followers_count > 100000
ORDER BY i.followers_count DESC;
*/

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================