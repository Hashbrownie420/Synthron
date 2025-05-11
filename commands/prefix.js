const fs = require('fs');
const path = require('path');
const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner ist

// Pfad zur JSON-Datei, die die Präfixe speichert
const prefixFile = path.join(__dirname, '../prefix.json');

module.exports = {
    name: 'prefix',
    description: 'Setze einen individuellen Präfix für die Gruppe.\nBenutzung: *?setprefix set [Präfix]* oder *?setprefix check*',
    menu: 'Ändere den Gruppen-Präfix',
    category: 'admin',

    async execute(sock, sender, args, msg) {
        const groupId = msg.key.remoteJid;

        // Lade Gruppeninformationen
        const groupMetadata = await sock.groupMetadata(groupId);
        const senderId = msg.key.participant || msg.key.remoteJid;

        // Admin-Check (sicherer Vergleich der WhatsApp-IDs)
        const isAdmin = groupMetadata.participants.some(participant => {
            return participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin');
        });

        if (!isAdmin) {
            await delay();
            await sock.sendMessage(groupId, { text: '❌ Du musst ein Admin sein, um den Präfix zu ändern!' });
            return;
        }

        // Lade Präfixdaten oder initialisiere sie
        const prefixData = loadPrefixData();

        const subCommand = args[0];

        if (subCommand === 'set') {
            const newPrefix = args[1];
            if (!newPrefix) {
                await delay();
                await sock.sendMessage(groupId, { text: '❗ Bitte gib einen neuen Präfix an. Beispiel: *?prefix set !*' });
                return;
            }

            prefixData[groupId] = newPrefix;
            savePrefixData(prefixData);

            await delay();
            await sock.sendMessage(groupId, { text: `✅ Der Präfix für diese Gruppe wurde auf *${newPrefix}* gesetzt.` });
        } else if (subCommand === 'check') {
            const groupPrefix = prefixData[groupId] || 'Kein Präfix gesetzt.*\n*Es wird das Standard Präfix (?) genutzt.';
            await delay();
            await sock.sendMessage(groupId, { text: `📋 Der aktuelle Präfix für diese Gruppe ist: *${groupPrefix}*` });
        } else {
            await delay();
            await sock.sendMessage(groupId, {
                text: '❗ Unbekannter Befehl. Benutze *?prefix set [Präfix]* oder *?prefix check*.'
            });
        }
    }
};

// Hilfsfunktion zum Laden der Präfix-Daten
function loadPrefixData() {
    if (!fs.existsSync(prefixFile)) return {};
    return JSON.parse(fs.readFileSync(prefixFile, 'utf-8'));
}

// Hilfsfunktion zum Speichern der Präfix-Daten
function savePrefixData(data) {
    fs.writeFileSync(prefixFile, JSON.stringify(data, null, 2));
}