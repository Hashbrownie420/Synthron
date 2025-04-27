const { delay } = require('../utils');
const fs = require('fs');
const path = require('path');

// === KONFIGURATION ===
const OWNER_NUMBERS = ['491728853747', '4915739034434'];
const DATA_PATH = path.join(__dirname, '../botTeamData.json');
const NOTES_FILE = path.join(__dirname, '../teamNotes.json');

// === Utils ===
function loadJson(file) {
    if (!fs.existsSync(file)) return { notes: [] };
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function isValidNumber(number) {
    return /^\d+$/.test(number);
}

function isOwner(number) {
    return OWNER_NUMBERS.includes(number);
}

const VALID_ROLES = ['Owner', 'Admin', 'Supporter'];

module.exports = {
    name: 'team',
    description: 'Botteam verwalten und Notizen erstellen',
    menu: 'Botteam abfragen',
    category: 'info',
    execute: async (sock, sender, args, msg) => {
        const from = msg.key.remoteJid;
        const senderNum = (msg.key.participant || sender).split('@')[0];
        const subCommand = args[0]?.toLowerCase();
        const teamData = loadJson(DATA_PATH);
        const noteData = loadJson(NOTES_FILE);

        if (!subCommand) {
            return sock.sendMessage(from, { text: '❗ *Benutze z. B.* `?team add [nummer] [rolle]`' });
        }

        // === TEAM ADD ===
        if (subCommand === 'add') {
            if (!isOwner(senderNum)) {
                return sock.sendMessage(from, { text: '🚫 *Nur ein Bot-Owner darf Teammitglieder hinzufügen!*' });
            }

            const number = args[1];
            const role = args[2];

            if (!number || !role) {
                return sock.sendMessage(from, { text: '❗ Nutzung: `?team add [Nummer] [Rolle]`' });
            }

            if (!isValidNumber(number)) {
                return sock.sendMessage(from, { text: '❌ *Ungültige Nummer!*' });
            }

            if (!VALID_ROLES.includes(role)) {
                return sock.sendMessage(from, { text: '⚠️ *Erlaubte Rollen:* Owner, Admin, Supporter.' });
            }

            teamData[number] = role;
            saveJson(DATA_PATH, teamData);

            return sock.sendMessage(from, { text: `✅ *${number}* wurde als *${role}* hinzugefügt.` });
        }

        // === TEAM REMOVE ===
        if (subCommand === 'remove') {
            if (!isOwner(senderNum)) {
                return sock.sendMessage(from, { text: '🚫 *Nur ein Bot-Owner darf Teammitglieder entfernen!*' });
            }

            const number = args[1];
            if (!number) return sock.sendMessage(from, { text: '❗ Nutzung: `?team remove [Nummer]`' });

            if (!isValidNumber(number)) {
                return sock.sendMessage(from, { text: '❌ *Ungültige Nummer!*' });
            }

            if (!teamData[number]) {
                return sock.sendMessage(from, { text: `⚠️ *${number}* ist kein Teammitglied.` });
            }

            delete teamData[number];
            saveJson(DATA_PATH, teamData);
            return sock.sendMessage(from, { text: `🗑️ *${number}* wurde entfernt.` });
        }

        // === TEAM CHECK ===
        if (subCommand === 'check') {
            const number = args[1];
            if (!number) return sock.sendMessage(from, { text: '❗ Nutzung: `?team check [Nummer]`' });

            if (!isValidNumber(number)) {
                return sock.sendMessage(from, { text: '❌ *Ungültige Nummer!*' });
            }

            const role = teamData[number];
            if (!role) {
                return sock.sendMessage(from, { text: `ℹ️ *${number}* ist kein Teammitglied.` });
            }

            return sock.sendMessage(from, { text: `👤 *${number}* ist im Team als: *${role}*` });
        }

        // === TEAM LIST ===
        if (subCommand === 'list') {
            const keys = Object.keys(teamData);
            if (keys.length === 0) return sock.sendMessage(from, { text: '📭 *Das Team ist leer.*' });

            let list = '📋 *Teamliste:*\n\n';
            for (const num of keys) {
                list += `➤ *${num}* ➝ ${teamData[num]}\n`;
            }
            return sock.sendMessage(from, { text: list });
        }

        // === TEAM NOTE ===
        if (subCommand === 'note') {
            const action = args[1]?.toLowerCase();
            const senderRole = teamData[senderNum];

            if (!senderRole && !isOwner(senderNum)) {
                return sock.sendMessage(from, { text: '🚫 *Nur Teammitglieder dürfen Team-Notizen verwenden.*' });
            }

            // === NOTE ADD ===
            if (!action || (action !== 'list' && action !== 'remove')) {
                const noteText = args.slice(1).join(' ');
                if (!noteText) return sock.sendMessage(from, { text: '📝 Nutzung: `?team note [Text]`' });

                const newId = noteData.notes.length + 1;
                noteData.notes.push({
                    id: newId,
                    text: noteText,
                    sender: senderNum
                });

                saveJson(NOTES_FILE, noteData);
                return sock.sendMessage(from, { text: `✅ Notiz #${newId} gespeichert.` });
            }

            // === NOTE LIST ===
            if (action === 'list') {
                if (noteData.notes.length === 0) {
                    return sock.sendMessage(from, { text: '📭 *Keine Team-Notizen vorhanden.*' });
                }

                let text = '🗒️ *Team-Notizen:*\n\n';
                for (const note of noteData.notes) {
                    text += `#${note.id} ➤ ${note.text} _(von ${note.sender})_\n\n`;
                }

                return sock.sendMessage(from, { text });
            }

            // === NOTE REMOVE ===
            if (action === 'remove') {
                const noteId = parseInt(args[2]);
                if (!noteId) return sock.sendMessage(from, { text: '🗑️ Nutzung: `?team note remove [id]`' });

                const index = noteData.notes.findIndex(n => n.id === noteId);
                if (index === -1) return sock.sendMessage(from, { text: '❌ *Notiz nicht gefunden.*' });

                const note = noteData.notes[index];
                if (note.sender !== senderNum && !isOwner(senderNum)) {
                    return sock.sendMessage(from, { text: '🚫 *Du darfst diese Notiz nicht löschen.*' });
                }

                noteData.notes.splice(index, 1);
                noteData.notes.forEach((n, i) => n.id = i + 1);
                saveJson(NOTES_FILE, noteData);

                return sock.sendMessage(from, { text: `🗑️ *Notiz #${noteId} wurde gelöscht. IDs wurden neu nummeriert.*` });
            }

            return;
        }

        // === UNBEKANNT ===
        return sock.sendMessage(from, { text: '❓ *Unbekannter Subbefehl.* Nutze `add`, `remove`, `check`, `list`, `note`' });
    }
};