const fs = require('fs');
const path = require('path');
const { delay } = require('../utils'); // falls du delay nutzen willst (optional)

const leaveFile = path.join(__dirname, '../leave.json');

function loadLeaveData() {
    if (!fs.existsSync(leaveFile)) return {};
    return JSON.parse(fs.readFileSync(leaveFile, 'utf-8'));
}

function saveLeaveData(data) {
    fs.writeFileSync(leaveFile, JSON.stringify(data, null, 2));
}

// Admin-Überprüfungsfunktion (kann in anderen Dateien wiederverwendet werden)
async function isAdmin(sock, groupId, userId) {
    const groupMetadata = await sock.groupMetadata(groupId);
    return groupMetadata.participants.some(participant => {
        return participant.id === userId && (participant.admin === 'admin' || participant.admin === 'superadmin');
    });
}

module.exports = {
    name: 'leavemsg',
    description: 'Verwalte Leavenachrichten\n\nBenutzung:\n*?leavemsg enable/disable* - Aktiviert/Deaktiviert die leavenachricht\n*?leavemsg set/check* - Setzt und zeigt die leavenachricht\n*?leavemsg reset* - Setzt die leavenachricht zurück',
    menu: 'Verwalte leavenachrichten',
    category: 'admin', 
    async execute(sock, sender, args, msg) {
        const chatId = msg.key.remoteJid;

        // Admin-Check
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isUserAdmin = await isAdmin(sock, chatId, senderId);

        const leaveData = loadLeaveData();

        if (args.length === 0) {
            await sock.sendMessage(chatId, { text: '❗ Bitte verwende:\n- leavemsg enable\n- leavemsg disable\n- leavemsg set [Text]\n- leavemsg check\n- leavemsg reset' });
            return;
        }

        const subCommand = args[0].toLowerCase();

        // Nur Admins dürfen Änderungen machen
        if (['enable', 'disable', 'set', 'reset'].includes(subCommand) && !isUserAdmin) {
            await delay(1000);
            await sock.sendMessage(chatId, { text: '❌ Du musst ein Admin sein, um das Leave-System zu konfigurieren!' });
            return;
        }

        if (subCommand === 'enable') {
            leaveData[chatId] = leaveData[chatId] || {};
            leaveData[chatId].enabled = true;
            saveLeaveData(leaveData);
            await sock.sendMessage(chatId, { text: '✅ Leave-System wurde *aktiviert*.' });
        }

        else if (subCommand === 'disable') {
            leaveData[chatId] = leaveData[chatId] || {};
            leaveData[chatId].enabled = false;
            saveLeaveData(leaveData);
            await sock.sendMessage(chatId, { text: '✅ Leave-System wurde *deaktiviert*.' });
        }

        else if (subCommand === 'set') {
            const leaveText = args.slice(1).join(' ');
            if (!leaveText) {
                await sock.sendMessage(chatId, { text: '❗ Bitte gib den Text an: leavemsg set [Text]' });
                return;
            }
            leaveData[chatId] = leaveData[chatId] || {};
            leaveData[chatId].text = leaveText;
            saveLeaveData(leaveData);
            await sock.sendMessage(chatId, { text: '✅ Leave-Text wurde *gespeichert*! Er lautet:\n\n' + leaveText });
        }

        else if (subCommand === 'reset') {
            if (leaveData[chatId]) {
                delete leaveData[chatId].text;
                saveLeaveData(leaveData);
                await sock.sendMessage(chatId, { text: '✅ Leave-Text wurde *zurückgesetzt*. Es wird jetzt die Gruppenbeschreibung verwendet.' });
            } else {
                await sock.sendMessage(chatId, { text: 'ℹ️ Es war kein individueller Leave-Text gesetzt.' });
            }
        }

        else if (subCommand === 'check') {
            const groupLeave = leaveData[chatId];
            if (groupLeave && groupLeave.text) {
                await sock.sendMessage(chatId, { text: `📢 Aktuelle Leave-Nachricht:\n\n${groupLeave.text}` });
            } else {
                const groupDesc = (await sock.groupMetadata(chatId)).desc || 'Keine Gruppenbeschreibung vorhanden.';
                await sock.sendMessage(chatId, { text: `ℹ️ Es wurde kein individueller Leave-Text gesetzt.\n\n📋 Gruppenbeschreibung:\n${groupDesc}` });
            }
        }

        else {
            await sock.sendMessage(chatId, { text: '❗ Unbekannter Befehl. Benutze:\n- leavemsg enable\n- leavemsg disable\n- leavemsg set [Text]\n- leavemsg check\n- leavemsg reset' });
        }
    }
};