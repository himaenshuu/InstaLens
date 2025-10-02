# 🚀 Deploying InstaLens to Vercel

This guide will walk you through deploying your InstaLens application to Vercel using GitHub integration.

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ A [GitHub account](https://github.com)
- ✅ A [Vercel account](https://vercel.com) (you can sign up with GitHub)
- ✅ Your project pushed to a GitHub repository
- ✅ All environment variables ready (Supabase, Apify, Google Vision API)

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push Changes to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Check current status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "chore: prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

**✅ Files Added for Vercel:**
- `vercel.json` - Vercel configuration for SPA routing
- `.gitignore` - Updated to exclude `.vercel` directory

### 1.2 Verify .env is NOT Tracked

Make sure your `.env` file is NOT pushed to GitHub (it should be in `.gitignore`):

```bash
# This should show .env in the gitignore
cat .gitignore | grep .env
```

## 🌐 Step 2: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click **"Add New..."** → **"Project"**

2. **Import Your GitHub Repository**
   - Click **"Import Git Repository"**
   - Select your GitHub account
   - Find and select **"InstaLens"** repository
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Click "Deploy"**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - Project name? InstaLens
# - Directory? ./
# - Override settings? N

# Deploy to production
vercel --prod
```

## 🔐 Step 3: Configure Environment Variables

After your initial deployment, you need to add environment variables:

### 3.1 Via Vercel Dashboard

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **"Settings"** tab
3. Click **"Environment Variables"** in the sidebar
4. Add the following variables:

#### Required Variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Your Supabase anonymous key |
| `VITE_APIFY_API_TOKEN` | `apify_api_...` | Your Apify API token |
| `VITE_API_BASE_URL` | `https://your-project.supabase.co/functions/v1` | Supabase Functions URL |

#### Optional Variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_GOOGLE_VISION_API_KEY` | `AIza...` | Google Cloud Vision API key (optional) |

**⚠️ Important Notes:**
- Use **"All Environments"** or select **"Production"** for each variable
- Click **"Save"** after adding each variable
- DO NOT include quotes around the values

### 3.2 Via Vercel CLI

```bash
# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APIFY_API_TOKEN
vercel env add VITE_API_BASE_URL
vercel env add VITE_GOOGLE_VISION_API_KEY

# Select environment: Production, Preview, Development
# Paste the value when prompted
```

## 🔄 Step 4: Redeploy with Environment Variables

After adding environment variables, trigger a new deployment:

### Via Dashboard:
1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click **"Redeploy"** button

### Via CLI:
```bash
vercel --prod
```

## ✅ Step 5: Verify Deployment

1. **Visit Your Deployed URL**
   - Vercel will provide a URL like: `https://insta-lens-xyz.vercel.app`
   
2. **Test Key Features:**
   - ✅ Homepage loads correctly
   - ✅ No console errors (open browser DevTools)
   - ✅ Database connection works (check System Status section)
   - ✅ Login/Signup functionality
   - ✅ Instagram profile search

3. **Check System Status:**
   - Scroll to the bottom of the homepage
   - Look for "System Status" section
   - Verify all checks are passing:
     - ✅ Environment Variables Loaded
     - ✅ Database Connected
     - ✅ API Health Check Passed

## 🔗 Step 6: Configure Custom Domain (Optional)

### Via Vercel Dashboard:

1. Go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter your domain name (e.g., `instalens.com`)
4. Follow the DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

## 🔄 Continuous Deployment

Vercel automatically redeploys your app when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel will automatically deploy the changes
```

## 🛠️ Troubleshooting

### Build Fails

**Problem:** Build fails with dependency errors

**Solution:**
```bash
# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Test build locally
npm run build

# Push changes
git add package-lock.json
git commit -m "fix: update dependencies"
git push origin main
```

### Environment Variables Not Working

**Problem:** App can't connect to Supabase/Apify

**Solution:**
1. Verify all environment variables are set in Vercel Dashboard
2. Make sure variable names start with `VITE_` (Vite requirement)
3. Check for typos in variable names and values
4. Redeploy after adding/updating variables

### 404 on Routes

**Problem:** Refreshing the page gives 404 error

**Solution:**
- This should be fixed by the `vercel.json` file
- Verify `vercel.json` exists in your repository root
- Check that it includes the rewrites configuration

### CORS Errors

**Problem:** API calls fail with CORS errors

**Solution:**
1. Check Supabase URL configuration
2. Verify Supabase CORS settings in dashboard
3. Ensure API URLs don't have trailing slashes

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable Vercel Analytics to track:
- Page views
- User interactions
- Performance metrics

1. Go to **"Analytics"** tab in Vercel Dashboard
2. Click **"Enable Analytics"**

### Error Tracking

View runtime errors:
1. Go to **"Functions"** tab (if using Vercel Functions)
2. Check logs for errors
3. Use Vercel's built-in logging

## 🔒 Security Best Practices

1. **Never commit `.env` file** to Git
2. **Rotate API keys** if accidentally exposed
3. **Use Supabase RLS** (Row Level Security) policies
4. **Enable authentication** for sensitive features
5. **Monitor usage** to detect anomalies

## 📝 Environment Variables Reference

Here's where to find your API keys:

### Supabase:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **Settings** → **API**
4. Copy `URL` and `anon` key

### Apify:
1. Go to [console.apify.com](https://console.apify.com)
2. Click **Settings** → **Integrations**
3. Copy your API token

### Google Vision API:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select project → **APIs & Services** → **Credentials**
3. Create/copy API key

## 🎉 Success!

Your InstaLens application is now live on Vercel! 

**Next Steps:**
- Share your deployment URL
- Set up a custom domain
- Monitor application performance
- Add more features and redeploy automatically

## 📞 Support

If you encounter issues:
- 📖 [Vercel Documentation](https://vercel.com/docs)
- 💬 [Vercel Community](https://github.com/vercel/vercel/discussions)
- 🐛 [Report Issues](https://github.com/himaenshuu/InstaLens/issues)

---

**Deployment Status:** 🟢 Ready to Deploy  
**Estimated Time:** 10-15 minutes  
**Difficulty:** Easy 😊
