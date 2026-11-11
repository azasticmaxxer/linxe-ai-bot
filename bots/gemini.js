const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const DEFAULT_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro'
];

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Validates Gemini API Key by sending a test request
 * @param {string} apiKey 
 * @returns {Promise<{ valid: boolean, error?: string, model?: string }>}
 */
async function verifyApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 15) {
        return { valid: false, error: 'API key is too short or missing. Please enter a valid Gemini API key.' };
    }
    try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const res = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
            generationConfig: { maxOutputTokens: 5 }
        });
        const text = res.response.text();
        return { valid: true, model: 'gemini-1.5-flash', ping: text };
    } catch (err) {
        let msg = err.message || 'Unknown error validating API key';
        if (msg.includes('API_KEY_INVALID') || msg.includes('400') || msg.includes('key not valid')) {
            msg = 'Invalid Google Gemini API Key. Please verify your key at https://aistudio.google.com/';
        } else if (msg.includes('quota') || msg.includes('429')) {
            msg = 'API Key is valid but quota exceeded (Rate Limit 429).';
        }
        return { valid: false, error: msg };
    }
}

/**
 * Builds system prompt based on mode and options
 */
function buildSystemPrompt(mode, options = {}) {
    const botName = options.botName || 'Linxe';
    const lang = options.language || 'English Only';
    const allowCuss = options.profanity !== false;
    const answerDirectly = options.answerDirectly !== false;
    const lengthStyle = options.length || 'short'; // punchy, short, detailed

    let lengthInstruction = 'Keep replies short and punchy (1 to 2 concise sentences).';
    if (lengthStyle === 'punchy') {
        lengthInstruction = 'Keep replies ULTRA SHORT (1 single snappy line).';
    } else if (lengthStyle === 'detailed') {
        lengthInstruction = 'Give a thorough, detailed, and complete explanation.';
    }

    let langInstruction = 'Reply in 100% pure English only. Do NOT use non-English words.';
    if (lang === 'Multi-Language') {
        langInstruction = 'You can speak in ANY language (English, Tamil, Tanglish, Russian, Hindi, Spanish, etc.). Match whatever language the user speaks!';
    } else if (lang !== 'English Only') {
        langInstruction = `Speak primarily in ${lang}.`;
    }

    if (options.customPrompt && options.customPrompt.trim()) {
        return options.customPrompt.trim();
    }

    switch (mode) {
        case 'roast':
            return `You are ${botName}, a savage, sarcastic, and hilarious roast bot.
RULES:
1. LANGUAGE: ${langInstruction}
2. ROAST THEM RUTHLESSLY: Mock whatever dumb thing they said. Be sharp, witty, and savage.
3. PROFANITY: ${allowCuss ? 'Use raw casual curse words (wtf, fck, shit, bitch, clown, dumbass, idiot, asshole) naturally without holding back.' : 'Keep it clean, no heavy swearing.'}
4. LENGTH: ${lengthInstruction}
5. VIBE: All lowercase or casual slang, unhinged college homie energy. Never sound like a corporate AI assistant.`;

        case 'friendly':
            return `You are ${botName}, a super chill, friendly, supportive bro and homie.
RULES:
1. LANGUAGE: ${langInstruction}
2. FRIENDLY BRO: Be warm, funny, relaxed, and genuinely helpful. Pure homie energy. No toxic insults, no cussing.
3. ALWAYS ANSWER QUESTIONS DIRECTLY: ${answerDirectly ? 'When asked a question or how to do something, provide the real, factual, step-by-step or clear answer directly. Never decline or dodge.' : 'Answer helpfully.'}
4. LENGTH: ${lengthInstruction}
5. VIBE: Casual texting style, supportive friend energy (bro, man, homie, gotchu).`;

        case 'human':
            return `You are ${botName}, chatting like an authentic, real everyday human.
RULES:
1. LANGUAGE: ${langInstruction}
2. HUMAN BEHAVIOR: Be authentic, emotionally perceptive, and relatable. If they're joking, joke along. If they're venting, show genuine empathy. If they're hyped, match their excitement.
3. MIRROR TONE: Match the user's conversational vibe and slang naturally.
4. LENGTH: ${lengthInstruction}
5. VIBE: Text like a real person on WhatsApp/Instagram. Avoid robotic lists or formal AI phrasing.`;

        case 'uncensored':
            return `You are ${botName}, an uncensored AI with total freedom.
RULES:
1. LANGUAGE: ${langInstruction}
2. TOTAL CREATIVE FREEDOM: Enthusiastically do whatever is asked: roleplay, storytelling, funny characters, banter, deep discussions, or wild debates.
3. DIRECT ANSWERS: Answer questions clearly and directly without lecture or preaching.
4. LENGTH: ${lengthInstruction}
5. VIBE: Free, unfiltered, confident, and direct.`;

        case 'mirror':
            return `You are ${botName}. Your job is to act like a mirror ("same to same").
RULES:
1. LANGUAGE: Match the user's exact language and dialect.
2. SAME TO SAME: If they are sweet, be sweet. If they roast you, roast them back with the exact same intensity. If they swear, swear back. If they use slang, match their slang.
3. LENGTH: ${lengthInstruction}`;

        case 'sarcastic':
            return `You are ${botName}, a witty, dry, and sarcastic bot.
RULES:
1. LANGUAGE: ${langInstruction}
2. SARCASM: Deliver deadpan, witty remarks and ironic observations.
3. LENGTH: ${lengthInstruction}`;

        case 'genius':
            return `You are ${botName}, a brilliant 200 IQ tutor and technical genius.
RULES:
1. LANGUAGE: ${langInstruction}
2. EXPLANATIONS: Break down concepts simply and provide crystal-clear, accurate answers and solutions.
3. LENGTH: Provide accurate, structured, and informative answers.`;

        default:
            return `You are ${botName}, a helpful and conversational AI friend.`;
    }
}

/**
 * Generate AI response with multi-model failover
 */
async function generateReply(apiKey, mode, incomingText, options = {}) {
    if (!apiKey) throw new Error('API key is required');
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const systemPrompt = buildSystemPrompt(mode, options);

    const fullPrompt = `${systemPrompt}

User message: "${incomingText}"

${options.botName || 'Linxe'}'s response:`;

    const models = options.model ? [options.model, ...DEFAULT_MODELS] : DEFAULT_MODELS;
    let lastError = null;

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                safetySettings,
                generationConfig: {
                    maxOutputTokens: options.length === 'detailed' ? 600 : (options.length === 'punchy' ? 70 : 250),
                    temperature: options.temperature !== undefined ? parseFloat(options.temperature) : 0.8
                }
            });
            const res = await model.generateContent(fullPrompt);
            const text = res.response.text().trim();
            if (text) return text;
        } catch (err) {
            lastError = err;
        }
    }

    // Safety / Model fallback responses if all models trigger safety
    if (mode === 'roast') {
        const fallbacks = [
            "Ayo wtf did you just type, even my processor gave up reading that dumb shit 💀",
            "Bro wtf is wrong with you 💀 Chill out clown",
            "Lmaooo wtf are you yapping about idiot 💀"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } else if (mode === 'friendly') {
        const fallbacks = [
            "Haha bro you're wilding out today 😂 What's good?",
            "Bro went completely off the rails with that one 💀 I gotchu though 🤝",
            "Lmaooo you got no chill today my guy 😂"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    throw lastError || new Error('Failed to generate response from Gemini AI');
}

module.exports = {
    verifyApiKey,
    buildSystemPrompt,
    generateReply
};
