# 🚀 Deploy Backend to Render (Alternative)

## Step 1: Go to Render
1. Visit: https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository

## Step 2: Configure Service
1. **Root Directory**: `backend`
2. **Environment**: `Node`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

## Step 3: Add Environment Variables
- `JWT_SECRET=your-super-secret-jwt-key-here`
- `NODE_ENV=production`

## Step 4: Add Database
1. Click "New" → "PostgreSQL"
2. Render will provide connection string
3. Your backend will auto-connect

## Step 5: Deploy
1. Click "Create Web Service"
2. Render will build and deploy
3. Get your URL: `https://your-app-name.onrender.com`

## Step 6: Update Frontend
Update `src/services/realBackendService.ts`:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.onrender.com/api' // Your Render URL
  : 'http://localhost:3001/api';
```

**Render is also very easy and reliable!**
