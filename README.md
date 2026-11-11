# ⚡ Linxe AI Bot — Multi-Platform Control Hub

[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20Auto--Install-brightgreen.svg)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-blue.svg)](https://aistudio.google.com/)
[![Platforms](https://img.shields.io/badge/Platforms-Linux%20%7C%20macOS%20%7C%20Windows%20%7C%20Android%20%7C%20iPhone-orange.svg)](#-supported-platforms)
[![Instagram](https://img.shields.io/badge/Instagram-@linxedev-e4405f.svg)](https://www.instagram.com/linxedev/)

A powerful, open-source AI Bot Control Hub powered by **Google Gemini AI**. Run autonomous conversational bots on **WhatsApp**, **Instagram**, or directly in your web browser with a full-featured visual dashboard.

Created with ⚡ by **[Linxe (@linxedev)](https://www.instagram.com/linxedev/)**.

---

## 🐣 Rookie & Beginner Quick Start (30 Seconds)

Never coded before? Don't worry! Everything is automated for you.

```
┌────────────────────────────────────────────────────────┐
│  1. Double-click start.bat (Windows) or ./start.sh     │
│  2. It automatically checks & installs Node.js for you │
│  3. Web browser automatically opens Control Hub        │
│  4. Paste your free Gemini API key & pick a mode       │
│  5. Scan WhatsApp QR code right on the web screen!     │
└────────────────────────────────────────────────────────┘
```

### Step 1: Download or Clone
Click the green **`< > Code`** button above & select **Download ZIP** (or clone via Git):
```bash
git clone https://github.com/azasticmaxxer/linxe-ai-bot.git
cd linxe-ai-bot
```

### Step 2: 1-Click Launch (Automatic Installer)
* **🪟 Windows**: Double-click **`start.bat`**.
* **🐧 Linux / 🍏 macOS**: Double-click or run **`./start.sh`**.
* **🤖 Android (Termux)**: Run `bash start.sh`.

> **💡 Smart Auto-Installer:** The launcher checks if Node.js is installed. If you already have it, it proceeds immediately. If missing, it **automatically downloads and installs Node.js for your operating system** (Windows, Ubuntu/Debian/Mint, Arch, Fedora, macOS, or Termux).

### Step 3: Control Hub Opens in Your Browser
The dashboard automatically pops up at:
👉 **`http://localhost:3000`**

---

## 🛡️ Super Easy Whitelist & Blacklist (No Code Needed!)

Inside the Control Hub, you will find the **Access Control: Whitelist & Blacklist** card:

* **✅ Whitelist (Allowed Contacts)**:
  * Type any phone number (e.g. `+91 99431 31705` or `9943131705`), contact name, or Instagram handle.
  * Click **➕ Add**.
  * Turn on **Strict Whitelist Mode** if you only want the bot to reply to your friends while ignoring all strangers and groups.
* **⛔ Blacklist / Mute (Ignored Contacts)**:
  * Type any number, spammer, or group (e.g. `+91 84315 46120`, `Team Android`).
  * Click **⛔ Mute**.
  * Messages from these people are dropped instantly with zero response.
* **1-Click Removal**: Every contact displays as a chip with an **✖** button to remove them instantly.

---

## 🔑 Setting Up Your Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key** (100% free tier available).
3. Paste the key into the **Google Gemini API Key** input in the Control Hub and click **Verify Key**.
4. **Smart Diagnostic**:
   * If correct: Turns green (`✅ API Key is Valid & Ready!`).
   * If wrong: It will **explicitly tell you what went wrong** (e.g. invalid key format, expired token, or quota limit).

---

## 🎭 1-Click Persona Modes

Switch your bot's behavior in real time with a single click:

| Mode | Vibe & Persona |
| :--- | :--- |
| **🔥 Savage Roast** | Ruthless, sarcastic mockery, casual curse words (wtf, clown, dumbass), cooks people hard. |
| **🤝 Friendly Bro** | Super chill, supportive homie vibes, answers questions directly, helpful, no swearing. |
| **👤 Natural Human** | Authentic everyday human conversation, emotionally adaptive, mirrors the user's tone. |
| **⚡ Uncensored** | Total freedom, any language (Tamil, Russian, Hindi, English, etc.), roleplays. |
| **🪞 Mirror Mode** | "Same to same": matches user slang, dialect, attitude, and swear level exactly. |
| **🤖 Sarcastic AI** | Deadpan, witty, cynical observations and ironic tech banter. |
| **🧠 Genius Tutor** | 200 IQ step-by-step problem solver, crystal-clear technical answers. |

---

## 📱 Supported Platforms

### 🐧 Linux & 🍏 macOS
```bash
chmod +x start.sh
./start.sh
```

### 🪟 Windows
```cmd
start.bat
```

### 🤖 Android (via Termux)
1. Install **Termux** from [F-Droid](https://f-droid.org/packages/com.termux/).
2. Run:
```bash
pkg update -y
pkg install nodejs git -y
git clone https://github.com/azasticmaxxer/linxe-ai-bot.git
cd linxe-ai-bot
bash start.sh
```
3. Open your mobile browser at `http://localhost:3000`.

### 📱 iPhone / iOS
1. Start the bot on your computer (`./start.sh` or `start.bat`).
2. Connect your iPhone to the same Wi-Fi network.
3. Open Safari and navigate to: `http://<YOUR_COMPUTER_IP>:3000`
4. Tap **Share** &gt; **Add to Home Screen** to use it as a native app!

---

## 👤 Author & Support

Created by **Linxe**:
* **Instagram**: [@linxedev](https://www.instagram.com/linxedev/)
* **Direct Link**: [https://www.instagram.com/linxedev/](https://www.instagram.com/linxedev/)

Drop a DM on Instagram for questions, suggestions, or feature requests!

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
