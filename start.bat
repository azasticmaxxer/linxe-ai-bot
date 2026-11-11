@echo off
REM Linxe AI Bot - Windows Startup Script
title Linxe AI Bot Control Hub

echo ==========================================================
echo   Linxe AI Bot Control Hub (Windows)
echo   Author: https://www.instagram.com/linxedev/
echo ==========================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js (v18+) from https://nodejs.org/
    pause
    exit /b
)

if not exist node_modules (
    echo [INFO] First time setup: Installing dependencies...
    npm install
)

echo [INFO] Starting Control Hub...
node server.js
pause
