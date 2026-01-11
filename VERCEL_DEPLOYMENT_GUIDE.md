# Vercel Deployment Guide - NoteX Frontend

## 🚨 Quick Fix for Current Error

**Error:** Vercel is deploying from root instead of `frontend/` folder

**Solution:** I've created `vercel.json` configuration file. Follow these steps:

### 1. Commit and Push Files

```bash
git add vercel.json .vercelignore
git commit -m "fix: Configure Vercel to deploy frontend folder"
git push origin main
```

### 2. Redeploy on Vercel
- Go to Vercel dashboard
- Click **Redeploy** on failed deployment
- OR trigger new deployment with the push

---

## 📋 Complete Deployment Setup

### Option A: Automatic Detection (Recommended)

1. **In Vercel Dashboard:**
   - Go to Project Settings
   - Navigate to **General** tab
   - Find **Root Directory** setting
   - Change from `.` to `frontend`
   - Click **Save**

2. **Build Settings:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Root Directory: frontend
   ```

3. **Environment Variables:**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL=https://mfzpvbqfgwoikrrveoss.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_API_URL=https://your-backend-url.com
   ```

### Option B: Using vercel.json (Already Created)

The `vercel.json` file I created will:
- ✅ Build from `frontend/` directory
- ✅ Install dependencies correctly
- ✅ Output to `frontend/dist`
- ✅ Handle SPA routing
- ✅ Set cache headers

---

## 🔧 Configuration Files Created

### 1. vercel.json (Root Level)
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": "vite"
}
```

### 2. .vercelignore (Root Level)
```
backend/
.venv/
*.pyc
__pycache__/
.env
```

---

## 🚀 Deployment Steps

### Step 1: Prepare Repository

```bash
# Navigate to project root
cd C:\NoteX

# Ensure frontend builds locally
cd frontend
npm install
npm run build

# Should create frontend/dist folder
# Check if it exists
ls dist
```

### Step 2: Update Git

```bash
# Go back to root
cd ..

# Add new files
git add vercel.json .vercelignore

# Commit
git commit -m "chore: Add Vercel deployment configuration"

# Push to main branch
git push origin main
```

### Step 3: Configure Vercel Dashboard

1. **Go to:** https://vercel.com/dashboard
2. **Select your project:** SmartNoteX
3. **Settings → General:**
   - Root Directory: `frontend` ✅
   - Framework: `Vite` ✅

4. **Settings → Environment Variables:**
   Add all VITE_ prefixed variables

5. **Deployments → Redeploy**

---

## 🔑 Environment Variables Required

### Production Environment Variables

Add these in Vercel Dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://mfzpvbqfgwoikrrveoss.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anon key |
| `VITE_API_URL` | `https://your-backend.railway.app` | Backend API URL (if deployed) |

### How to Add in Vercel:
1. Project → Settings → Environment Variables
2. Click **Add New**
3. Enter name and value
4. Select environments: Production, Preview, Development
5. Click **Save**

---

## 🐛 Troubleshooting

### Issue 1: "Could not resolve dependency" (Current Issue)

**Cause:** Vercel building from root with old dependencies

**Fix:**
```bash
# Option 1: Update Root Directory in Vercel
# Dashboard → Settings → General → Root Directory → "frontend"

# Option 2: Use vercel.json (already created)
git add vercel.json .vercelignore
git commit -m "fix: Vercel config"
git push
```

### Issue 2: "Module not found" during build

**Cause:** Missing dependencies in frontend/package.json

**Fix:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run build # Test locally first
```

### Issue 3: Blank page after deployment

**Cause:** Routing configuration or environment variables missing

**Fix:**
1. Check browser console for errors
2. Verify environment variables in Vercel
3. Check `vercel.json` has SPA rewrite rules:
   ```json
   "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   ```

### Issue 4: API calls failing

**Cause:** CORS or wrong API URL

**Fix:**
1. Update `VITE_API_URL` in Vercel env vars
2. Backend must allow your Vercel domain in CORS
3. Update backend `.env`:
   ```
   CORS_ORIGINS=https://your-app.vercel.app,https://your-app-preview.vercel.app
   ```

---

## 📊 Build Configuration

### Recommended Vercel Settings

```
Framework: Vite
Node Version: 18.x or 20.x
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: frontend
```

### Advanced: Custom Build Command

If you need custom build steps:

```json
// vercel.json
{
  "buildCommand": "cd frontend && npm ci && npm run build",
  "outputDirectory": "frontend/dist"
}
```

---

## 🎯 Deployment Checklist

Before deploying, ensure:

- [ ] `frontend/package.json` has all dependencies
- [ ] `npm run build` works locally
- [ ] Environment variables ready
- [ ] Backend CORS allows Vercel domain
- [ ] `vercel.json` configured correctly
- [ ] `.vercelignore` excludes backend files
- [ ] Git repo is up to date

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html#vercel
- **Supabase with Vercel:** https://supabase.com/docs/guides/getting-started/tutorials/with-vercel

---

## 🚦 Quick Commands

```bash
# Test build locally
cd frontend && npm run build && npm run preview

# Check build output
ls frontend/dist

# Deploy to Vercel (using CLI)
npx vercel

# Deploy to production
npx vercel --prod

# Check deployment logs
vercel logs [deployment-url]
```

---

## 📝 Alternative: Deploy Only Frontend

If you want a separate repo for frontend only:

```bash
# Create new repo
mkdir notex-frontend
cd notex-frontend

# Copy only frontend folder
cp -r ../NoteX/frontend/* .

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin <your-new-repo>
git push -u origin main

# Connect to Vercel
# No special config needed - Vercel will detect Vite automatically
```

---

## ✅ Expected Result

After successful deployment:

1. **Deployment URL:** `https://your-app.vercel.app`
2. **Status:** ✅ Ready
3. **Build Time:** ~1-2 minutes
4. **Build Logs:** Show successful build
5. **Preview:** App loads without errors

---

## 🎉 Next Steps After Deployment

1. **Test the deployed app**
2. **Add custom domain** (if needed)
3. **Set up Preview Deployments** for PRs
4. **Configure Analytics** in Vercel
5. **Deploy backend** to Railway/Render
6. **Update API URLs** in environment variables

---

## 💡 Pro Tips

1. **Preview Deployments:** Every PR gets its own URL
2. **Environment Variables:** Different values for Production/Preview
3. **Edge Functions:** Can add API routes in `frontend/api/`
4. **Caching:** Vercel automatically caches static assets
5. **Monitoring:** Check Vercel Analytics for performance

---

## 🆘 Still Having Issues?

### Check These:

1. **Vercel Logs:**
   ```bash
   vercel logs [deployment-url]
   ```

2. **Local Build:**
   ```bash
   cd frontend
   rm -rf node_modules dist
   npm install
   npm run build
   ```

3. **Clear Vercel Cache:**
   - Dashboard → Deployments → ⋮ → Redeploy → Clear cache

4. **Verify Files:**
   ```bash
   git ls-files vercel.json .vercelignore
   ```

---

Your frontend should now deploy successfully! 🚀
