# ⚡ DEPLOYMENT QUICK CHECKLIST

## Pre-Deployment (5 min)
- [ ] GitHub repo is up to date (git push done)
- [ ] Have Railway account ready
- [ ] Have Vercel account ready
- [ ] Generated JWT secret (use: `openssl rand -base64 32`)

## Backend Deployment (10 min)

**Railway Setup:**
- [ ] Go to https://railway.app
- [ ] New Project → Deploy from GitHub
- [ ] Select: job-inventory-manager / server folder
- [ ] Wait for auto-deployment

**Set Variables (in Railway):**
- [ ] `ASPNETCORE_ENVIRONMENT` = `Production`
- [ ] `Jwt:Secret` = Your generated secret
- [ ] `AllowedOrigins` = `https://your-vercel-url.vercel.app`
- [ ] `ConnectionStrings__DefaultConnection` = `Data Source=job-inventory.db;`

**Get URL:**
- [ ] Copy Railway API URL (e.g., `https://xxx.railway.app`)

## Frontend Deployment (10 min)

**Vercel Setup:**
- [ ] Go to https://vercel.com
- [ ] Add New → Project
- [ ] Import from GitHub
- [ ] Select: job-inventory-manager
- [ ] Root Directory: `client`

**Set Variables (in Vercel):**
- [ ] `REACT_APP_API_BASE` = `https://YOUR_RAILWAY_URL/api`
- [ ] `NODE_ENV` = `production`

**Deploy:**
- [ ] Click Deploy
- [ ] Wait for "Deployment Successful"
- [ ] Copy Vercel URL (e.g., `https://xxx.vercel.app`)

## Update Backend (1 min)

**Go back to Railway:**
- [ ] Update `AllowedOrigins` = `https://YOUR_VERCEL_URL`
- [ ] Redeploy

## Post-Deployment Testing (5 min)

**Test Backend:**
```bash
curl https://YOUR_RAILWAY_URL/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
# Should return: {"error":"Invalid username or password"}
```

**Test Frontend:**
- [ ] Open https://YOUR_VERCEL_URL
- [ ] See login page loads
- [ ] Try to login
- [ ] Should show "Invalid username or password"

## Success!

- [x] Backend running on Railway
- [x] Frontend running on Vercel
- [x] Both connected and working
- [x] Production deployed! 🚀

## Troubleshooting Quick Fixes

**"Failed to load"** → Check REACT_APP_API_BASE has `/api`
**"401 error"** → Verify JWT:Secret matches
**CORS error** → Check AllowedOrigins in Railway
**Slow deployment** → First deploy can take 2-5 min

---

**Total Time: ~30 minutes for full deployment**

Need help? See: `DEPLOY_NOW.md` for detailed steps
