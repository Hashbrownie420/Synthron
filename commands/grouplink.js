const { delay } = require('../utils');
const { category } = require('./echo');

module.exports = {
    name: 'grouplink',
    description: 'Sendet den Einladungslink der aktuellen Gruppe\nBenutzung: *?grouplink*',
    menu: 'Sendet den Einladungslink',
    category: 'admin',
    execute: async (sock, sender, args, msg) => {
        const from = msg.key.remoteJid;

        // Prüfen, ob es sich um eine Gruppe handelt
        if (!from.endsWith('@g.us')) {
            await delay();
            await sock.sendMessage(from, { text: '❌ Dieser Befehl funktioniert nur in Gruppen.' });
            return;
        }

        try {
            const groupCode = await sock.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${groupCode}`;

            await delay();
            await sock.sendMessage(from, {
                text: `🔗 *Einladungslink der Gruppe:*\n${inviteLink}`
            });
        } catch (err) {
            console.error('Fehler beim Abrufen des Gruppenlinks:', err);
            await delay();
            await sock.sendMessage(from, {
                text: '❌ Fehler beim Abrufen des Gruppenlinks. Ist der Bot Admin?'
            });
        }
    }
};