# 🚀 DEPLOYMENT GUIDE - QUICK START

## Prerequisites
- GitHub account with your repo
- Railway account: https://railway.app
- Vercel account: https://vercel.com

---

## STEP 1: GitHub Authentication (30 seconds)

If git is asking for credentials, use a GitHub Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Select scopes: `repo`, `admin:repo_hook`
4. Copy the token
5. When prompted for password in terminal, paste the token
6. Git will remember it for future pushes

Or set up SSH:
```bash
ssh-keygen -t ed25519 -C "your@email.com"
# Add key to https://github.com/settings/keys
git remote set-url origin git@github.com:yourusername/job-inventory-manager.git
```

---

## STEP 2: Deploy Backend to Railway (10 minutes)

### 2a. Create Railway Project
1. Go to https://railway.app
2. Login/Create account
3. Click "New Project"
4. Select "Deploy from GitHub"
5. Authorize GitHub
6. Select repository: `job-inventory-manager`
7. Select directory: `server`

### 2b. Configure Variables
Railway dashboard → Variables:
```
ASPNETCORE_ENVIRONMENT=Production
Jwt:Secret=YOUR_SECRET_HERE
AllowedOrigins=https://your-vercel-app.vercel.app
ConnectionStrings__DefaultConnection=Data Source=job-inventory.db;
```

**Generate Secret:**
```bash
openssl rand -base64 32
```

### 2c. Deploy
1. Railway will auto-deploy on push
2. Wait for "Deployment Successful"
3. Copy API URL from Railway dashboard
4. Save this URL (you'll need it for frontend)

Example: `https://job-inventory-api-xxxxx.railway.app`

---

## STEP 3: Deploy Frontend to Vercel (10 minutes)

### 3a. Create Vercel Project
1. Go to https://vercel.com
2. Login/Create account
3. Click "Add New" → "Project"
4. Select "Import Git Repository"
5. Paste GitHub URL or authorize GitHub
6. Select `job-inventory-manager` repository
7. Set Root Directory: `client`

### 3b. Configure Environment Variables
Environment Variables section:
```
REACT_APP_API_BASE=https://your-railway-url/api
NODE_ENV=production
```

Replace `your-railway-url` with the URL from Step 2c.

### 3c. Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Vercel will give you a URL: `https://your-project.vercel.app`
4. Your frontend is now live!

---

## STEP 4: Test Deployment (5 minutes)

### Test Backend
```bash
# Replace with your Railway URL
curl https://your-railway-url/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Should return: {"error":"Invalid username or password"}
```

### Test Frontend
1. Open: `https://your-vercel-app.vercel.app`
2. You should see the login page
3. Try to login (it will show "Invalid username or password")
4. This means everything is connected!

---

## STEP 5: Update CORS Origins (If Custom Domain)

If using custom domain:

**Railway Dashboard:**
1. Go to your project
2. Environment Variables
3. Update `AllowedOrigins`:
```
AllowedOrigins=https://your-custom-domain.com,https://your-vercel-app.vercel.app
```
4. Redeploy

---

## Troubleshooting

### Frontend shows "Failed to load jobs"
- Check `REACT_APP_API_BASE` is set correctly in Vercel
- Ensure Railway API URL has `/api` at the end
- Check CORS settings in Railway

### API returns 401 Unauthorized
- JWT secret might not match between dev and production
- Generate new secret if unsure

### Database not found
- Create database in Railway
- Or update `ConnectionStrings__DefaultConnection`

### Deployment stuck
- Check Railway/Vercel logs for errors
- Verify all environment variables are set
- Ensure code was pushed to main branch

---

## Commands Reference

```bash
# Commit and push
git add -A
git commit -m "Your message"
git push

# Check git status
git status

# View logs
git log --oneline -5

# Check backend build
cd server && dotnet build

# Check frontend build
cd client && npm run build

# Run locally
cd server && dotnet run
cd client && npm start
```

---

## Useful URLs

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/yourusername/job-inventory-manager
- Production Frontend: https://your-app.vercel.app
- Production Backend: https://your-api.railway.app

---

## Next Steps

After deployment:
1. ✅ Test all features in production
2. ✅ Monitor error logs
3. ✅ Gather user feedback
4. ✅ Plan Phase 2 enhancements
5. ✅ Set up monitoring/analytics

---

**Status: Ready for Production Deployment** 🚀

For detailed deployment checklist, see: `DEPLOYMENT_CHECKLIST.md`
