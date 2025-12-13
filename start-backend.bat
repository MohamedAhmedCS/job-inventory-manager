@echo off
REM Backend startup script - Run this FIRST before the frontend

cd /d "%~dp0\server"

echo.
echo ========================================
echo Job Inventory Manager - Backend Startup
echo ========================================
echo.

REM Check if .NET is installed
where dotnet >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: .NET SDK is not installed or not in PATH
    echo Please install .NET 6.0 or later from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

REM Display version
echo .NET Version:
dotnet --version
echo.

REM Run the server
echo Starting backend server...
echo Server will run on: http://localhost:5132
echo.
echo Database will be automatically migrated on first run.
echo.

dotnet run

pause
