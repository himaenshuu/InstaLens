# Instagram Influencer Profile Database Schema

## Overview

This database schema is designed for an Instagram Influencer Profile Web Application that stores and analyzes influencer data, posts, reels, and audience demographics.

## Tables Structure

### 1. Core Tables

#### `influencers`
- **Purpose**: Stores core influencer profile information
- **Key Fields**: 
  - `influencer_id` (UUID, Primary Key)
  - `username` (Unique Instagram handle)
  - `display_name`, `profile_picture_url`, `bio`
  - `followers_count`, `following_count`, `posts_count`
  - `avg_likes_per_post`, `avg_comments_per_post`, `engagement_rate`
- **Features**: Automated engagement rate calculation, verification status

#### `posts`
- **Purpose**: Stores individual Instagram posts data
- **Key Fields**:
  - `post_id` (UUID, Primary Key)
  - `influencer_id` (Foreign Key)
  - `instagram_post_id` (Instagram's shortcode)
  - `image_url`, `caption_text`
  - `likes_count`, `comments_count`
  - `keywords`, `auto_tags`, `vibe_classification`
  - Quality scores for image, text, and overall content
- **Features**: Auto-generated content analysis, quality indicators

#### `reels`
- **Purpose**: Stores Instagram Reels data
- **Key Fields**:
  - `reel_id` (UUID, Primary Key)
  - `influencer_id` (Foreign Key)
  - `thumbnail_url`, `video_url`, `duration_seconds`
  - `views_count`, `likes_count`, `comments_count`
  - `descriptive_tags`, `objects_identified`, `events_identified`
  - Video and audio quality scores
- **Features**: Advanced content analysis for video content

#### `audience_demographics` (Bonus)
- **Purpose**: Stores audience demographic data for influencers
- **Key Fields**:
  - Gender distribution percentages
  - Age group breakdowns
  - Geographic distribution (JSONB)
  - Languages, interests
  - Confidence scores for data reliability

### 2. Utility Tables

#### `hashtags`
- **Purpose**: Manages hashtags with usage tracking
- **Features**: Category classification, usage statistics

#### `post_hashtags` & `reel_hashtags`
- **Purpose**: Junction tables linking posts/reels to hashtags
- **Benefits**: Efficient hashtag querying and analysis

#### `kv_store_b9769089`
- **Purpose**: Key-value store for caching scraped data
- **Features**: Automatic cleanup of old entries

## Key Features

### 1. Data Integrity
- Comprehensive foreign key relationships
- Check constraints for data validation
- Proper indexing for performance

### 2. Performance Optimization
- Strategic indexes on frequently queried columns
- GIN indexes for JSONB columns
- Composite indexes for complex queries

### 3. Automated Calculations
- Triggers automatically update engagement metrics
- Real-time calculation of average likes/comments
- Dynamic engagement rate computation

### 4. Flexible Content Analysis
- JSONB fields for extensible metadata
- Support for AI-generated tags and classifications
- Quality scoring system for content assessment

### 5. Views for Common Operations
- `influencer_overview`: Complete influencer statistics
- `top_performing_posts`: Best performing content
- `engagement_analytics`: Comprehensive engagement metrics

## Usage Examples

### Find Top Influencers by Engagement
```sql
SELECT username, followers_count, engagement_rate 
FROM influencers 
WHERE followers_count > 10000 
ORDER BY engagement_rate DESC 
LIMIT 10;
```

### Get Posts with Specific Hashtags
```sql
SELECT p.*, i.username
FROM posts p
JOIN influencers i ON p.influencer_id = i.influencer_id
JOIN post_hashtags ph ON p.post_id = ph.post_id
JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
WHERE h.tag IN ('fashion', 'style', 'ootd');
```

### Analyze Audience Demographics
```sql
SELECT i.username, i.followers_count, ad.*
FROM influencers i
JOIN audience_demographics ad ON i.influencer_id = ad.influencer_id
WHERE i.followers_count > 100000
ORDER BY i.followers_count DESC;
```

## Implementation Notes

### 1. Data Types
- **UUID**: Used for all primary keys for better scalability
- **JSONB**: For flexible metadata storage with indexing support
- **DECIMAL**: For precise percentage and score calculations
- **TIMESTAMP WITH TIME ZONE**: For proper timezone handling

### 2. Scalability Considerations
- Partitioning ready for large datasets
- Efficient indexing strategy
- Normalized hashtag storage to prevent duplication

### 3. Content Analysis Integration
- Ready for AI/ML integration
- Extensible JSONB fields for new analysis types
- Quality scoring framework for content assessment

### 4. Cache Management
- Built-in cache table for API responses
- Automatic cleanup functions
- Configurable cache retention periods

## Migration Strategy

1. **Phase 1**: Create core tables (influencers, posts, reels)
2. **Phase 2**: Add utility tables and relationships
3. **Phase 3**: Implement triggers and views
4. **Phase 4**: Add audience demographics (bonus feature)

## Security Considerations

- Row Level Security (RLS) ready
- No sensitive data stored in plain text
- Proper foreign key cascading for data cleanup
- Input validation through check constraints

## Maintenance

### Regular Tasks
- Run `cleanup_old_cache_entries()` function periodically
- Monitor index usage and optimize as needed
- Update engagement metrics calculation logic as Instagram API changes

### Performance Monitoring
- Track query performance on main tables
- Monitor JSONB field usage patterns
- Analyze index effectiveness over time