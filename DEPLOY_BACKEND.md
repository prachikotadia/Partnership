# 🚀 Deploy Backend to Production

## Option 1: Heroku (Recommended - Free)

### Step 1: Install Heroku CLI
```bash
# Install Heroku CLI from https://devcenter.heroku.com/articles/heroku-cli
# Or use brew on Mac:
brew tap heroku/brew && brew install heroku
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
cd backend
heroku create your-app-name-backend
```

### Step 4: Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:mini
```

### Step 5: Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here
heroku config:set NODE_ENV=production
```

### Step 6: Deploy
```bash
git subtree push --prefix=backend heroku main
```

### Step 7: Get Your Backend URL
```bash
heroku info
# Your backend URL will be: https://your-app-name-backend.herokuapp.com
```

## Option 2: Railway (Alternative - Free)

### Step 1: Go to Railway
Visit: https://railway.app

### Step 2: Connect GitHub
- Connect your GitHub repository
- Select the `backend` folder

### Step 3: Add Database
- Add PostgreSQL database
- Railway will provide connection string

### Step 4: Deploy
- Railway auto-deploys from GitHub
- Get your backend URL from Railway dashboard

## Option 3: Render (Alternative - Free)

### Step 1: Go to Render
Visit: https://render.com

### Step 2: Create New Web Service
- Connect GitHub repository
- Select `backend` folder
- Use Node.js environment

### Step 3: Add Database
- Create PostgreSQL database
- Get connection string

### Step 4: Deploy
- Render auto-deploys from GitHub
- Get your backend URL from Render dashboard

## 🔧 Update Frontend After Deployment

Once you have your backend URL, update the frontend:

1. **Update realBackendService.ts:**
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name-backend.herokuapp.com/api' // Replace with your actual URL
  : 'http://localhost:3001/api';
```

2. **Redeploy to Netlify:**
- Push changes to GitHub
- Netlify will auto-deploy

## 🎯 Quick Heroku Setup (Recommended)

```bash
# 1. Install Heroku CLI
brew tap heroku/brew && brew install heroku

# 2. Login
heroku login

# 3. Create app
cd backend
heroku create bondly-glow-backend

# 4. Add database
heroku addons:create heroku-postgresql:mini

# 5. Set environment
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here

# 6. Deploy
git subtree push --prefix=backend heroku main

# 7. Get URL
heroku info
```

**Your backend URL will be:** `https://bondly-glow-backend.herokuapp.com`

Then update the frontend and redeploy to Netlify!
