const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const gemini = require('./gemini');

puppeteer.use(StealthPlugin());

class InstagramBotManager {
    constructor() {
        this.browser = null;
        this.status = 'stopped';
        this.lastLogs = [];
        this.threads = [];
        this.config = {
            apiKey: '',
            botName: 'Linxe',
            mode: 'roast',
            options: {}
        };
        this.isRunning = false;
        this.onLogCallback = null;
        this.onStatusCallback = null;
    }

    log(msg) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] [Instagram] ${msg}`;
        this.lastLogs.push(entry);
        if (this.lastLogs.length > 100) this.lastLogs.shift();
        if (this.onLogCallback) this.onLogCallback(entry);
    }

    setStatus(newStatus, extra = {}) {
        this.status = newStatus;
        if (this.onStatusCallback) this.onStatusCallback({ status: newStatus, ...extra });
    }

    async start(config, threads = []) {
        if (this.isRunning) {
            await this.stop();
        }

        this.config = { ...this.config, ...config };
        this.threads = threads.length > 0 ? threads : this.threads;
        this.setStatus('starting');
        this.log('Launching Puppeteer Stealth Browser...');

        try {
            const sessionDir = path.join(__dirname, '..', '.ig_session');
            this.browser = await puppeteer.launch({
                headless: 'new',
                userDataDir: sessionDir,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ]
            });

            this.isRunning = true;
            this.setStatus('ready');
            this.log('✅ Instagram Browser started! Ready to monitor direct message threads.');
        } catch (err) {
            this.log(`Failed to launch browser: ${err.message}`);
            this.setStatus('error', { error: err.message });
        }
    }

    async stop() {
        this.isRunning = false;
        if (this.browser) {
            this.log('Closing Instagram browser...');
            try {
                await this.browser.close();
            } catch (e) {}
            this.browser = null;
        }
        this.setStatus('stopped');
        this.log('Instagram Bot stopped.');
    }
}

module.exports = new InstagramBotManager();
