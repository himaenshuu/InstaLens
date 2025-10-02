# InstaLens Data Flow & Logic Explanation

## 📊 Complete Data Flow Architecture

```
┌─────────────┐
│   User      │
│  Browser    │
└──────┬──────┘
       │ 1. Search "cristiano"
       ↓
┌──────────────────────────────────┐
│  Frontend (React + Vite)         │
│  - SearchWithSuggestions.tsx     │
│  - App.tsx                       │
└──────┬───────────────────────────┘
       │ 2. API Call: scrapeProfile("cristiano")
       ↓
┌──────────────────────────────────────────────┐
│  API Layer (src/services/api.ts)             │
│  - Makes POST request to Supabase Function   │
└──────┬───────────────────────────────────────┘
       │ 3. POST /functions/v1/make-server-b9769089/scrape-profile
       ↓
┌─────────────────────────────────────────────────────────────┐
│  Supabase Edge Function                                     │
│  (supabase/functions/make-server-b9769089/index.ts)         │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  STEP 1: Check Database First                    │      │
│  │  - Query: SELECT * FROM influencer_profiles      │      │
│  │           WHERE username = 'cristiano'           │      │
│  │  - If found AND fresh (< 7 days): Return DB data│      │
│  └──────────────────────────────────────────────────┘      │
│                     │                                        │
│                     │ Not found or expired                   │
│                     ↓                                        │
│  ┌──────────────────────────────────────────────────┐      │
│  │  STEP 2: Check Cache (KV Store)                  │      │
│  │  - Query: SELECT * FROM kv_store_b9769089        │      │
│  │           WHERE key = 'profile_cristiano'        │      │
│  │  - If found AND fresh (< 24 hours): Return cache│      │
│  └──────────────────────────────────────────────────┘      │
│                     │                                        │
│                     │ Not found or expired                   │
│                     ↓                                        │
│  ┌──────────────────────────────────────────────────┐      │
│  │  STEP 3: Scrape from Instagram via Apify         │      │
│  └──────────────────────────────────────────────────┘      │
└──────┬──────────────────────────────────────────────────────┘
       │ 4. API Call to Apify
       ↓
┌─────────────────────────────────────┐
│  Apify API (Instagram Scraper)      │
│  - Actor: apify/instagram-scraper   │
│  - Real-time scraping of Instagram  │
└──────┬──────────────────────────────┘
       │ 5. Returns scraped data
       │    (username, followers, posts, reels, etc.)
       ↓
┌─────────────────────────────────────────────────────────────┐
│  Supabase Edge Function (Processing)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  STEP 4: Store in Database                       │      │
│  │  - INSERT into influencer_profiles               │      │
│  │  - INSERT into influencer_posts (all posts)      │      │
│  │  - INSERT into influencer_reels (all reels)      │      │
│  │  - Timestamp: scraped_at = NOW()                 │      │
│  └──────────────────────────────────────────────────┘      │
│                     │                                        │
│                     ↓                                        │
│  ┌──────────────────────────────────────────────────┐      │
│  │  STEP 5: Store in Cache (KV Store)               │      │
│  │  - INSERT into kv_store_b9769089                 │      │
│  │  - Key: 'profile_cristiano'                      │      │
│  │  - Value: Complete profile JSON                  │      │
│  │  - Expires: 24 hours                             │      │
│  └──────────────────────────────────────────────────┘      │
│                     │                                        │
│                     ↓                                        │
│  ┌──────────────────────────────────────────────────┐      │
│  │  STEP 6: Return to Frontend                      │      │
│  │  - Returns formatted data                        │      │
│  │  - Source: "apify" (fresh scrape)                │      │
│  └──────────────────────────────────────────────────┘      │
└──────┬──────────────────────────────────────────────────────┘
       │ 6. JSON Response with profile data
       ↓
┌──────────────────────────────────┐
│  Frontend Renders Data           │
│  - Profile card with stats       │
│  - Posts grid                    │
│  - Reels carousel                │
└──────────────────────────────────┘
```

---

## 🔄 Data Storage Hierarchy & TTL (Time To Live)

### **3-Layer Caching Strategy:**

```
Layer 1: Database (Permanent)
├── TTL: 7 days (considered "fresh")
├── Tables: influencer_profiles, influencer_posts, influencer_reels
├── Purpose: Long-term storage, historical data
└── Auto-delete: NO (manual cleanup required)

Layer 2: KV Cache (Temporary)
├── TTL: 24 hours
├── Table: kv_store_b9769089
├── Purpose: Quick lookups, reduce API calls
└── Auto-delete: YES (expired entries cleaned automatically)

Layer 3: Apify API (Real-time)
├── TTL: N/A (always fresh)
├── Purpose: Source of truth for latest data
└── Cost: Credits per scrape
```

---

## ⏰ Data Freshness Logic

### **Decision Tree for Each Search:**

```typescript
function getProfileData(username: string) {
  // 1. Check Database First
  const dbProfile = await getFromDatabase(username);
  
  if (dbProfile && isWithin7Days(dbProfile.scraped_at)) {
    console.log("✅ Returning from DATABASE (fresh)");
    return { ...dbProfile, source: "database" };
  }
  
  // 2. Check Cache Next
  const cachedProfile = await getFromCache(username);
  
  if (cachedProfile && isWithin24Hours(cachedProfile.created_at)) {
    console.log("✅ Returning from CACHE (fresh)");
    return { ...cachedProfile, source: "cache" };
  }
  
  // 3. Scrape Fresh Data
  console.log("🔄 Scraping FRESH data from Instagram...");
  const freshProfile = await scrapeFromApify(username);
  
  // 4. Store in Both Database and Cache
  await storeInDatabase(freshProfile);
  await storeInCache(freshProfile);
  
  return { ...freshProfile, source: "apify" };
}
```

