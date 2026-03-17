@echo off
echo ==========================================
echo      RoadSentinel Sync Script
echo ==========================================

echo [1/2] Building web assets (Vite)...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Syncing to Android project (Capacitor)...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Sync failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo      Sync Complete! 
echo      You can now run the app in Android Studio.
echo ==========================================
pause
