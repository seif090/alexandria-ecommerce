# 🚀 Vercel Deployment Quick Reference

## 30-Minute Express Deployment

### Essential Links
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Deployment Guide:** `./VERCEL_DEPLOYMENT_GUIDE.md`

---

## ⚡ 5-Minute Setup (Prerequisites)

```bash
# 1. Install Vercel CLI (optional, for advanced users)
npm install -g vercel

# 2. Run setup script
# Windows:
powershell -ExecutionPolicy Bypass -File deploy-setup.ps1

# macOS/Linux:
bash deploy-setup.sh

# 3. Build verification
cd frontend && npm run build && cd ..
```

---

## 🗄️ Must-Have: MongoDB Atlas Setup

1. **Create Free Cluster**
   - Go: https://www.mongodb.com/cloud/atlas
   - Create project → Create cluster
   - Choose M0 (free)
   - AWS + closest region

2. **Get Connection String**
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/dbname
   ```
   - Save this! You'll need it.

3. **Network Access**
   - Add IP: 0.0.0.0/0 (for testing)
   - Restrict to Vercel IPs in production

---

## 🎯 Deploy Backend (5 min)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy preparation"
   git push
   ```

2. **Vercel Dashboard**
   - Click "Add New" → "Project"
   - Select your repo
   - Root: `./backend`
   - Build: (leave empty for Node.js)

3. **Add Environment Variables**
   ```
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = (generate: openssl rand -hex 32)
   NODE_ENV = production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Save URL: `https://your-backend.vercel.app`

5. **Verify**
   ```bash
   curl https://your-backend.vercel.app/
   # Should see: "Alexandria Last Chance API is running"
   ```

---

## 🎨 Deploy Frontend (8 min)

1. **New Project in Vercel**
   - Same repo
   - Root: `./frontend`
   - Build: `npm run build`
   - Output: `dist/frontend/browser`

2. **Environment Variables**
   ```
   API_URL = https://your-backend.vercel.app/api
   SOCKET_URL = https://your-backend.vercel.app
   NODE_ENV = production
   DEFAULT_LANGUAGE = ar
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait 5-10 minutes for Angular build
   - Save URL: `https://your-frontend.vercel.app`

4. **Visit Site**
   - Open `https://your-frontend.vercel.app`
   - Should see homepage
   - Check browser console (F12) for errors

---

## 🔗 Connect Frontend & Backend

### Backend: Update CORS
```javascript
// backend/index.js
app.use(cors({
  origin: 'https://your-frontend.vercel.app',
  credentials: true
}));
```

### Backend: Add Environment Variable
- Add to Vercel: `FRONTEND_URL = https://your-frontend.vercel.app`
- Redeploy backend

### Frontend: Verify API URL
- Check `api.service.ts`
- Should use `environment.apiUrl`
- Environment file has correct URL

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Can login to app
- [ ] API calls working
- [ ] No console errors

---

## 🚨 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check `package.json`, all deps installed |
| API not responding | Check CORS, Backend env vars, MongoDB connection |
| Real-time not working | WebSocket limited on Vercel, use Railway/Render |
| 404 on routes | Check Angular routing config |
| Slow build | Clear cache, rebuild dependencies locally first |

---

## 💻 Useful Commands

```bash
# Check what will be deployed
vercel --prod --dry-run

# View logs
vercel logs --prod

# Rollback deployment
# Use Vercel Dashboard → Deployments

# Test API locally
curl http://localhost:3000/api/products

# Build frontend locally
cd frontend && npm run build
```

---

## 🌍 Your Live Domains

**Frontend:** `https://your-frontend.vercel.app`
**Backend API:** `https://your-backend.vercel.app/api`
**MongoDB:** Your Atlas cluster

**Share with users!** 🎉

---

## 📞 Need Help?

1. **Check deployment logs** in Vercel Dashboard
2. **Read full guide:** `VERCEL_DEPLOYMENT_GUIDE.md`
3. **Verify env vars** are set in Project Settings
4. **Test locally first:** `npm start` (backend), `ng serve` (frontend)

---

## 🎓 What's Deployed

✅ Advanced Analytics Dashboard
✅ Vendor Management Suite  
✅ Multi-Vendor Fulfillment System
✅ Wallet & Subscription System
✅ AI Recommendations
✅ Real-time Notifications (HTTP polling on Vercel)
✅ All RBAC Permissions
✅ Mobile Responsive UI

---

**Status: Ready for Production** 🚀

Time to deployment: ~30 minutes
Cost: Free (using free tiers)
Support: 24/7 automated scaling
