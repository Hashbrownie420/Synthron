const { delay } = require('../utils');

module.exports = {
    name: 'revoke',
    description: 'Setzt den Gruppenlink zurück und sendet den neuen Link\nBenutzung: *?revoke*',
    menu: 'Setzt den Gruppenlink zurück',
    category: 'admin',
    execute: async (sock, sender, args, msg) => {
        const from = msg.key.remoteJid;

        // Sicherstellen, dass es eine Gruppe ist
        if (!from.endsWith('@g.us')) {
            await delay();
            await sock.sendMessage(from, { text: '❌ Dieser Befehl kann nur in Gruppen verwendet werden.' });
            return;
        }

        try {
            // Gruppenlink zurücksetzen
            await sock.groupRevokeInvite(from);
            const newCode = await sock.groupInviteCode(from);
            const newLink = `https://chat.whatsapp.com/${newCode}`;

            await delay();
            await sock.sendMessage(from, {
                text: `♻️ *Gruppenlink wurde zurückgesetzt!*\n🔗 Neuer Link:\n${newLink}`
            });
        } catch (err) {
            console.error('Fehler beim Zurücksetzen des Gruppenlinks: Bot ist kein Admin!');
            await delay();
            await sock.sendMessage(from, {
                text: '❌ Fehler beim Zurücksetzen des Links. Ist der Bot Admin?'
            });
        }
    }
};