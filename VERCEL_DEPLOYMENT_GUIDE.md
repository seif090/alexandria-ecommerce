# 🚀 Vercel Deployment Guide - Alexandria Ecommerce Platform

## Complete Step-by-Step Deployment Instructions

---

## 📋 Pre-Deployment Checklist

### Requirements
- [ ] Vercel account (free tier available at vercel.com)
- [ ] GitHub account with repository
- [ ] MongoDB Atlas account (free tier available)
- [ ] Environment variables ready
- [ ] Code committed to GitHub

### Recommended Services
- **Database:** MongoDB Atlas (free tier: 512MB)
- **Backend:** Vercel (Node.js runtime)
- **Frontend:** Vercel (Recommended)
- **Alternative Backend:** Railway.app, Render.com (better for WebSocket)

---

## 🗄️ Step 1: Setup MongoDB Atlas

### 1.1 Create MongoDB Cluster
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create new project: "alexandria-ecommerce"
4. Create a Cluster:
   - Provider: AWS
   - Region: Select closest to your location
   - Tier: M0 (Free)
5. Click "Create"

### 1.2 Configure Database Access
1. Go to "Database Access"
2. Add New Database User:
   - Username: `ecommerce_user`
   - Password: Generate secure password (save it!)
   - Built-in Role: Atlas Admin
3. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0)
   - *Note: For production, restrict to Vercel IPs only*

### 1.4 Get Connection String
1. In Cluster overview, click "Connect"
2. Select "Connect using MongoDB URI"
3. Copy the connection string:
   ```
   mongodb+srv://ecommerce_user:<password>@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

---

## 🔖 Step 2: Prepare GitHub Repository

### 2.1 Push Code to GitHub
```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Alexandria Ecommerce Platform"

# Add remote (replace with your repo)
git remote add origin https://github.com/yourusername/alexandria-ecommerce.git
git branch -M main

# Push
git push -u origin main
```

### 2.2 Repository Structure
```
alexandria-ecommerce/
├── backend/
│   ├── vercel.json          ✅ Created
│   ├── .env.production.template
│   ├── index.js
│   ├── package.json
│   ├── models/
│   ├── routes/
│   └── middleware/
├── frontend/
│   ├── vercel.json          ✅ Created
│   ├── .env.production.template
│   ├── package.json
│   ├── src/
│   └── angular.json
└── README.md
```

---

## 🚀 Step 3: Deploy Backend to Vercel

### 3.1 Create Backend Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import Git Repository:
   - Select your GitHub repo
   - Click "Import"

### 3.2 Configure Project
1. **Project Name:** `alexandria-backend`
2. **Framework Preset:** Node.js
3. **Root Directory:** `./backend`
4. **Build Command:** (leave default - not needed for Node.js)
5. **Output Directory:** (leave empty)
6. **Install Command:** `npm install`

### 3.3 Environment Variables
1. Keep project settings open
2. Go to "Environment Variables"
3. Add each variable from `.env.production.template`:

   ```
   MONGODB_URI = mongodb+srv://ecommerce_user:PASSWORD@cluster.mongodb.net/alex-last-chance?retryWrites=true&w=majority
   JWT_SECRET = your-very-secure-random-string (use: openssl rand -hex 32)
   NODE_ENV = production
   PORT = 3000
   HOST = 0.0.0.0
   ```

4. Click "Save"

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. ✅ Backend deployed!
4. **Save URL:** `https://your-backend-domain.vercel.app`

### 3.5 Verify Backend
```bash
# Test API endpoint
curl https://your-backend-domain.vercel.app/

# Expected response:
# "Alexandria Last Chance API is running"
```

---

## 🎨 Step 4: Deploy Frontend to Vercel

### 4.1 Create Frontend Project  
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import Git Repository (same repo):
   - Click "Import"

### 4.2 Configure Project
1. **Project Name:** `alexandria-frontend`
2. **Framework Preset:** Angular
3. **Root Directory:** `./frontend`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist/frontend/browser`
6. **Install Command:** `npm install`

### 4.3 Environment Variables
1. Go to "Environment Variables"
2. Add frontend variables:

   ```
   API_URL = https://your-backend-domain.vercel.app/api
   SOCKET_URL = https://your-backend-domain.vercel.app
   NODE_ENV = production
   DEFAULT_LANGUAGE = ar
   ENABLE_ANALYTICS = true
   ```

3. Click "Save"

### 4.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (~5-10 minutes)
3. ✅ Frontend deployed!
4. **Save URL:** `https://your-frontend-domain.vercel.app`

---

## ⚙️ Step 5: Update Backend CORS

### 5.1 Update Backend Configuration
Edit `backend/index.js`:
```javascript
const cors = require('cors');
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
```

### 5.2 Add Frontend URL to Backend
1. Go to Backend Project Settings
2. Add Environment Variable:
   ```
   FRONTEND_URL = https://your-frontend-domain.vercel.app
   CORS_ORIGIN = https://your-frontend-domain.vercel.app
   ```
3. Redeploy backend

---

## 🔗 Step 6: Update Frontend API Configuration

### 6.1 Setup Environment File
Create `frontend/.env.production`:
```bash
API_URL=https://your-backend-domain.vercel.app/api
SOCKET_URL=https://your-backend-domain.vercel.app
NODE_ENV=production
DEFAULT_LANGUAGE=ar
ENABLE_REAL_TIME_UPDATES=true
```

