# Deployment Checklist - Ready for Production

## Pre-Deployment (1-2 hours)

### Environment Setup
- [ ] Create Railway account (if not exists)
- [ ] Create Vercel account (if not exists)
- [ ] Generate strong JWT secret (32+ characters)
  ```bash
  openssl rand -base64 32
  ```
- [ ] Set up custom domain (optional)
- [ ] Prepare CORS allowed origins list

### GitHub Setup
- [ ] Push all changes to main branch
- [ ] Verify no secrets in repository
- [ ] Set up GitHub Actions (optional, for CI/CD)

### Database Planning
- [ ] Decide: SQLite (MVP) or PostgreSQL (production)
- [ ] If PostgreSQL: Create database in Railway
- [ ] Backup any existing data

---

## Backend Deployment (Railway) - 30 minutes

### Create Railway Project
1. [ ] Go to https://railway.app
2. [ ] Click "New Project"
3. [ ] Select "Deploy from GitHub"
4. [ ] Connect GitHub account
5. [ ] Select `job-inventory-manager` repository
6. [ ] Select `server` folder as root

### Configure Environment Variables
In Railway project settings, add:
```
ASPNETCORE_ENVIRONMENT=Production
Jwt:Secret=<your-generated-secret>
AllowedOrigins=https://your-frontend-domain.vercel.app,https://your-custom-domain.com
ConnectionStrings__DefaultConnection=Data Source=job-inventory.db;
```

### Verify Deployment
- [ ] Deployment succeeds without errors
- [ ] Check logs: no startup errors
- [ ] Copy Railway API URL (example: `https://job-inventory-api.railway.app`)
- [ ] Test endpoint: `curl https://<railway-url>/api/auth/login`
- [ ] Response should be: `{"error":"Invalid username or password"}`

---

## Frontend Deployment (Vercel) - 20 minutes

### Create Vercel Project
1. [ ] Go to https://vercel.com
2. [ ] Click "New Project"
3. [ ] Connect GitHub account
4. [ ] Select `job-inventory-manager` repository
5. [ ] Set "Root Directory" to `client`

### Configure Build Settings
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`
- [ ] Install Command: `npm install`

### Set Environment Variables
```
REACT_APP_API_BASE=https://<your-railway-url>/api
NODE_ENV=production
```

### Verify Deployment
- [ ] Deployment succeeds without errors
- [ ] Visit Vercel URL: `https://<your-project>.vercel.app`
- [ ] Check console for CORS errors
- [ ] Test login functionality
- [ ] Verify API calls reaching backend

---

## Post-Deployment Testing - 30 minutes

### Functional Testing

#### Authentication
- [ ] Login with test credentials works
- [ ] JWT token generated with user ID
- [ ] Token valid for API calls
- [ ] Logout clears authentication

#### Job Management
- [ ] Create new job succeeds
- [ ] List jobs displays created job
- [ ] Edit job updates successfully
- [ ] Delete job removes from list

#### User Data
- [ ] Add experience to profile
- [ ] Create project entry
- [ ] Add skills
- [ ] Save story

#### AI Features
- [ ] Run job analysis (returns dummy data currently)
- [ ] Generate asset (returns dummy data currently)
- [ ] Save generated content

#### Sharing
- [ ] Create public share link
- [ ] Access share link in incognito window
- [ ] Verify public can see shared job

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No console errors
- [ ] No network errors

### Security Testing
- [ ] Try accessing API without token → 401 error
- [ ] Try accessing another user's data → Blocked
- [ ] Try XSS injection in job title → Escaped
- [ ] Try SQL injection in search → No error

---

## Domain Configuration (Optional) - 15 minutes

### Custom Domain on Vercel
1. [ ] Go to Vercel project settings
2. [ ] Add custom domain
3. [ ] Point DNS to Vercel nameservers
4. [ ] Verify DNS configuration
5. [ ] Test frontend on custom domain

