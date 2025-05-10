const { delay } = require('../utils');

// Liste der ausgeschlossenen Nummern
const excludedNumbers = [
    '491782102904@s.whatsapp.net',
    '491726071134@s.whatsapp.net'
];

module.exports = {
    name: 'cast',
    description: 'Sende eine Nachricht an alle Chats (außer ausgeschlossene Nummern).',
    async execute(sock, sender, args, msg) {
        const castMessage = args.join(' ');

        if (!castMessage) {
            await sock.sendMessage(sender, { text: '❗ Bitte gib eine Nachricht an, die gesendet werden soll.' });
            return;
        }

        let chats = [];

        // Versuchen, alle Chats zu holen
        if (sock.store && sock.store.chats) {
            chats = Object.keys(sock.store.chats);
        } else if (sock.chats) {
            chats = Object.keys(sock.chats);
        }

        if (!chats.length) {
            await sock.sendMessage(sender, { text: '❗ Keine Chats gefunden. Bitte stelle sicher, dass dein Bot Chats geladen hat!' });
            return;
        }

        let successCount = 0;
        let failedCount = 0;

        for (const chatId of chats) {
            if (excludedNumbers.includes(chatId)) continue;

            try {
                await sock.sendMessage(chatId, { text: castMessage });
                successCount++;
                await delay(2000); // 2 Sekunden Pause pro Chat
            } catch (error) {
                console.error(`Fehler beim Senden an ${chatId}:`, error);
                failedCount++;
            }
        }

        await sock.sendMessage(sender, {
            text: `✅ Erfolgreich an ${successCount} Chats gesendet.\n❌ Fehler bei ${failedCount} Chats.`
        });
    }
};