### 6.2 Update API Service
Make sure `api.service.ts` uses environment variables:
```typescript
private apiUrl = environment.apiUrl || 'https://your-backend.vercel.app/api';
```

---

## ✅ Step 7: Testing Deployment

### 7.1 Test Backend API
```bash
# Test health check
curl https://your-backend-domain.vercel.app/

# Test CORS
curl -H "Origin: https://your-frontend-domain.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://your-backend-domain.vercel.app/api/auth/login

# Test API endpoint (if available)
curl https://your-backend-domain.vercel.app/api/products
```

### 7.2 Test Frontend
1. Open `https://your-frontend-domain.vercel.app` in browser
2. Check browser console (F12) for errors
3. Verify API calls are working
4. Test key features:
   - User authentication
   - Product browsing
   - Cart functionality
   - Checkout process

### 7.3 Monitor Logs
**Backend Logs:**
1. Go to Backend Project
2. Click "Deployments" tab
3. Select latest deployment
4. View "Functions" logs

**Frontend Logs:**
1. Go to Frontend Project
2. Click "Deployments" tab
3. Select latest deployment
4. Check build logs for errors

---

## 🔒 Production Security Checklist

- [ ] All environment variables set (no sensitive data in code)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS properly configured
- [ ] Database password is secure
- [ ] JWT secret is strong (use `openssl rand -hex 32`)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Database backups enabled (MongoDB Atlas)
- [ ] Monitoring and alerts configured

---

## 🚨 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Verify dependencies in backend/package.json
cd backend && npm install

# Verify dependencies in frontend/package.json  
cd frontend && npm install

# Commit and push
git add .
git commit -m "Fix dependencies"
git push
```

### Issue: Build fails with "vercel.json not found"

**Solution:**
- Verify `vercel.json` exists in root of project folder
- Check file format is valid JSON
- Restart deployment

### Issue: API calls fail with CORS error

**Solution:**
1. Check CORS headers in backend (index.js)
2. Verify `CORS_ORIGIN` environment variable is set correctly
3. Check browser console for exact error
4. Test with simple curl command first

### Issue: Database connection fails

**Solution:**
```bash
# Test MongoDB connection string
# Add your IP to MongoDB Atlas Network Access

# Verify connection string format:
# mongodb+srv://username:password@cluster.mongodb.net/dbname

# Check username and password are URL-encoded
```

### Issue: Socket.io real-time updates not working

**Solution:**
Vercel Serverless has limitations with WebSockets. Options:
1. **Use Railway.app for Backend:**
   ```bash
   1. Sign up at railway.app
   2. Create new project
   3. Deploy from GitHub
   4. Configure environment variables
   5. Get dynamic domain for Socket.io
   ```

2. **Use Render.com for Backend:**
   - Better WebSocket support
   - Free tier available
   - Similar to Railway.app

3. **Disable real-time for now:**
   - Vercel serverless works with HTTP polling
   - Full WebSocket support coming

---

## 📊 Recommended Alternative Architecture

For production with real-time updates, consider:

```
┌─────────────────────────────────────────┐
│        Frontend (Vercel)                │
│  https://frontend-domain.vercel.app    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Backend + WebSocket (Railway)      │
│  https://backend-domain.up.railway.app  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│    Database (MongoDB Atlas)             │
│  Free tier: 512MB storage               │
└─────────────────────────────────────────┘
```

---

## 📈 Monitoring & Analytics

### Enable Vercel Analytics
1. Go to Project Settings
2. Enable "Web Analytics"
3. View real-time traffic and performance

### Monitor Database
1. Go to MongoDB Atlas Dashboard
2. Check:
   - Connections count
   - Query performance
   - Storage usage
   - Error rates

### Setup Error Tracking (Optional)
```bash
# Add Sentry
npm install @sentry/angular

# Configure in main.ts
import * as Sentry from "@sentry/angular";
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

---

## 🎉 Post-Deployment Steps

### 1. Verify Everything Works
- [ ] Homepage loads
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] Products display
- [ ] Checkout process works
- [ ] Real-time updates (if available)

### 2. Setup custom domain (Optional)
1. Go to Project Settings
2. Click "Domains"
3. Add custom domain
4. Update DNS records

### 3. Setup CI/CD
Vercel automatically redeploys on:
- Push to main branch
- Pull request created
- Manual trigger

### 4. Backup Database
```bash
# Stop production and test
# Regular backups enabled by default on MongoDB Atlas
```

---

## 💰 Pricing & Costs

### Free Tier (Vercel)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Serverless functions

### MongoDB Atlas Free Tier
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Basic monitoring
- ❌ Auto backups (manual only)

**Estimated Monthly Cost:** $0-5 (free tier sufficient for MVP)

---

## 🔄 Continuous Deployment

Every push to main automatically:
1. Runs build
2. Tests deployment
3. Goes live if successful
4. Logs available in Vercel Dashboard

---

## 📞 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Angular Deployment:** https://angular.io/guide/deployment
- **Express on Vercel:** https://vercel.com/docs/concepts/functions/serverless-functions/nodejs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **GitHub Actions:** https://github.com/features/actions

---

**Deployment Complete! 🎉**

Your Alexandria Ecommerce Platform is now live and accessible to users worldwide!

Frontend: `https://your-frontend-domain.vercel.app`
Backend API: `https://your-backend-domain.vercel.app/api`
Admin Panel: `https://your-frontend-domain.vercel.app/admin`

---

*Last Updated: March 2026*
*Status: Production Ready*
