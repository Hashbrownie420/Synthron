const { delay } = require('../utils'); // oder './utils', falls utils.js im selben Ordner ist

module.exports = {
    name: 'admin',
    async execute(sock, sender, args, msg) {
        const chatId = msg.key.remoteJid;
        const senderId = msg.key.participant || msg.key.remoteJid;

        // Lade Gruppeninformationen
        const groupMetadata = await sock.groupMetadata(chatId);

        // Debugging: Ausgabe der Bot-ID und aller Teilnehmer-IDs
        console.log('Bot JID:', sock.user.id);
        console.log('Teilnehmer-IDs:', groupMetadata.participants.map(p => p.id));

        // Admin-Check für den Sender (sicherer Vergleich der WhatsApp-IDs)
        const isSenderAdmin = groupMetadata.participants.some(participant => {
            return participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin');
        });

        if (!isSenderAdmin) {
            await delay(1000);
            await sock.sendMessage(chatId, { text: '❌ Du musst ein Admin sein, um diesen Befehl auszuführen!' });
            return;
        }

        // Admin-Check für den Bot (sicherer Vergleich der WhatsApp-IDs)
        const isBotAdmin = groupMetadata.participants.some(participant => {
            return participant.id === sock.user.id && (participant.admin === 'admin' || participant.admin === 'superadmin');
        });

        // Debugging: Ausgabe, ob der Bot Admin ist
        console.log('Is Bot Admin:', isBotAdmin);

        if (!isBotAdmin) {
            await delay(1000);
            await sock.sendMessage(chatId, { text: '❌ Der Bot muss ein Admin sein, um diesen Befehl auszuführen!' });
            return;
        }

        // Verarbeite den Befehl
        if (args.length < 2) {
            await delay(1000);
            await sock.sendMessage(chatId, { text: '❗ Bitte verwende den Befehl korrekt:\n- ?admin give @person\n- ?admin remove @person' });
            return;
        }

        const action = args[0].toLowerCase(); // 'give' oder 'remove'
        const mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]; // Die JID der erwähnten Person

        if (!mentionedJid) {
            await delay(1000);
            await sock.sendMessage(chatId, { text: '❗ Bitte erwähne die Person, der du Admin-Rechte geben oder nehmen möchtest.' });
            return;
        }

        try {
            if (action === 'give') {
                await sock.groupAddAdmin(chatId, [mentionedJid]);
                await sock.sendMessage(chatId, { text: `✅ *${mentionedJid}* wurde nun Admin der Gruppe!` });
            } else if (action === 'remove') {
                await sock.groupRemoveAdmin(chatId, [mentionedJid]);
                await sock.sendMessage(chatId, { text: `✅ *${mentionedJid}* hat nun keine Admin-Rechte mehr.` });
            } else {
                await delay(1000);
                await sock.sendMessage(chatId, { text: '❗ Unbekannter Befehl. Benutze:\n- ?admin give @person\n- ?admin remove @person' });
            }
        } catch (error) {
            await delay(1000);
            await sock.sendMessage(chatId, { text: '❌ Es gab einen Fehler beim Vergeben oder Entfernen der Admin-Rechte.' });
        }
    }
};