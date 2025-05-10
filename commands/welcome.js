const fs = require('fs');
const path = require('path');
const { delay } = require('../utils'); // falls du delay nutzen willst (optional)

const welcomeFile = path.join(__dirname, '../welcome.json');

function loadWelcomeData() {
    if (!fs.existsSync(welcomeFile)) return {};
    return JSON.parse(fs.readFileSync(welcomeFile, 'utf-8'));
}

function saveWelcomeData(data) {
    fs.writeFileSync(welcomeFile, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'welcome',
    description: 'Verwalte Willkommensnachrichten\n\nBenutzung:\n*?welcome enable/disable* - Aktiviert/Deaktiviert die Willkommensnachricht\n*?welcome set/check* - Setzt und zeigt die Willkommensnachricht\n*?welcome reset* - Setzt die Willkommensnachricht zurück',
    menu: 'Verwalte Willkommensnachrichten',
    category: 'admin',
    async execute(sock, sender, args, msg) {
        const chatId = msg.key.remoteJid;

        // Admin-Check
        const groupMetadata = await sock.groupMetadata(chatId);
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isAdmin = groupMetadata.participants.some(participant => {
            return participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin');
        });

        const welcomeData = loadWelcomeData();

        if (args.length === 0) {
            await sock.sendMessage(chatId, { text: '❗ Bitte verwende:\n- welcome enable\n- welcome disable\n- welcome set [Text]\n- welcome check\n- welcome reset' });
            return;
        }

        const subCommand = args[0].toLowerCase();

        // Nur Admins dürfen Änderungen machen
        if (['enable', 'disable', 'set', 'reset'].includes(subCommand) && !isAdmin) {
            await delay(1000);
            await sock.sendMessage(chatId, { text: '❌ Du musst ein Admin sein, um das Willkommen-System zu konfigurieren!' });
            return;
        }

        if (subCommand === 'enable') {
            welcomeData[chatId] = welcomeData[chatId] || {};
            welcomeData[chatId].enabled = true;
            saveWelcomeData(welcomeData);
            await sock.sendMessage(chatId, { text: '✅ Willkommen-System wurde *aktiviert*.' });
        }

        else if (subCommand === 'disable') {
            welcomeData[chatId] = welcomeData[chatId] || {};
            welcomeData[chatId].enabled = false;
            saveWelcomeData(welcomeData);
            await sock.sendMessage(chatId, { text: '✅ Willkommen-System wurde *deaktiviert*.' });
        }

        else if (subCommand === 'set') {
            const welcomeText = args.slice(1).join(' ');
            if (!welcomeText) {
                await sock.sendMessage(chatId, { text: '❗ Bitte gib den Text an: welcome set [Text]' });
                return;
            }
            welcomeData[chatId] = welcomeData[chatId] || {};
            welcomeData[chatId].text = welcomeText;
            saveWelcomeData(welcomeData);
            await sock.sendMessage(chatId, { text: '✅ Willkommenstext wurde *gespeichert*! Er lautet:\n\n' + welcomeText });
        }

        else if (subCommand === 'reset') {
            if (welcomeData[chatId]) {
                delete welcomeData[chatId].text;
                saveWelcomeData(welcomeData);
                await sock.sendMessage(chatId, { text: '✅ Willkommenstext wurde *zurückgesetzt*. Es wird jetzt die Gruppenbeschreibung verwendet.' });
            } else {
                await sock.sendMessage(chatId, { text: 'ℹ️ Es war kein individueller Willkommenstext gesetzt.' });
            }
        }

        else if (subCommand === 'check') {
            const groupWelcome = welcomeData[chatId];
            if (groupWelcome && groupWelcome.text) {
                await sock.sendMessage(chatId, { text: `📢 Aktuelle Willkommensnachricht:\n\n${groupWelcome.text}` });
            } else {
                // Falls kein Text gesetzt: Gruppenbeschreibung laden
                const groupDesc = groupMetadata.desc || 'Keine Gruppenbeschreibung vorhanden.';
                await sock.sendMessage(chatId, { text: `ℹ️ Es wurde kein individueller Willkommenstext gesetzt.\n\n📋 Gruppenbeschreibung:\n${groupDesc}` });
            }
        }

        else {
            await sock.sendMessage(chatId, { text: '❗ Unbekannter Befehl. Benutze:\n- welcome enable\n- welcome disable\n- welcome set [Text]\n- welcome check\n- welcome reset' });
        }
    }
};