#!/usr/bin/env bash
# ==============================================================================
# Linxe AI Bot - Universal Auto-Installer & Launcher
# Supported: Linux (Ubuntu/Debian/Zorin/Mint/Arch/Fedora), macOS, Android (Termux)
# ==============================================================================

set -e

echo "=========================================================="
echo "  🚀 Linxe AI Bot - Universal Setup & Launcher"
echo "  • Author: https://www.instagram.com/linxedev/"
echo "=========================================================="

# 1. Check if Node.js is installed; if not, auto-install based on OS
if command -v node &> /dev/null; then
    NODE_VER=$(node -v)
    echo "✅ Node.js is already installed (${NODE_VER})."
else
    echo "⚠️  Node.js is not found! Auto-installing according to your operating system..."

    # Android (Termux)
    if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
        echo "📱 Android (Termux) detected! Installing Node.js & Git..."
        pkg update -y
        pkg install nodejs git -y

    # macOS
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍏 macOS detected! Checking Homebrew..."
        if ! command -v brew &> /dev/null; then
            echo "Installing Homebrew package manager..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        echo "Installing Node.js via Homebrew..."
        brew install node

    # Linux
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "🐧 Linux detected! Detecting package manager..."
        if command -v apt-get &> /dev/null; then
            echo "Using APT (Ubuntu/Debian/Mint/Zorin)..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v pacman &> /dev/null; then
            echo "Using Pacman (Arch Linux)..."
            sudo pacman -Sy --noconfirm nodejs npm
        elif command -v dnf &> /dev/null; then
            echo "Using DNF (Fedora/RHEL)..."
            sudo dnf install -y nodejs
        elif command -v yum &> /dev/null; then
            echo "Using YUM..."
            sudo yum install -y nodejs
        else
            echo "❌ Could not auto-detect package manager. Please install Node.js (v18+) from https://nodejs.org/"
            exit 1
        fi
    else
        echo "❌ Unknown OS type. Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
fi

# 2. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📦 First-time setup: Installing required bot dependencies (npm install)..."
    npm install
fi

# 3. Automatically open web dashboard in browser
open_dashboard() {
    sleep 2
    URL="http://localhost:3000"
    if command -v xdg-open &> /dev/null; then
        xdg-open "$URL" 2>/dev/null || true
    elif command -v open &> /dev/null; then
        open "$URL" 2>/dev/null || true
    fi
}
open_dashboard &

echo "✨ Launching Linxe AI Bot Control Hub at http://localhost:3000..."
node server.js
