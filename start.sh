#!/usr/bin/env bash
# Linxe AI Bot - Cross-Platform Startup Script (Linux, macOS, Android Termux)

echo "=========================================================="
echo "  🚀 Starting Linxe AI Bot Control Hub..."
echo "  • Author: https://www.instagram.com/linxedev/"
echo "=========================================================="

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "👉 Please install Node.js (v18+) from https://nodejs.org/ or via Termux (pkg install nodejs)."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 First-time setup: Installing required dependencies..."
    npm install
fi

echo "✨ Launching server..."
node server.js
