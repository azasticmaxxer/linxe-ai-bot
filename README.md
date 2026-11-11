# ⚡ Linxe AI Bot — Multi-Platform Control Hub

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-blue.svg)](https://aistudio.google.com/)
[![Platforms](https://img.shields.io/badge/Platforms-Linux%20%7C%20macOS%20%7C%20Windows%20%7C%20Android%20%7C%20iPhone-orange.svg)](#supported-platforms)
[![Instagram](https://img.shields.io/badge/Instagram-@linxedev-e4405f.svg)](https://www.instagram.com/linxedev/)

A powerful, open-source AI Bot Control Hub powered by **Google Gemini AI**. Run autonomous conversational bots on **WhatsApp**, **Instagram**, or directly in your web browser with a full-featured visual dashboard.

Created with ⚡ by **[Linxe (@linxedev)](https://www.instagram.com/linxedev/)**.

---

## 🌟 Key Features

* **🎛️ Modern Web Control Hub**:
  * Clean, responsive cyberpunk dark UI designed for both desktop and mobile screens.
  * **API Key Validation**: Checks your key in real time; if wrong, expired, or invalid, it tells you exactly what the issue is.
  * **1-Click Persona Modes**:
    * 🔥 **Savage Roast**: Ruthless insults, sarcastic mockery, profanity allowed, cooks hard.
    * 🤝 **Friendly Bro**: Chill, supportive homie vibes, always answers questions directly, no swearing.
    * 👤 **Natural Human**: Emotionally adaptive, authentic everyday texting, mirrors conversational vibe.
    * ⚡ **Uncensored Freedom**: Zero restrictions, speaks any language, roleplays, creative freedom.
    * 🪞 **Mirror Mode ("Same-to-Same")**: Matches user slang, dialect, and attitude.
    * 🤖 **Sarcastic AI**: Dry, witty, cynical humor and tech banter.
    * 🧠 **Genius Tutor**: 200 IQ step-by-step technical problem solver.
* **📱 Cross-Platform Support**:
  * **Linux & macOS**: Native bash startup script (`./start.sh`).
  * **Windows**: 1-click batch launcher (`start.bat`).
  * **Android**: Run directly on your phone via **Termux**!
  * **iPhone / iOS**: Access the web control hub and chat sandbox from Safari as a mobile PWA!
* **📲 WhatsApp Bot**:
  * Scans QR code directly from the web browser — no messy terminal windows!
  * Whitelist and mute controls.
* **📸 Instagram Bot**:
  * Puppeteer Stealth engine with background tab monitoring.
* **💬 Instant Web Chat Sandbox**:
  * Test any mode immediately in a simulated messenger right in your browser.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js** (v18 or higher) installed: [Download Node.js](https://nodejs.org/)
* **Google Gemini API Key**: [Get free API Key from Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 2. Installation & Running

#### 🐧 Linux & 🍏 macOS
```bash
# Clone the repository
git clone https://github.com/randomchessmaster80-cmd/linxe-ai-bot.git
cd linxe-ai-bot

# Run the startup script (auto-installs dependencies on first run)
chmod +x start.sh
./start.sh
```

#### 🪟 Windows
```cmd
# Clone the repository
git clone https://github.com/randomchessmaster80-cmd/linxe-ai-bot.git
cd linxe-ai-bot

# Double-click start.bat or run in CMD:
start.bat
```

#### 🤖 Android (via Termux)
1. Install **Termux** from [F-Droid](https://f-droid.org/packages/com.termux/).
2. Run the following commands inside Termux:
```bash
pkg update -y
pkg install nodejs git -y
git clone https://github.com/randomchessmaster80-cmd/linxe-ai-bot.git
cd linxe-ai-bot
npm install
node server.js
```
3. Open your mobile browser (Chrome/Brave) and go to: `http://localhost:3000`

#### 📱 iPhone / iOS
1. Start the server on your computer or VPS (`node server.js`).
2. Make sure your iPhone is on the same Wi-Fi network.
3. Open Safari and navigate to: `http://<YOUR_COMPUTER_IP>:3000`
4. Tap **Share** &gt; **Add to Home Screen** to use it like a native app!

---

## 🔑 Setting Up Your Gemini API Key

1. Head over to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key** (100% free tier available).
3. Open the **Linxe Control Hub** (`http://localhost:3000`).
4. Paste your key in the **Google Gemini API Key** input box and click **Verify Key**.
5. If the key is valid, the badge turns green. If incorrect, it displays the exact error reason!

---

## ⚙️ Customization Options

Inside the Control Hub, toggle **Custom Control Hub Options** to configure:
* **Bot Name**: Change the bot's name (default: `Linxe`).
* **Language Preference**: English Only, Multi-Language (supports Tamil, Tanglish, Russian, Hindi, Spanish, etc.).
* **Response Length**: Ultra-Punchy (1 line), Short (1-2 sentences), or Detailed.
* **Model Selection**: Switch between `gemini-1.5-flash`, `gemini-flash-lite-latest`, `gemini-2.0-flash-exp`, and `gemini-1.5-pro`.
* **Profanity Filter**: Toggle raw casual swearing on or off.
* **Direct Answers**: Enforce answering factual questions directly without dodging.
* **Custom System Prompt**: Write your own persona rules.

---

## 👤 Author & Support

Created by **Linxe**:
* **Instagram**: [@linxedev](https://www.instagram.com/linxedev/)
* **Direct Link**: [https://www.instagram.com/linxedev/](https://www.instagram.com/linxedev/)

Feel free to open an issue or drop a DM on Instagram for questions, suggestions, or feature requests!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
