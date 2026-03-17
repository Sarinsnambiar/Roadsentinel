@echo off
echo ==========================================
echo      RoadSentinel APK Build Script
echo ==========================================

echo [1/3] Building web assets (Vite)...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Syncing to Android project (Capacitor)...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Sync failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Building APK (Gradle)...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo Gradle build failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ==========================================
echo      Build Complete! 
echo      Your APK is located at:
echo      android/app/build/outputs/apk/debug/app-debug.apk
echo ==========================================
pause
