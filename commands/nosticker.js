const fs = require('fs');
const path = require('path');
const { menu } = require('./join');
const { delay } = require("../utils");

// Pfad zur Datei, in der der Status des Befehls gespeichert wird
const statusFilePath = path.join(__dirname, 'nosticker_status.json');

// Funktion, um den Status aus der Datei zu laden
function loadStatus() {
    if (!fs.existsSync(statusFilePath)) {
        return { enabled: false }; // Standardwert
    }
    return JSON.parse(fs.readFileSync(statusFilePath, 'utf-8'));
}

// Funktion, um den Status in der Datei zu speichern
function saveStatus(status) {
    fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 2));
}

module.exports = {
    name: 'nosticker',
    description: 'Verhindert das Senden von Stickern, wenn aktiviert.\nBenutzung: *?nosticker enable/disable*',
    menu: 'Sticker verbieten/erlauben',
    category: 'admin',
    execute: async (sock, sender, args, msg) => {
        const groupId = msg.key.remoteJid;
        const status = loadStatus();

        // Lade Gruppeninformationen
        const groupMetadata = await sock.groupMetadata(groupId);
        const senderId = msg.key.participant || msg.key.remoteJid;

        // Admin-Check (sicherer Vergleich der WhatsApp-IDs)
        const isAdmin = groupMetadata.participants.some(participant => {
            return participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin');
        });

        if (!isAdmin) {
			await delay();
            await sock.sendMessage(groupId, { text: '❌ Du musst ein Admin sein, um den Befehl auszuführen!' });
            return;
        }

        if (args[0] === 'enable') {
            if (status.enabled) {
				await delay();
                await sock.sendMessage(groupId, { text: '✅ Sticker sind bereits deaktiviert.' });
                return;
            }

            status.enabled = true;
            saveStatus(status);
			await delay();
            await sock.sendMessage(groupId, { text: '✅ Sticker wurden deaktiviert.' });

        } else if (args[0] === 'disable') {
            if (!status.enabled) {
				await delay();
                await sock.sendMessage(groupId, { text: '✅ Sticker sind bereits aktiviert.' });
                return;
            }

            status.enabled = false;
            saveStatus(status);
			await delay();
            await sock.sendMessage(groupId, { text: '✅ Sticker wurden aktiviert.' });

        } else {
			await delay();
            await sock.sendMessage(groupId, { text: '❌ Ungültige Option. Benutze *enable* oder *disable*.' });
        }
    },

    // Verhindern des Sendens von Stickern, wenn der Status aktiviert ist
    onMessage: async (sock, msg) => {
        const status = loadStatus();
        const groupId = msg.key.remoteJid;

        if (status.enabled && msg.message?.stickerMessage) {
            
            // Löschen des Stickers
			await delay();
            await sock.sendMessage(groupId, { delete: msg.key });
        }
    }
};