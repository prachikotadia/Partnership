# 🔄 Update Backend URL After Railway Deployment

## After you get your Railway URL, follow these steps:

### Step 1: Get Your Railway URL
- Go to your Railway dashboard
- Copy your backend URL (e.g., `https://your-app-name.up.railway.app`)

### Step 2: Update Frontend Code
Edit `src/services/realBackendService.ts` and replace this line:

```typescript
// BEFORE:
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.herokuapp.com/api' // Replace with your production backend URL
  : 'http://localhost:3001/api';

// AFTER (replace with your actual Railway URL):
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-actual-railway-url.up.railway.app/api' // Your Railway URL
  : 'http://localhost:3001/api';
```

### Step 3: Commit and Push
```bash
git add .
git commit -m "Update backend URL for Railway deployment"
git push origin main
```

### Step 4: Netlify Auto-Deploy
- Netlify will automatically detect the changes
- It will redeploy your frontend with the new backend URL
- Your app will now use the real backend instead of demo mode

## 🎯 That's it! Your app will be fully functional with a real backend!
