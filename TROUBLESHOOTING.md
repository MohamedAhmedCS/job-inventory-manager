# 🔧 Troubleshooting "Failed to fetch" Error

## ✅ Quick Fix Checklist

### 1. **Is the Backend Running?** (Most Common Issue)
```bash
# Terminal 1 - Run Backend
cd c:\Users\ahmed\job-inventory-manager\server
dotnet run
# Should see: "info: Microsoft.Hosting.Lifetime[14] Now listening on: http://localhost:5132"
```

**If you see this error:**
```
Unhandled exception: System.IO.FileNotFoundException: The 'jobs.db' file doesn't exist
```
**Solution**: That's normal. The database will auto-create on first run. Just wait 2-3 seconds and refresh the browser.

### 2. **Is the Frontend Connected to Backend?**
```bash
# Terminal 2 - Run Frontend
cd c:\Users\ahmed\job-inventory-manager\client
npm install
npm start
# Should see: "On Your Network: http://192.168.x.x:3000"
```

### 3. **Check the Browser Console**
1. Open http://localhost:3000 in your browser
2. Press F12 (Developer Tools)
3. Go to "Console" tab
4. Look for error messages

**Expected message if backend not running:**
```
Error: Failed to fetch
  at login (jobService.ts:79:15)
```

### 4. **Verify the Ports**
```bash
# Check if port 5132 is available (backend)
netstat -ano | findstr :5132

# Check if port 3000 is available (frontend)
netstat -ano | findstr :3000
```

If ports are in use, either:
- Close the app using that port
- Or change the ports in:
  - Backend: `server/Properties/launchSettings.json`
  - Frontend: Set `PORT=3001` before `npm start`

---

## 🔍 Detailed Troubleshooting

### Problem: "Failed to fetch" on Login Page

**Cause 1: Backend not running**
```
✗ Backend not listening on http://localhost:5132
```
**Fix**: Run `cd server && dotnet run`

**Cause 2: Wrong API URL**
```
✗ Frontend looking for API on wrong port
```
**Fix**: Check `client/src/services/jobService.ts` line 11:
```typescript
const API_BASE = "http://localhost:5132/api/jobapplications";
```
Should be exactly as above.

**Cause 3: CORS issue**
```
✗ Backend not allowing requests from frontend
```
**Fix**: Backend already configured in `server/Program.cs`
```csharp
options.AddPolicy("AllowReactApp", policy =>
{
    var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
        ?? new[] { "http://localhost:3000" };
    
    policy.WithOrigins(allowedOrigins)...
});
```

---

## 🎯 Step-by-Step Setup

### Step 1: Terminal Setup
```bash
# Open TWO terminals in the project root
# I'll call them Terminal-Backend and Terminal-Frontend
```

### Step 2: Start Backend
```bash
# Terminal-Backend
cd server
dotnet restore
dotnet run
```

**You should see:**
```
warn: Microsoft.EntityFrameworkCore.Infrastructure[10403]
      Entity Framework Core initialized 'AppDbContext' using provider 'SQLite' with options: ...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5132
```

**Wait for database migration:** This takes 2-3 seconds on first run.

### Step 3: Start Frontend
```bash
# Terminal-Frontend
cd client
npm install
npm start
```

**You should see:**
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.xxx.xxx:3000
```

### Step 4: Test the App
1. Open http://localhost:3000 in your browser
2. You should see the Login page
3. Enter credentials:
   - Username: `testuser` (or any 3+ characters)
   - Password: `testpass123` (or any 6+ characters)
4. Click "Sign In"
5. If successful, you'll see the Job Tracker app

---

## 🛠️ Common Errors & Solutions

### Error 1: "Cannot GET /"
```
✗ Frontend not running on port 3000
```
**Fix**: 
- Check Terminal-Frontend is running
- Verify it says "Compiled successfully!"
- Refresh http://localhost:3000

### Error 2: "EADDRINUSE: address already in use :::5132"
```
✗ Another app is using port 5132
```
**Fix**: 
- Close the other app
- Or restart your computer
- Or change port in `server/Properties/launchSettings.json`

### Error 3: "node_modules not found"
```
✗ Dependencies not installed
```
**Fix**: 
- Run `cd client && npm install`
- Wait for it to complete (takes 1-2 minutes)

### Error 4: "System.Data.SqliteException: database is locked"
```
✗ Database file is being used by another process
```
**Fix**: 
- Close all instances of the app
- Delete `server/jobs.db`
- Restart backend

### Error 5: "dotnet: command not found"
```
✗ .NET is not installed or not in PATH
```
**Fix**: 
- Download from https://dotnet.microsoft.com/download
- Install .NET 9 SDK
- Restart terminal/computer

---

## 📊 Debugging Tools

### Browser DevTools (F12)
1. **Network Tab**: See API requests
   - Should see POST to `http://localhost:5132/api/auth/login`
   - Status should be 200 (not 404 or 500)

2. **Console Tab**: See JavaScript errors
   - Should be empty or just warnings
   - Red messages are errors

3. **Application Tab**: See stored data
   - Look for `authToken` in localStorage
   - Should appear after successful login

### Backend Logs
- Run with: `dotnet run`
- Look for errors starting with `fail:` or `error:`
- Look for port conflict messages

---

## 🚀 If Everything Works!

Great! Your app is running. Now:

1. **Test CRUD Operations**
   - Add a job application
   - Edit it
   - Delete it
   - Refresh and verify it persists

2. **Test Authentication**
   - Create an account (register)
   - Logout
   - Login with those credentials
   - Should work perfectly

3. **View the Database**
   ```bash
   # Database file is at:
   server/jobs.db
   
   # To inspect it, download SQLite Browser from:
   # https://sqlitebrowser.org/
   ```

---

## 📞 Need More Help?

**Backend Issues?**
- Check `server/Program.cs` for configuration
- Look at `server/Controllers/AuthController.cs` for login logic
- View logs in terminal where you ran `dotnet run`

**Frontend Issues?**
- Check `client/src/services/jobService.ts` for API calls
- Check `client/src/components/Login.tsx` for UI
- Press F12 in browser for detailed error messages

**Database Issues?**
- Database file: `server/jobs.db`
- Delete it if corrupted
- Migrations run automatically

---

**Key Files Reference:**
- Backend entry: `server/Program.cs`
- Login API: `server/Controllers/AuthController.cs`
- Frontend API client: `client/src/services/jobService.ts`
- Login UI: `client/src/components/Login.tsx`
- Main app: `client/src/App.tsx`
