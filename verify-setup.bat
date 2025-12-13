@echo off
REM Verify required dependencies are installed

echo Checking dependencies...
echo.

dotnet --version >nul 2>&1 || (echo ✗ .NET SDK not found && goto :fail)
echo ✓ .NET SDK installed

node --version >nul 2>&1 || (echo ✗ Node.js not found && goto :fail)
echo ✓ Node.js installed

npm --version >nul 2>&1 || (echo ✗ npm not found && goto :fail)
echo ✓ npm installed

echo.
echo ✓ All dependencies installed
echo.
echo To start: run start.bat
echo.
pause
exit /b 0

:fail
echo.
echo ✗ Setup failed. Install missing tools and try again.
pause
exit /b 1
