const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const gemini = require('./bots/gemini');
const whatsappBot = require('./bots/whatsapp');
const instagramBot = require('./bots/instagram');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Persistent server config file path
const CONFIG_FILE = path.join(__dirname, 'config.json');

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        }
    } catch (e) {}
    return {
        apiKey: process.env.GEMINI_API_KEY || '',
        botName: process.env.BOT_NAME || 'Linxe',
        mode: process.env.DEFAULT_MODE || 'roast',
        options: {
            language: 'English Only',
            profanity: true,
            answerDirectly: true,
            length: 'short',
            temperature: 0.8,
            model: 'gemini-1.5-flash',
            customPrompt: ''
        },
        whitelisted: [],
        blacklisted: ['120363426079472107@g.us', '918431546120']
    };
}

let activeConfig = loadConfig();

function saveConfig(cfg) {
    activeConfig = { ...activeConfig, ...cfg };
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(activeConfig, null, 2));
    } catch (e) {}
}

// SSE Clients for real-time live logs & QR code
const sseClients = new Set();

function broadcastEvent(type, data) {
    const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
    for (const res of sseClients) {
        try { res.write(payload); } catch (e) { sseClients.delete(res); }
    }
}

// Wire up bot callbacks to SSE broadcast
whatsappBot.onLogCallback = (log) => broadcastEvent('log', { source: 'WhatsApp', text: log });
whatsappBot.onStatusCallback = (st) => broadcastEvent('whatsapp_status', st);

instagramBot.onLogCallback = (log) => broadcastEvent('log', { source: 'Instagram', text: log });
instagramBot.onStatusCallback = (st) => broadcastEvent('instagram_status', st);

// --- API Routes ---

// SSE Stream
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));

    // Send initial status
    res.write(`data: ${JSON.stringify({
        type: 'init',
        data: {
            whatsapp: { status: whatsappBot.status, qr: whatsappBot.qrCodeDataUrl },
            instagram: { status: instagramBot.status },
            config: activeConfig
        }
    })}\n\n`);
});

// Verify Gemini API Key (returns detailed message if wrong)
app.post('/api/verify-key', async (req, res) => {
    const { apiKey } = req.body;
    const result = await gemini.verifyApiKey(apiKey);
    if (result.valid) {
        saveConfig({ apiKey: apiKey.trim() });
    }
    return res.json(result);
});

// Test / Sandbox Chat (Works instantly on Web, Android, iPhone, Mac, Windows, Linux)
app.post('/api/chat', async (req, res) => {
    const { apiKey, mode, message, options } = req.body;
    const effectiveKey = (apiKey && apiKey.trim()) || activeConfig.apiKey;
    if (!effectiveKey) {
        return res.status(400).json({ error: 'Please enter your Gemini API Key first.' });
    }

    try {
        const effectiveMode = mode || activeConfig.mode || 'roast';
        const effectiveOptions = { ...activeConfig.options, ...(options || {}), botName: activeConfig.botName };
        const reply = await gemini.generateReply(effectiveKey, effectiveMode, message, effectiveOptions);
        broadcastEvent('log', { source: 'Web Sandbox', text: `[Chat Test] User: "${message}" -> Bot: "${reply}"` });
        return res.json({ reply });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to generate reply' });
    }
});

// Get Current Status & Config
app.get('/api/status', (req, res) => {
    return res.json({
        config: activeConfig,
        whatsapp: { status: whatsappBot.status, qr: whatsappBot.qrCodeDataUrl },
        instagram: { status: instagramBot.status }
    });
});

// Update Config
app.post('/api/config', (req, res) => {
    saveConfig(req.body);
    broadcastEvent('config_updated', activeConfig);
    return res.json({ success: true, config: activeConfig });
});

// WhatsApp Bot controls
app.post('/api/whatsapp/start', async (req, res) => {
    const { apiKey, mode, options } = req.body;
    const key = apiKey || activeConfig.apiKey;
    if (!key) {
        return res.status(400).json({ error: 'API Key is required to start WhatsApp Bot' });
    }
    whatsappBot.start({
        apiKey: key,
        botName: activeConfig.botName,
        mode: mode || activeConfig.mode,
        options: { ...activeConfig.options, ...(options || {}) },
        whitelisted: activeConfig.whitelisted,
        blacklisted: activeConfig.blacklisted
    });
    return res.json({ success: true, status: 'starting' });
});

app.post('/api/whatsapp/stop', async (req, res) => {
    await whatsappBot.stop();
    return res.json({ success: true, status: 'stopped' });
});

// Instagram Bot controls
app.post('/api/instagram/start', async (req, res) => {
    const { apiKey, mode, options, threads } = req.body;
    const key = apiKey || activeConfig.apiKey;
    if (!key) {
        return res.status(400).json({ error: 'API Key is required to start Instagram Bot' });
    }
    instagramBot.start({
        apiKey: key,
        botName: activeConfig.botName,
        mode: mode || activeConfig.mode,
        options: { ...activeConfig.options, ...(options || {}) }
    }, threads || []);
    return res.json({ success: true, status: 'starting' });
});

app.post('/api/instagram/stop', async (req, res) => {
    await instagramBot.stop();
    return res.json({ success: true, status: 'stopped' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================================`);
    console.log(`  🚀 Linxe AI Bot Control Hub is RUNNING!`);
    console.log(`  • Web Dashboard: http://localhost:${PORT}`);
    console.log(`  • Network URL:   http://0.0.0.0:${PORT}`);
    console.log(`  • Author:        https://www.instagram.com/linxedev/`);
    console.log(`  • Platforms:     Linux, macOS, Windows, Android, iOS`);
    console.log(`========================================================\n`);
});
