const fs = require('fs');
const path = require('path');

const notesFile = path.join(__dirname, '../notes.json'); // Pfad zur JSON-Datei

// Hilfsfunktionen zum Laden und Speichern der Notizen
function loadNotes() {
    if (!fs.existsSync(notesFile)) return {}; // Wenn die Datei nicht existiert, gib ein leeres Objekt zurück
    return JSON.parse(fs.readFileSync(notesFile, 'utf-8'));
}

function saveNotes(data) {
    fs.writeFileSync(notesFile, JSON.stringify(data, null, 2)); // Speichern der Daten
}

module.exports = {
    name: 'note',
    description: 'Erstelle, liste, lösche oder entferne Notizen\n\nBenutzung:\n *?note [Text]* zum Hinzufügen von Notizen\n*?note list* zum Anzeigen der Notizen\n*?note remove [ID]* zum Löschen von Notizen',
    menu: 'Erstelle Notizen',
    category: 'utility',
    execute: async (sock, sender, args, msg) => {
        const senderNum = msg.key.participant ? msg.key.participant.split('@')[0] : sender.split('@')[0]; // Nummer des Absenders

        // Lade Notizen
        const notesData = loadNotes();

        if (args[0] === 'list') {
            // Listet alle Notizen des Nutzers auf
            const userNotes = notesData[senderNum]?.notes || [];

            if (userNotes.length === 0) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Du hast noch keine Notizen.' });
                return;
            }

            let notesList = '📋 *Deine Notizen*:\n';
            userNotes.forEach((note) => {
                notesList += `\n${note.id}. ${note.text}`; // Zeige jede Notiz an
            });

            await sock.sendMessage(msg.key.remoteJid, { text: notesList });
        } else if (args[0] === 'remove') {
            // Entfernt eine Notiz anhand der ID
            const noteId = parseInt(args[1], 10);

            if (isNaN(noteId)) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❗ Ungültige Notiz-ID. Bitte gib eine gültige Zahl ein.' });
                return;
            }

            const userNotes = notesData[senderNum]?.notes || [];
            const noteIndex = userNotes.findIndex(note => note.id === noteId);

            if (noteIndex === -1) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Keine Notiz mit dieser ID gefunden.' });
                return;
            }

            // Entferne die Notiz
            userNotes.splice(noteIndex, 1);

            // Neu nummerieren der IDs ohne Lücken
            userNotes.forEach((note, index) => {
                note.id = index + 1; // Setze die ID der Notiz auf den neuen Index + 1
            });

            // Setze den counter zurück auf die neue Anzahl
            notesData[senderNum].counter = userNotes.length;

            // Speichern der geänderten Notizen
            saveNotes(notesData);

            await sock.sendMessage(msg.key.remoteJid, { text: `✅ Deine Notiz mit ID ${noteId} wurde gelöscht.` });
        } else if (args[0] && args[0] !== 'list' && args[0] !== 'remove') {
            // Erstelle eine Notiz, wenn keine anderen Befehle ausgeführt werden
            const noteText = args.join(' ');
            if (!noteText) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❗ Benutzung: ?note <deine Notiz>' });
                return;
            }

            if (!notesData[senderNum]) {
                notesData[senderNum] = { counter: 0, notes: [] };
            }

            const newNote = {
                id: ++notesData[senderNum].counter,
                text: noteText,
            };
            notesData[senderNum].notes.push(newNote);
            saveNotes(notesData);

            await sock.sendMessage(msg.key.remoteJid, { text: `✅ Deine Notiz wurde hinzugefügt: "${noteText}"` });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: '❗ Benutzung: ?note list, ?note remove <id> oder ?note <deine Notiz>' });
        }
    }
};