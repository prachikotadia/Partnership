# 🚀 Deploy Backend to Railway (Easiest Option)

## Step 1: Go to Railway
1. Visit: https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

## Step 2: Configure Backend
1. Select the `backend` folder
2. Railway will auto-detect Node.js
3. Add environment variables:
   - `JWT_SECRET=your-super-secret-jwt-key-here`
   - `NODE_ENV=production`

## Step 3: Add Database
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will provide connection string automatically
3. Your backend will connect to this database

## Step 4: Deploy
1. Railway auto-deploys from GitHub
2. Get your backend URL from the dashboard
3. It will be something like: `https://your-app-name.up.railway.app`

## Step 5: Update Frontend
Update `src/services/realBackendService.ts`:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.up.railway.app/api' // Your Railway URL
  : 'http://localhost:3001/api';
```

## Step 6: Redeploy Frontend
1. Push changes to GitHub
2. Netlify will auto-deploy with the new backend URL

**That's it! Railway is much easier than Heroku.**
