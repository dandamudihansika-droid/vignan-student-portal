@echo off
title Vignan Student Portal Dashboard
color 0A

echo ========================================
echo   VIGNAN STUDENT PORTAL DASHBOARD
echo ========================================
echo.
echo Starting servers...
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server...
cd /d "%~dp0backend"
start "Backend" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [2/2] Starting Frontend Server...
cd /d "%~dp0frontend"
start "Frontend" cmd /c "npm start"
timeout /t 8 /nobreak >nul

REM Open Browser
echo Opening Dashboard...
start http://localhost:3000

echo.
echo ========================================
echo   DASHBOARD IS READY!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Demo Accounts:
echo   241fa04548 / 241fa04548 (CSE Student)
echo   251fa02345 / 251fa02345 (ECE Student)  
echo   241fa06789 / 241fa06789 (MECH Student)
echo.
echo Press CTRL+C in this window to stop all servers
echo Or close this window to stop servers automatically
echo.

REM Wait for user to close
pause >nul

echo.
echo Stopping servers...
taskkill /F /IM node.exe >nul 2>&1
echo Servers stopped. Goodbye!
timeout /t 2 /nobreak >nul