---

## 🗑️ Data Deletion & Cleanup Logic

### **Current Implementation:**

#### **1. Database (Manual Cleanup)**
```sql
-- Database data is NOT auto-deleted
-- Stays until manually removed
-- Advantage: Historical data preserved
-- Disadvantage: Storage grows over time
```

**Manual Cleanup Options:**
```sql
-- Delete old profiles (older than 30 days)
DELETE FROM influencer_profiles 
WHERE scraped_at < NOW() - INTERVAL '30 days';

-- Delete specific profile
DELETE FROM influencer_profiles 
WHERE username = 'cristiano';
```

#### **2. KV Cache (Auto-Cleanup)**
```typescript
// Cache entries have built-in expiration
const cacheEntry = {
  key: `profile_${username}`,
  value: profileData,
  created_at: new Date(),
  // Automatically considered expired after 24 hours
};

// Expired check in code:
const isExpired = (createdAt: Date) => {
  const age = Date.now() - createdAt.getTime();
  return age > 24 * 60 * 60 * 1000; // 24 hours
};
```

**Auto-Cleanup Strategy:**
- ✅ Entries older than 24 hours are **ignored** (not returned)
- ❌ NOT physically deleted (they remain in database)
- 💡 Recommendation: Add a cron job to delete old cache entries

---

## 🎯 Search Suggestions Logic

### **How Autocomplete Works:**

```typescript
// In SearchWithSuggestions.tsx
const fetchSuggestions = async (query: string) => {
  // 1. Get ALL profiles from database
  const allProfiles = await api.getProfiles();
  
  // 2. Filter by search query
  const filtered = allProfiles.filter(profile => 
    profile.username.toLowerCase().includes(query.toLowerCase()) ||
    profile.full_name?.toLowerCase().includes(query.toLowerCase())
  );
  
  // 3. Sort by followers (most popular first)
  const sorted = filtered.sort((a, b) => 
    b.followers_count - a.followers_count
  );
  
  // 4. Limit to top 5 results
  return sorted.slice(0, 5);
};
```

**Example:**
- User types: "cris"
- System queries database for ALL profiles
- Filters: ["cristiano", "cristina_fitness", "crisis_news"]
- Shows top 5 by follower count
- User clicks → loads profile (from DB if fresh, else scrapes)

---

## 💡 Performance Optimizations

### **1. Reduce Apify API Calls (Save Credits)**
```
✅ Check database first (7-day TTL)
✅ Check cache second (24-hour TTL)
✅ Only scrape if no fresh data exists
```

### **2. Fast Search Results**
```
✅ Search suggestions load from database (instant)
✅ No API calls needed for autocomplete
✅ Only scrapes on profile view
```

### **3. Database Efficiency**
```
✅ Indexes on username, scraped_at
✅ JSONB for flexible post/reel data
✅ Foreign keys for data integrity
```

---

## 📈 Example Timeline

```
Day 0, 10:00 AM - User searches "cristiano"
├── ❌ Not in DB → ❌ Not in cache
├── 🔄 Scrapes from Apify (665M followers)
├── 💾 Stores in database (expires Day 7)
└── 💾 Stores in cache (expires Day 1)

Day 0, 2:00 PM - User searches "cristiano" again
├── ✅ Found in cache (4 hours old)
└── ⚡ Returns cached data instantly

Day 1, 11:00 AM - User searches "cristiano"
├── ❌ Cache expired (25 hours old)
├── ✅ Found in database (1 day old, still fresh)
└── ⚡ Returns database data

Day 7, 10:01 AM - User searches "cristiano"
├── ❌ Cache expired
├── ❌ Database data expired (7 days + 1 minute)
├── 🔄 Scrapes fresh data from Apify
├── 💾 Updates database with new data
└── 💾 Creates new cache entry
```

---

## 🛠️ Recommended Improvements

### **1. Add Cron Job for Cache Cleanup**
```sql
-- Run daily to clean old cache entries
DELETE FROM kv_store_b9769089 
WHERE created_at < NOW() - INTERVAL '24 hours';
```

### **2. Add Database Cleanup Strategy**
```sql
-- Option A: Delete very old profiles (90 days)
DELETE FROM influencer_profiles 
WHERE scraped_at < NOW() - INTERVAL '90 days';

-- Option B: Keep only recent scrapes per profile
DELETE FROM influencer_profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (username) id 
  FROM influencer_profiles 
  ORDER BY username, scraped_at DESC
);
```

### **3. Add Refresh Button**
```typescript
// Allow users to force fresh scrape
const handleRefresh = async () => {
  await api.scrapeProfile(username, { forceRefresh: true });
};
```

---

## 🎓 Summary

**Your InstaLens app uses a smart 3-layer system:**

1. **Database** = Long-term storage (7 days fresh)
2. **Cache** = Quick lookups (24 hours fresh)
3. **Apify** = Real-time source (always fresh, costs credits)

**Data flow priorities:**
Database → Cache → Apify API (only if needed)

**Cleanup:**
- Cache: Ignored after 24 hours (not deleted automatically)
- Database: Stays forever (manual cleanup recommended)

**Cost savings:**
- Multiple searches = 1 Apify call (thanks to caching!)
- Search suggestions = 0 Apify calls (uses database)

**Result:**
Fast, efficient, and cost-effective Instagram data scraping! 🚀