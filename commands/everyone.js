const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner ist

module.exports = {
    name: 'everyone',
    description: 'Sendet eine Nachricht und erwähnt alle Mitglieder der Gruppe (nur für Admins!)\nBenutzung: *?everyone [Text]*',
    menu: 'Alle Gruppenmitglieder benachrichtigen (nur Admins)',
    category: 'admin',

    execute: async (sock, sender, args, msg) => {
        const text = args.join(' ');

        if (!text) {
            await delay();
            await sock.sendMessage(sender, { text: '❗ Du musst eine Nachricht eingeben!' });
            return;
        }

        if (!sender.endsWith('@g.us')) {
            await delay();
            await sock.sendMessage(sender, { text: '❗ Dieser Befehl funktioniert nur in Gruppen!' });
            return;
        }

        // === Admin-Überprüfung ===
        const groupMetadata = await sock.groupMetadata(sender);
        const senderId = msg.key.participant || msg.key.remoteJid;

        const isAdmin = groupMetadata.participants.some(participant => {
            return participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin');
        });

        if (!isAdmin) {
            await delay();
            await sock.sendMessage(sender, { text: '❌ Du musst ein Admin sein, um diesen Befehl zu benutzen!' });
            return;
        }

        // === Nachricht an alle Mitglieder senden (hidetag) ===
        const mentions = groupMetadata.participants.map(p => p.id);
        const senderName = msg.pushName || 'Jemand';

        const messageText = `Nachricht von *${senderName}*:\n\n${text}`;

        await delay();
        await sock.sendMessage(sender, {
            text: messageText,
            mentions: mentions,
            contextInfo: { mentionedJid: mentions }
        });
    }
};