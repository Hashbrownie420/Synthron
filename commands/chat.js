const axios = require('axios');

module.exports = {
    name: 'ai',
    description: 'Frage die KI etwas!',
    menu: 'Stelle eine Frage an die KI',
    category: 'sonstiges',

    async execute(sock, sender, args, msg) {
        const chatId = msg.key.remoteJid;
        const question = args.join(' ');

        if (!question) {
            await sock.sendMessage(chatId, { text: '❗ Bitte stelle eine Frage. Beispiel: *?ai Was ist KI?*' });
            return;
        }

        const apiKey = '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'; // <-- Hier deinen OpenRouter API-Key einfügen
        const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

        try {
            const response = await axios.post(apiUrl, {
                model: 'mistralai/mistral-7b', // Kostenloses Modell
                messages: [{ role: 'user', content: question }]
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const aiReply = response.data.choices[0]?.message?.content || '❌ Die KI hat keine Antwort gegeben.';

            await sock.sendMessage(chatId, { text: `🤖 Antwort der KI:\n\n${aiReply}` });

        } catch (error) {
            console.error('❌ Fehler bei der KI-Anfrage:', error.response?.data || error.message);

            let errorMsg = '❌ Fehler beim Kommunizieren mit der KI.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMsg += `\nGrund: ${error.response.data.error.message}`;
            }

            await sock.sendMessage(chatId, { text: errorMsg });
        }
    }
};