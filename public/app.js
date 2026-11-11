document.addEventListener('DOMContentLoaded', () => {
    // State
    let apiKey = localStorage.getItem('linxe_gemini_key') || '';
    let currentMode = localStorage.getItem('linxe_mode') || 'roast';
    let options = JSON.parse(localStorage.getItem('linxe_options') || '{}');

    // DOM Elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
    const verifyKeyBtn = document.getElementById('verifyKeyBtn');
    const keyStatusBanner = document.getElementById('keyStatusBanner');
    const currentModeLabel = document.getElementById('currentModeLabel');
    const modeButtons = document.querySelectorAll('.mode-btn');

    const optionsToggle = document.getElementById('optionsToggle');
    const optionsContent = document.getElementById('optionsContent');
    const botNameInput = document.getElementById('botNameInput');
    const languageSelect = document.getElementById('languageSelect');
    const lengthSelect = document.getElementById('lengthSelect');
    const modelSelect = document.getElementById('modelSelect');
    const profanityToggle = document.getElementById('profanityToggle');
    const answerDirectlyToggle = document.getElementById('answerDirectlyToggle');
    const customPromptInput = document.getElementById('customPromptInput');
    const saveConfigBtn = document.getElementById('saveConfigBtn');

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const clearChatBtn = document.getElementById('clearChatBtn');

    const consoleLogs = document.getElementById('consoleLogs');
    const clearLogsBtn = document.getElementById('clearLogsBtn');

    const startWaBtn = document.getElementById('startWaBtn');
    const stopWaBtn = document.getElementById('stopWaBtn');
    const waStatusBadge = document.getElementById('waStatusBadge');
    const qrContainer = document.getElementById('qrContainer');
    const qrImage = document.getElementById('qrImage');

    const startIgBtn = document.getElementById('startIgBtn');
    const stopIgBtn = document.getElementById('stopIgBtn');
    const igStatusBadge = document.getElementById('igStatusBadge');

    // Restore saved state to inputs
    if (apiKey) {
        apiKeyInput.value = apiKey;
    }
    setMode(currentMode, false);

    if (options.botName) botNameInput.value = options.botName;
    if (options.language) languageSelect.value = options.language;
    if (options.length) lengthSelect.value = options.length;
    if (options.model) modelSelect.value = options.model;
    if (options.profanity !== undefined) profanityToggle.checked = options.profanity;
    if (options.answerDirectly !== undefined) answerDirectlyToggle.checked = options.answerDirectly;
    if (options.customPrompt) customPromptInput.value = options.customPrompt;

    // Toggle API Key visibility
    toggleKeyVisibility.addEventListener('click', () => {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleKeyVisibility.textContent = '🔒';
        } else {
            apiKeyInput.type = 'password';
            toggleKeyVisibility.textContent = '👁️';
        }
    });

    // Verify API Key
    verifyKeyBtn.addEventListener('click', async () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            showKeyBanner('Please paste a Gemini API key first.', false);
            return;
        }

        verifyKeyBtn.disabled = true;
        verifyKeyBtn.textContent = 'Verifying...';
        showKeyBanner('Checking API key with Google Gemini servers...', 'info');

        try {
            const res = await fetch('/api/verify-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: key })
            });
            const data = await res.json();

            if (data.valid) {
                apiKey = key;
                localStorage.setItem('linxe_gemini_key', apiKey);
                showKeyBanner('✅ API Key is Valid & Ready! (Model: ' + data.model + ')', true);
            } else {
                showKeyBanner('❌ Invalid Gemini API Key: ' + (data.error || 'Verification failed. Please check key.'), false);
            }
        } catch (err) {
            showKeyBanner('❌ Connection Error: ' + err.message, false);
        } finally {
            verifyKeyBtn.disabled = false;
            verifyKeyBtn.textContent = 'Verify Key';
        }
    });

    function showKeyBanner(msg, type) {
        keyStatusBanner.textContent = msg;
        keyStatusBanner.className = 'status-banner';
        if (type === true || type === 'success') {
            keyStatusBanner.classList.add('success');
        } else if (type === 'info') {
            keyStatusBanner.classList.add('info');
        } else {
            keyStatusBanner.classList.add('error');
        }
        keyStatusBanner.classList.remove('hidden');
    }

    // Mode Buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setMode(mode, true);
        });
    });

    function setMode(mode, notifyServer = true) {
        currentMode = mode;
        localStorage.setItem('linxe_mode', mode);

        modeButtons.forEach(b => {
            if (b.dataset.mode === mode) {
                b.classList.add('active');
                currentModeLabel.textContent = 'Active: ' + b.querySelector('.mode-name').textContent;
            } else {
                b.classList.remove('active');
            }
        });

        if (notifyServer) {
            fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode })
            }).catch(() => {});
            logToConsole(`Switched persona mode to: [${mode.toUpperCase()}]`);
        }
    }

    // Options Accordion
    optionsToggle.addEventListener('click', () => {
        optionsToggle.classList.toggle('open');
        optionsContent.classList.toggle('open');
    });

    // Save Options
    saveConfigBtn.addEventListener('click', () => {
        options = {
            botName: botNameInput.value.trim() || 'Linxe',
            language: languageSelect.value,
            length: lengthSelect.value,
            model: modelSelect.value,
            profanity: profanityToggle.checked,
            answerDirectly: answerDirectlyToggle.checked,
            customPrompt: customPromptInput.value.trim()
        };
        localStorage.setItem('linxe_options', JSON.stringify(options));

        fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                botName: options.botName,
                mode: currentMode,
                options
            })
        }).then(() => {
            saveConfigBtn.textContent = '✅ Saved!';
            setTimeout(() => saveConfigBtn.textContent = '💾 Save Options', 1500);
            logToConsole('Custom options updated successfully.');
        }).catch(err => {
            alert('Failed to save config: ' + err.message);
        });
    });

    // Interactive Chat Sandbox
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        addChatBubble(text, 'user');

        const key = apiKey || apiKeyInput.value.trim();
        if (!key) {
            addChatBubble('⚠️ Please enter and verify your Google Gemini API Key on the left first!', 'bot');
            return;
        }

        const typingBubble = addChatBubble('Thinking...', 'bot');

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: key,
                    mode: currentMode,
                    message: text,
                    options
                })
            });

            const data = await res.json();
            if (res.ok && data.reply) {
                typingBubble.querySelector('.msg-bubble').textContent = data.reply;
            } else {
                typingBubble.querySelector('.msg-bubble').textContent = '❌ Error: ' + (data.error || 'Failed to reply');
            }
        } catch (err) {
            typingBubble.querySelector('.msg-bubble').textContent = '❌ Network Error: ' + err.message;
        }
    });

    function addChatBubble(text, sender) {
        const row = document.createElement('div');
        row.className = `chat-msg ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.textContent = text;
        row.appendChild(bubble);
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return row;
    }

    clearChatBtn.addEventListener('click', () => {
        chatMessages.innerHTML = `
            <div class="chat-msg bot">
                <div class="msg-bubble">Chat cleared. Type any message below to test Linxe in <strong>${currentMode.toUpperCase()}</strong> mode!</div>
            </div>
        `;
    });

    // Console Logs
    function logToConsole(text, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.textContent = `[${time}] ${text}`;
        consoleLogs.appendChild(line);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }

    clearLogsBtn.addEventListener('click', () => {
        consoleLogs.innerHTML = '';
    });

    // WhatsApp Bot Controls
    startWaBtn.addEventListener('click', async () => {
        const key = apiKey || apiKeyInput.value.trim();
        if (!key) {
            alert('Please enter your Gemini API Key first.');
            return;
        }
        startWaBtn.disabled = true;
        logToConsole('Requesting WhatsApp bot startup...');
        try {
            await fetch('/api/whatsapp/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: key, mode: currentMode, options })
            });
        } catch (e) {
            alert('Failed to start WhatsApp: ' + e.message);
        }
    });

    stopWaBtn.addEventListener('click', async () => {
        stopWaBtn.disabled = true;
        logToConsole('Stopping WhatsApp bot...');
        try {
            await fetch('/api/whatsapp/stop', { method: 'POST' });
        } catch (e) {}
    });

    // Instagram Bot Controls
    startIgBtn.addEventListener('click', async () => {
        const key = apiKey || apiKeyInput.value.trim();
        if (!key) {
            alert('Please enter your Gemini API Key first.');
            return;
        }
        startIgBtn.disabled = true;
        logToConsole('Requesting Instagram bot startup...');
        try {
            await fetch('/api/instagram/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: key, mode: currentMode, options })
            });
        } catch (e) {
            alert('Failed to start Instagram: ' + e.message);
        }
    });

    stopIgBtn.addEventListener('click', async () => {
        stopIgBtn.disabled = true;
        logToConsole('Stopping Instagram bot...');
        try {
            await fetch('/api/instagram/stop', { method: 'POST' });
        } catch (e) {}
    });

    // Server-Sent Events (SSE) Stream
    function initSSE() {
        const evtSource = new EventSource('/api/events');

        evtSource.onmessage = (event) => {
            try {
                const packet = JSON.parse(event.data);
                if (packet.type === 'init') {
                    updateWaUI(packet.data.whatsapp);
                    updateIgUI(packet.data.instagram);
                } else if (packet.type === 'whatsapp_status') {
                    updateWaUI(packet.data);
                } else if (packet.type === 'instagram_status') {
                    updateIgUI(packet.data);
                } else if (packet.type === 'log') {
                    logToConsole(packet.data.text);
                }
            } catch (e) {}
        };

        evtSource.onerror = () => {
            setTimeout(initSSE, 5000);
        };
    }

    function updateWaUI(data) {
        if (!data) return;
        const status = data.status || 'stopped';
        waStatusBadge.textContent = status.toUpperCase();
        waStatusBadge.className = `status-indicator ${status}`;

        if (status === 'ready') {
            startWaBtn.disabled = true;
            stopWaBtn.disabled = false;
            qrContainer.classList.add('hidden');
        } else if (status === 'qr_ready' && data.qr) {
            startWaBtn.disabled = true;
            stopWaBtn.disabled = false;
            qrImage.src = data.qr;
            qrContainer.classList.remove('hidden');
        } else if (status === 'starting') {
            startWaBtn.disabled = true;
            stopWaBtn.disabled = false;
            qrContainer.classList.add('hidden');
        } else {
            startWaBtn.disabled = false;
            stopWaBtn.disabled = true;
            qrContainer.classList.add('hidden');
        }
    }

    function updateIgUI(data) {
        if (!data) return;
        const status = data.status || 'stopped';
        igStatusBadge.textContent = status.toUpperCase();
        igStatusBadge.className = `status-indicator ${status}`;

        if (status === 'ready' || status === 'starting') {
            startIgBtn.disabled = true;
            stopIgBtn.disabled = false;
        } else {
            startIgBtn.disabled = false;
            stopIgBtn.disabled = true;
        }
    }

    initSSE();
});
