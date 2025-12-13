@echo off
REM Job Inventory Manager - Start Backend and Frontend

title Job Inventory Manager

cls
echo Starting Job Inventory Manager...
echo.

REM Start backend (Terminal 1)
start "Backend - .NET" cmd /k "cd server && dotnet run"

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start frontend (Terminal 2)
start "Frontend - React" cmd /k "cd client && npm start"

echo.
echo Backend should start on: http://localhost:5132
echo Frontend should start on: http://localhost:3000
echo.
pause
exit

echo Step 1: Starting Backend on port 5132...
echo.
start "Backend - Job Inventory Manager" cmd /k "cd server && dotnet run"

REM Give backend time to start
timeout /t 3 /nobreak

echo.
echo Step 2: Starting Frontend on port 3000...
echo.
start "Frontend - Job Inventory Manager" cmd /k "cd client && npm install && npm start"

timeout /t 2 /nobreak

echo.
echo ========================================
echo ✓ Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:5132
echo Frontend: http://localhost:3000
echo.
echo Login with:
echo   Username: testuser (or anything 3+ chars)
echo   Password: testpass123 (or anything 6+ chars)
echo.
echo Press Ctrl+C in either terminal to stop
echo.
pause
