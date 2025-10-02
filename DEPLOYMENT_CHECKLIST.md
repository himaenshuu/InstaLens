# 🚀 Quick Deployment Checklist

Use this checklist to deploy InstaLens to Vercel in minutes!

## ✅ Pre-Deployment Checklist

- [ ] Code is ready and tested locally (`npm run dev`)
- [ ] All changes are committed to Git
- [ ] `.env` file is in `.gitignore` (NOT committed)
- [ ] Code is pushed to GitHub
- [ ] Have Supabase credentials ready
- [ ] Have Apify API token ready
- [ ] (Optional) Have Google Vision API key ready

## 📝 Quick Steps

### 1️⃣ Push to GitHub (if not done)
```bash
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

### 2️⃣ Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `InstaLens` repository
3. Click **Deploy** (defaults are correct!)
4. Wait ~2 minutes ⏱️

### 3️⃣ Add Environment Variables
Go to **Settings → Environment Variables** and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APIFY_API_TOKEN=your_apify_token
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
VITE_GOOGLE_VISION_API_KEY=your_vision_key (optional)
```

### 4️⃣ Redeploy
- Go to **Deployments** tab
- Click **Redeploy** on latest deployment

### 5️⃣ Verify
- Visit your Vercel URL
- Check System Status section at bottom
- Test login/signup functionality
- Search for an Instagram profile

## 🎉 Done!

Your app is live at: `https://your-app.vercel.app`

---

**For detailed instructions, see:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
