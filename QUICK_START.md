# InstaLens - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: (Optional) Set Up Google Cloud Vision API

**For AI-Powered Content Analysis:**

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Cloud Vision API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

4. **Add to Environment**
   - Create a `.env` file in the project root:
   ```env
   VITE_GOOGLE_VISION_API_KEY=your_api_key_here
   ```

**Without API Key:**
The app will automatically fall back to caption-based analysis. Everything works, just with simpler insights!

### Step 3: Run the App
```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## 📱 Features

### ✅ Mobile-Friendly UI
- Responsive hamburger menu
- Touch-optimized interactions
- Horizontal scrollable tabs
- 44x44px minimum touch targets (WCAG compliant)

### 🧠 AI Content Analysis
- **With API Key**: Advanced image analysis using Google Cloud Vision
  - Object detection
  - Text recognition (OCR)
  - Face & emotion detection
  - Dominant color extraction
  - Content safety checks
  - 10+ content categories

- **Without API Key**: Smart caption analysis
  - Hashtag extraction
  - Keyword analysis
  - Sentiment detection
  - Emoji parsing
  - Content categorization
  - Call-to-action detection

### 📊 Live Instagram Feed
- Real-time posts & reels
- Engagement metrics
- Load more functionality
- Refresh on demand

---

## 🎨 Content Analysis Display

When you load a profile, you'll see:

**On Posts/Reels:**
- Content type badges (Food, Fashion, Travel, etc.)
- Top topics extracted from images
- People count and emotions
- Detected hashtags
- Sentiment indicators
- Source badge (Vision AI / Caption / Thumbnail)

**Analysis happens automatically:**
- Progressive loading (results appear as they're analyzed)
- Rate limiting (100ms between API calls)
- Graceful fallback on errors
- Cached results (no duplicate analysis)

---

## 💰 Cost Information

**Google Cloud Vision API:**
- First 1,000 requests/month: **FREE**
- After that: **$1.50 per 1,000 requests**

**Typical Usage:**
- 20 posts × 1 request = 20 API calls
- Cost per profile: **~$0.03**
- 100 profiles/month: **~$3.00**

Most users stay within the free tier! 🎉

---

## 🔧 Troubleshooting

### "Analyzing content..." never completes
- Check your API key is correct in `.env`
- Verify Cloud Vision API is enabled in Google Cloud Console
- Check browser console for errors

### Analysis shows "Caption" source instead of "Vision AI"
- API key might be missing or invalid
- You're within the free tier (feature, not a bug!)
- App automatically falls back to caption analysis

### Mobile menu not working
- Clear browser cache
- Check if JavaScript is enabled
- Try different browser

### Posts not loading
- Check internet connection
- Refresh the page
- Check browser console for API errors

---

## 📚 Documentation

- **[Mobile UI Implementation](./MOBILE_UI_IMPLEMENTATION.md)** - Details on mobile optimizations
- **[Content Analysis Guide](./README_CONTENT_ANALYSIS.md)** - Comprehensive analysis documentation
- **[Main README](./README.md)** - Project overview

---

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── PostsSection.tsx       # Posts grid with analysis
│   ├── ReelsSection.tsx       # Reels carousel with analysis
│   ├── ContentInsights.tsx    # Analysis display component
│   └── MobileMenu.tsx         # Mobile navigation drawer
├── services/           # Business logic
│   ├── visionService.ts       # Google Cloud Vision integration
│   ├── contentAnalysis.ts     # Caption analysis & fallback
│   └── analysisIntegration.ts # Analysis orchestration
└── styles/            # Global styles
```

### Key Files
- **`visionService.ts`**: Google Cloud Vision API integration
- **`contentAnalysis.ts`**: Caption parsing and fallback system
- **`analysisIntegration.ts`**: Batch processing and rate limiting
- **`ContentInsights.tsx`**: UI for displaying analysis results

---

## 🎯 Next Steps

1. **Test the Analysis**
   - Load a profile
   - Watch analysis results appear progressively
   - Check the source badges (Vision AI vs Caption)

2. **Customize Analysis**
   - Edit `src/services/contentAnalysis.ts` to add more categories
   - Modify `src/components/ContentInsights.tsx` for different UI

3. **Optimize Performance**
   - Enable localStorage caching
   - Implement lazy loading for large profiles
   - Add retry logic for failed API calls

4. **Deploy to Production**
   - Add API key to environment variables
   - Set up API key restrictions in Google Cloud
   - Enable rate limiting on your backend

---

## 💡 Tips

- **Save API Calls**: Analysis results are cached in memory
- **Batch Processing**: Analyzes 20 posts at a time by default
- **Rate Limiting**: 100ms delay between API calls (configurable)
- **Progressive Loading**: Results appear one by one for better UX
- **Error Handling**: Fails gracefully with caption fallback

---

## 🤝 Need Help?

- Check the browser console for detailed error messages
- Review the comprehensive documentation in `README_CONTENT_ANALYSIS.md`
- Ensure all environment variables are set correctly
- Verify Google Cloud project setup is complete

---

**Happy Analyzing! 🎉**
