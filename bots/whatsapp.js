const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const path = require('path');
const gemini = require('./gemini');

class WhatsAppBotManager {
    constructor() {
        this.client = null;
        this.status = 'stopped'; // 'stopped' | 'starting' | 'qr_ready' | 'ready' | 'error'
        this.qrCodeDataUrl = null;
        this.lastLogs = [];
        this.config = {
            apiKey: '',
            botName: 'Linxe',
            mode: 'roast',
            options: {},
            whitelisted: [],
            blacklisted: []
        };
        this.onLogCallback = null;
        this.onStatusCallback = null;
    }

    log(msg) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] [WhatsApp] ${msg}`;
        this.lastLogs.push(entry);
        if (this.lastLogs.length > 100) this.lastLogs.shift();
        if (this.onLogCallback) this.onLogCallback(entry);
    }

    setStatus(newStatus, extra = {}) {
        this.status = newStatus;
        if (this.onStatusCallback) this.onStatusCallback({ status: newStatus, ...extra });
    }

    async start(config) {
        if (this.client) {
            await this.stop();
        }

        this.config = { ...this.config, ...config };
        this.setStatus('starting');
        this.log('Initializing WhatsApp Web Client...');

        try {
            this.client = new Client({
                authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '..', '.wwebjs_auth') }),
                authTimeoutMs: 120000,
                puppeteer: {
                    headless: 'new',
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding'
                    ]
                },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            });

            this.client.on('qr', async (qr) => {
                this.log('New WhatsApp QR code received. Scan with your phone.');
                try {
                    this.qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 2 });
                    this.setStatus('qr_ready', { qr: this.qrCodeDataUrl });
                } catch (e) {
                    this.log(`Failed to render QR Code: ${e.message}`);
                }
            });

            this.client.on('ready', () => {
                this.qrCodeDataUrl = null;
                this.setStatus('ready');
                this.log('✅ WhatsApp Web Client is ONLINE & LISTENING!');
            });

            this.client.on('auth_failure', (err) => {
                this.log(`❌ Auth failure: ${err}`);
                this.setStatus('error', { error: 'Authentication failed' });
            });

            this.client.on('disconnected', (reason) => {
                this.log(`⚠️ Client disconnected: ${reason}`);
                this.setStatus('stopped');
            });

            this.client.on('message_create', async (msg) => {
                try {
                    if (msg.from === 'status@broadcast') return;
                    if (msg.fromMe) return; // Skip own outgoing messages

                    const rawChatId = (msg.id && msg.id.remote) ? msg.id.remote : msg.from;
                    const text = (msg.body || '').trim();
                    if (!text) return;

                    let senderName = '';
                    try {
                        const contact = await msg.getContact();
                        senderName = contact.pushname || contact.name || '';
                    } catch (e) {}

                    const authorId = msg.author || '';

                    // Smart matching helper (checks phone numbers, names, handles, and group IDs)
                    const checkMatches = (list) => {
                        if (!list || !Array.isArray(list)) return false;
                        return list.some(item => {
                            if (!item) return false;
                            const cleanItem = String(item).trim().toLowerCase();
                            const itemDigits = cleanItem.replace(/\D/g, '');
                            const chatDigits = rawChatId.replace(/\D/g, '');
                            const authorDigits = authorId.replace(/\D/g, '');

                            if (itemDigits.length >= 6) {
                                if (chatDigits.endsWith(itemDigits) || itemDigits.endsWith(chatDigits)) return true;
                                if (authorDigits && (authorDigits.endsWith(itemDigits) || itemDigits.endsWith(authorDigits))) return true;
                            }
                            if (rawChatId.toLowerCase().includes(cleanItem)) return true;
                            if (authorId.toLowerCase().includes(cleanItem)) return true;
                            if (senderName.toLowerCase().includes(cleanItem)) return true;
                            return false;
                        });
                    };

                    // Blacklist check: completely drop ignored people/groups
                    if (checkMatches(this.config.blacklisted)) {
                        return;
                    }

                    // Whitelist check: if whitelist is active, only reply to allowed people
                    if (this.config.whitelistOnly && this.config.whitelisted && this.config.whitelisted.length > 0) {
                        if (!checkMatches(this.config.whitelisted)) {
                            return;
                        }
                    }

                    this.log(`📩 Incoming from ${rawChatId}: "${text.slice(0, 40)}"`);

                    if (!this.config.apiKey) {
                        this.log('⚠️ No Gemini API key configured! Skipping reply.');
                        return;
                    }

                    const reply = await gemini.generateReply(
                        this.config.apiKey,
                        this.config.mode,
                        text,
                        this.config.options
                    );

                    if (reply && reply !== 'PASS') {
                        await msg.reply(reply);
                        this.log(`🤖 Replied [${this.config.mode}]: "${reply.slice(0, 50)}..."`);
                    }
                } catch (err) {
                    this.log(`Error processing message: ${err.message}`);
                }
            });

            await this.client.initialize();
        } catch (err) {
            this.log(`Fatal init error: ${err.message}`);
            this.setStatus('error', { error: err.message });
        }
    }

    async stop() {
        if (!this.client) {
            this.setStatus('stopped');
            return;
        }
        this.log('Stopping WhatsApp Web Client...');
        try {
            await this.client.destroy();
        } catch (e) {}
        this.client = null;
        this.qrCodeDataUrl = null;
        this.setStatus('stopped');
        this.log('WhatsApp Web Client stopped.');
    }
}

module.exports = new WhatsAppBotManager();
