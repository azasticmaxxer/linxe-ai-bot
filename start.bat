@echo off
REM ==========================================================
REM Linxe AI Bot - Universal Windows Auto-Installer & Launcher
REM Author: https://www.instagram.com/linxedev/
REM ==========================================================
title Linxe AI Bot Control Hub

echo ==========================================================
echo   Linxe AI Bot Control Hub (Windows Auto-Setup)
echo   Author: https://www.instagram.com/linxedev/
echo ==========================================================

REM 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Node.js is not found! Auto-installing for Windows...

    REM Try winget (Windows Package Manager built into Windows 10 & 11)
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        echo [INFO] Using Windows Package Manager (winget) to install Node.js LTS...
        winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        echo [INFO] Refreshing environment variables...
        call refreshenv 2>nul
    ) else (
        echo [INFO] Downloading official Node.js installer via PowerShell...
        powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi' -OutFile 'node_installer.msi'"
        echo [INFO] Running Node.js installer (Please follow the prompt)...
        msiexec /i node_installer.msi /passive
        del node_installer.msi 2>nul
    )

    REM Verify install
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] Node.js was installed. Please restart this script or command prompt to refresh system paths.
        echo If it still fails, download Node.js directly from https://nodejs.org/
        pause
        exit /b
    )
) else (
    echo [OK] Node.js is already installed.
)

REM 2. Install dependencies if node_modules is missing
if not exist node_modules (
    echo [INFO] First time setup: Installing dependencies (npm install)...
    call npm install
)

REM 3. Automatically open browser to control hub
start http://localhost:3000

echo [INFO] Starting Control Hub server...
node server.js
pause
