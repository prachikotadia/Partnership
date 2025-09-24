# 🚀 Quick Railway Setup (Free Backend)

## Step 1: Go to Railway
1. Visit: https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your repositories

## Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `bondly-glow-main`
4. Click "Deploy"

## Step 3: Configure Backend
1. Railway will detect the repository
2. Click "Configure" on the detected service
3. Set **Root Directory**: `backend`
4. Railway will auto-detect Node.js
5. **Build Command**: `npm install` (auto-detected)
6. **Start Command**: `npm start` (auto-detected)

## Step 4: Add Environment Variables
1. Go to "Variables" tab
2. Add these environment variables:
   - `JWT_SECRET` = `your-super-secret-jwt-key-here-12345`
   - `NODE_ENV` = `production`

## Step 5: Add Database
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will create a PostgreSQL database
3. The connection string will be automatically set

## Step 6: Deploy
1. Railway will automatically deploy your backend
2. Wait for deployment to complete (2-3 minutes)
3. Get your backend URL from the dashboard

## Step 7: Update Frontend
Once you have your Railway URL (like `https://your-app-name.up.railway.app`):

1. Update `src/services/realBackendService.ts`:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-actual-railway-url.up.railway.app/api' // Replace with your Railway URL
  : 'http://localhost:3001/api';
```

2. Commit and push changes:
```bash
git add .
git commit -m "Update backend URL for Railway deployment"
git push origin main
```

3. Netlify will auto-deploy with the new backend URL

## 🎯 That's it! Your backend will be live and free!

## 🔧 Troubleshooting

### If you get lockfile errors:
1. **Delete** `package-lock.json` in the backend folder
2. **Run** `npm install` locally
3. **Commit** the new lockfile
4. **Redeploy** on Railway

### If deployment fails:
1. **Check** the Railway logs
2. **Verify** environment variables are set
3. **Ensure** database is connected
4. **Check** that all dependencies are in package.json

### Alternative: Use Render instead
If Railway doesn't work, try Render:
1. **Go to**: https://render.com
2. **Create** "Web Service"
3. **Connect** GitHub repository
4. **Set Root Directory**: `backend`
5. **Deploy** with same environment variables