### Custom Domain on Railway
1. [ ] Go to Railway project settings
2. [ ] Add custom domain
3. [ ] Configure DNS records (if not using Railway nameservers)
4. [ ] Test API on custom domain

---

## Post-Launch Monitoring - Ongoing

### Daily Checks (First Week)
- [ ] Check error logs daily
- [ ] Monitor API response times
- [ ] Verify database connection stable
- [ ] Monitor user feedback

### Weekly Checks (First Month)
- [ ] Review error patterns
- [ ] Check database size growth
- [ ] Monitor resource usage
- [ ] Update documentation as needed

### Monthly Checks (Ongoing)
- [ ] Review security logs
- [ ] Check for software updates
- [ ] Monitor performance metrics
- [ ] Plan improvements

---

## Rollback Plan (If Issues)

### Backend Rollback
```bash
# In Railway dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "Redeploy"
4. Wait for deployment to complete
5. Test API endpoints
```

### Frontend Rollback
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "Promote to Production"
4. Verify site loads correctly
```

### Emergency Hotfix
```bash
# If critical bug found:
1. Fix code locally
2. Push to feature branch
3. Test thoroughly
4. Create PR and merge to main
5. Wait for automatic deployment (or trigger manual)
```

---

## Common Issues & Solutions

### Issue: Frontend can't reach backend
**Solution:**
- [ ] Check CORS is enabled
- [ ] Verify REACT_APP_API_BASE is set correctly
- [ ] Ensure Railway API is running
- [ ] Check firewall/security groups allow traffic

### Issue: Database connection fails
**Solution:**
- [ ] Verify connection string is correct
- [ ] Check database file exists (SQLite) or PostgreSQL running
- [ ] Ensure user has permissions
- [ ] Check disk space available

### Issue: JWT token invalid
**Solution:**
- [ ] Verify Jwt:Secret is set
- [ ] Check token not expired
- [ ] Ensure token includes user ID in `sub` claim
- [ ] Verify token signing key matches

### Issue: CORS errors in browser console
**Solution:**
- [ ] Add frontend domain to AllowedOrigins
- [ ] Redeploy backend after changing settings
- [ ] Clear browser cache
- [ ] Test in private/incognito window

---

## Scaling Considerations (Future)

### When to Scale
- [ ] User count > 100 daily active users
- [ ] Database file > 500 MB
- [ ] API response time > 1 second
- [ ] Server CPU consistently > 80%

### Scaling Steps
1. [ ] Migrate SQLite to PostgreSQL
2. [ ] Add caching layer (Redis)
3. [ ] Set up load balancer
4. [ ] Implement CDN for static files
5. [ ] Add monitoring and alerting

---

## Support & Troubleshooting

### Resources
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- .NET Documentation: https://docs.microsoft.com/dotnet
- React Documentation: https://react.dev

### Debug Commands
```bash
# Check backend logs (Railway CLI)
railway logs

# Check frontend build
cd client && npm run build

# Test backend locally
cd server && dotnet run

# Run API tests
curl -v http://localhost:5132/api/auth/login
```

---

## Sign-Off & Deployment

**Prepared By:** Development Team
**Reviewed By:** QA Team
**Approved By:** Project Lead

**Deployment Date:** _______________
**Deployed To:** [ ] Staging [ ] Production
**Deployed By:** _______________
**Deployment Time (UTC):** _______________

**Result:** [ ] SUCCESS [ ] ISSUES

**Issues Found (if any):**
```
[List any issues found during deployment]
```

**Notes:**
```
[Add any additional deployment notes]
```

---

**Next Steps After Deployment:**
1. Announce launch to users
2. Set up monitoring alerts
3. Train support team
4. Plan Phase 2 features (real AI, enhanced analytics, etc.)
5. Gather user feedback

---

**Status: ✅ READY TO DEPLOY**

For questions or issues, contact the development team.
