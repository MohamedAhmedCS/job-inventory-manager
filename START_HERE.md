# 🚀 START HERE - Quick Start Guide

## The "Failed to fetch" Error - SOLVED! ✅

The error happens because **the backend is not running**. Here's how to fix it:

---

## 🎯 5-Minute Setup

### Option 1: Automatic (Easiest)
```bash
# Just double-click this file in Windows:
start.bat

# That's it! Both servers start automatically
# Backend: http://localhost:5132
# Frontend: http://localhost:3000
```

### Option 2: Manual (Step-by-Step)

**Terminal 1 - Start Backend:**
```bash
cd c:\Users\ahmed\job-inventory-manager\server
dotnet run
```

**Wait for:**
```
info: Microsoft.Hosting.Lifetime[14]
Now listening on: http://localhost:5132
```

**Terminal 2 - Start Frontend:**
```bash
cd c:\Users\ahmed\job-inventory-manager\client
npm install
npm start
```

**Wait for:**
```
Compiled successfully!

Local:            http://localhost:3000
```

### Step 3: Open Browser
- Go to **http://localhost:3000**
- You'll see the Login page ✓

### Step 4: Login
```
Username: testuser
Password: testpass123
```

(Or use any username 3+ chars and password 6+ chars)

### Step 5: Done! 🎉
- You now see the Job Tracker app
- Create/edit/delete job applications
- Everything works locally

---

## 🚨 If You Get "Failed to fetch" Error

### Quick Checklist:
- [ ] Backend running? (Terminal 1 showing "Now listening on: http://localhost:5132")
- [ ] Frontend running? (Terminal 2 showing "Compiled successfully!")
- [ ] Opened http://localhost:3000 in browser?
- [ ] Ports 3000 and 5132 are not blocked?

### If Backend Won't Start:

**Error: "dotnet: command not found"**
- Install .NET SDK: https://dotnet.microsoft.com/download
- Restart terminal

**Error: "EADDRINUSE: address already in use :::5132"**
- Something else is using port 5132
- Run: `netstat -ano | findstr :5132`
- Kill the process or restart computer

**Error: "System.IO.FileNotFoundException"**
- This is normal on first run
- The database auto-creates
- Just wait 2-3 seconds and refresh browser

### If Frontend Won't Start:

**Error: "node_modules not found"**
```bash
cd client
npm install
npm start
```

**Error: "npm: command not found"**
- Install Node.js: https://nodejs.org
- Restart terminal

**Error: "EADDRINUSE: address already in use :::3000"**
- Something else is using port 3000
- Either close it or run: `PORT=3001 npm start`

---

## 📊 What Should You See?

### Backend Terminal
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5132
```

### Frontend Terminal
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
```

### Browser
```
Login Page
[Username input field]
[Password input field]
[Sign In button]
```

---

## ✅ Testing the App

1. **Login**
   - Username: `testuser`
   - Password: `testpass123`
   - Click "Sign In"

2. **Create a Job**
   - Company: "Google"
   - Title: "Software Engineer"
   - Location: "Mountain View"
   - Status: "Applied"
   - Date: "2025-12-08"
   - Notes: "Excited about this opportunity"
   - Click "Add Job"

3. **See the Job**
   - Should appear as a card below

4. **Edit the Job**
   - Click "Edit" on the card
   - Change something
   - Click "Update"

5. **Delete the Job**
   - Click "Delete" on the card
   - Confirm

6. **Logout**
   - Click "Logout" button
   - Back to Login page

---

## 🔐 Multiple Users?

Each login credential is independent:

```
User 1:
  Username: alice
  Password: secure123

User 2:
  Username: bob
  Password: secret456
```

- Each user only sees their own jobs
- Jobs are stored in `server/jobs.db`

---

## 🗄️ Where's My Data?

- **Database file:** `server/jobs.db`
- **Created automatically:** Yes, on first run
- **Delete to reset:** `del server\jobs.db`

---

## 📚 More Information

- **Troubleshooting:** See `TROUBLESHOOTING.md`
- **Full Guides:** See `FREE_DEPLOYMENT_GUIDE.md`
- **What's New:** See `WHATS_NEW.md`
- **API Reference:** See `QUICK_REFERENCE.md`

---

## ⚡ Architecture

```
Browser (http://localhost:3000)
    ↓
React Frontend (Login → Job Manager)
    ↓
API Calls (HTTP + JWT tokens)
    ↓
Backend (http://localhost:5132)
    ↓
SQLite Database (jobs.db)
```

---

## 🎓 What Files Do What?

**Backend** (C# .NET Core):
- `server/Program.cs` - Configuration & startup
- `server/Controllers/AuthController.cs` - Login/register
- `server/Controllers/JobApplicationsController.cs` - Job CRUD

**Frontend** (React + TypeScript):
- `client/src/App.tsx` - Main app
- `client/src/components/Login.tsx` - Login page
- `client/src/services/jobService.ts` - API calls

**Database**:
- `server/jobs.db` - SQLite database (auto-created)

---

## 🚀 Next Steps

1. ✅ Get it working locally (you are here!)
2. 📦 Test all features
3. 🚀 Deploy to production (see `FREE_DEPLOYMENT_GUIDE.md`)

---

## 💡 Quick Tips

- **Offline?** App still works! Data is local
- **Browser tab crash?** Refresh, stay logged in
- **Want to reset?** Delete `server/jobs.db` and restart
- **Multiple browsers?** Each browser gets separate login session

---

**Ready?** Double-click `start.bat` and enjoy! 🎉

(If you get stuck, check `TROUBLESHOOTING.md`)
