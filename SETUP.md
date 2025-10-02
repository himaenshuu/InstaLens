# InstaLens - Local Development Setup

InstaLens is a React-based Instagram analytics application that allows you to scrape and analyze Instagram profiles using Supabase backend and Apify services.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory (if not already there)
cd "d:\Himanshu\Non Academics\projects\InstaLens"

# Install all dependencies
npm install
```

### 2. Environment Configuration

The project requires several environment variables to function properly. These are already configured in your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://rjkeumzejojdzazrckew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Apify Configuration (for Instagram scraping)  
VITE_APIFY_API_TOKEN=apify_api_wlD1IGTXMh0BftbNKpWBId7RrJAtVq06FJ9x

# Server Configuration
VITE_API_BASE_URL=https://rjkeumzejojdzazrckew.supabase.co/functions/v1
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## 🔧 Testing Database Connectivity

The application includes built-in tools to test your database and API connections:

### Environment Variables Check
- Navigate to http://localhost:3000
- Scroll down to the "System Status" section
- The **Environment Variables Check** card will show the status of all required variables

### Database Connection Test
- In the same "System Status" section, click **"Test Database Connection"**
- This tests the connection to your Supabase PostgreSQL database
- A successful test means your Supabase configuration is working

### API Health Check
- Click **"Test API Health"** to verify the Supabase REST API is accessible
- This tests the basic connectivity to your Supabase project

## 📁 Project Structure

```
InstaLens/
├── src/
│   ├── components/
│   │   ├── DatabaseTest.tsx      # Database connectivity testing
│   │   ├── EnvTest.tsx          # Environment variables verification
│   │   ├── LandingPage.tsx      # Main landing page
│   │   ├── LoginPage.tsx        # User authentication
│   │   ├── ProfileContent.tsx   # Instagram profile display
│   │   └── ui/                  # Reusable UI components
│   ├── utils/
│   │   └── supabase/
│   │       ├── client.ts        # Supabase client configuration
│   │       └── info.tsx         # Supabase connection utilities
│   ├── services/
│   │   └── api.ts              # API service functions
│   └── main.tsx                # Application entry point
├── .env                        # Environment variables (configured)
├── package.json               # Dependencies and scripts
└── vite.config.ts            # Vite configuration
```

## 🗄️ Database Connection Status

Your database connection should work out of the box with the provided configuration:

- **Supabase Project**: rjkeumzejojdzazrckew.supabase.co
- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Using anonymous key for public read access

### Common Connection Results:

✅ **Success**: Database connection test returns expected "table not found" error (this is normal!)
✅ **Success**: API Health check returns status 200
⚠️ **Expected**: You may see a 404 error for non-existent tables - this means the connection is working

## 🔍 Features Available

1. **Instagram Profile Scraping**: Search and analyze public Instagram profiles
2. **Real-time Data**: Get current follower counts, posts, and engagement metrics
3. **Analytics Dashboard**: View detailed analytics and insights
4. **Database Integration**: Store and retrieve user data via Supabase
5. **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## 🔐 API Services

### Supabase (Database & Auth)
- **Purpose**: User authentication, data storage
- **Status**: ✅ Configured and ready
- **URL**: https://rjkeumzejojdzazrckew.supabase.co

### Apify (Instagram Scraping)
- **Purpose**: Instagram profile and post data scraping
- **Status**: ✅ API key configured
- **Rate Limits**: Check Apify dashboard for current usage

## ❗ Troubleshooting

### Database Connection Issues
1. **404 Errors**: These are expected when testing with non-existent tables
2. **Connection Timeout**: Check your internet connection
3. **API Key Invalid**: Verify the VITE_SUPABASE_ANON_KEY in .env file

### Environment Variables Not Loading
1. Ensure `.env` file is in the project root directory
2. Restart the development server after making changes
3. Variables must start with `VITE_` to be accessible in the browser

### Build Errors
1. Run `npm install` to ensure all dependencies are installed
2. Check that Node.js version is 16 or higher
3. Clear cache: `npm run clean` (if available)

## 🚀 Deployment Notes

When deploying to production:
1. Update environment variables for your production Supabase instance
2. Configure proper CORS settings in Supabase
3. Set up Row Level Security (RLS) policies for database tables
4. Consider rate limiting for Apify API calls

## 📞 Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Use the built-in diagnostic tools on the homepage
3. Verify all environment variables are properly set
4. Ensure your Supabase project is active and accessible

---

**Project Status**: ✅ Ready for local development
**Database**: ✅ Connected and responsive
**APIs**: ✅ Configured and accessible