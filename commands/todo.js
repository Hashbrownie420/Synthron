const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner ist

const fs = require('fs');
const path = require('path');

const TEAM_DATA_PATH = path.join(__dirname, '../botTeamData.json');
const TODO_PATH = path.join(__dirname, '../todoList.json');

// Hilfsfunktionen
function loadTeamData() {
    if (!fs.existsSync(TEAM_DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(TEAM_DATA_PATH, 'utf8'));
}

function loadTodos() {
    if (!fs.existsSync(TODO_PATH)) return [];
    return JSON.parse(fs.readFileSync(TODO_PATH, 'utf8'));
}

function saveTodos(todos) {
    fs.writeFileSync(TODO_PATH, JSON.stringify(todos, null, 2));
}

function isOwner(number, teamData) {
    return teamData[number] === 'Owner';
}

module.exports = {
    name: 'todo',
    description: 'ToDo-System für Owner - Der normale User kann nichts mit diesem Befehl machen',
    menu: 'ToDo-System',
    category: 'team',
    execute: async (sock, sender, args, msg) => {
        const from = msg.key.remoteJid;
        const senderNum = (msg.key.participant || sender).split('@')[0];

        const teamData = loadTeamData();
        if (!isOwner(senderNum, teamData)) {
            await delay();
            await sock.sendMessage(from, { text: '❌ Nur Teammitglieder mit der Rolle *Owner* dürfen das ToDo-System nutzen!' });
            return;
        }

        const subCommand = args[0];

        if (!subCommand) {
            await delay();
            await sock.sendMessage(from, {
                text: 'ℹ️ *ToDo-Befehle:*\n' +
                      '➕ *?todo add [Text]* – Neuen Eintrag hinzufügen\n' +
                      '📋 *?todo list* – Aktuelle Liste anzeigen\n' +
                      '❌ *?todo remove [Nummer]* – Eintrag entfernen'
            });
            return;
        }

        const todos = loadTodos();

        // === ADD ===
        if (subCommand === 'add') {
            const text = args.slice(1).join(' ');
            if (!text) {
                await delay();
                await sock.sendMessage(from, { text: '❗ Bitte gib einen ToDo-Text ein: *?todo add [Text]*' });
                return;
            }

            todos.push(text);
            saveTodos(todos);
            await delay();
            await sock.sendMessage(from, { text: `✅ *ToDo hinzugefügt:* ${text}` });
        }

        // === LIST ===
        else if (subCommand === 'list') {
            if (todos.length === 0) {
                await delay();
                await sock.sendMessage(from, { text: '📭 *Die ToDo-Liste ist aktuell leer.*' });
                return;
            }

            let list = '📝 *Aktuelle ToDo-Liste:*\n━━━━━━━━━━━━━━━━━━\n';
            todos.forEach((text, i) => {
                list += `*${i + 1}.* ${text}\n\n`;
            });
            list += '━━━━━━━━━━━━━━━━━━\nℹ️ Nutze *?todo remove [Nummer]* zum Entfernen.';

            await delay();
            await sock.sendMessage(from, { text: list });
        }

        // === REMOVE ===
        else if (subCommand === 'remove') {
            const id = parseInt(args[1]);
            if (isNaN(id) || id < 1 || id > todos.length) {
                await delay();
                await sock.sendMessage(from, { text: '❌ Ungültige Nummer! Nutze z. B. *?todo remove 2*' });
                return;
            }

            const removed = todos.splice(id - 1, 1);
            saveTodos(todos);
            await delay();
            await sock.sendMessage(from, { text: `❌ *Entfernt:* ${removed[0]}` });
        }

        // === UNBEKANNT ===
        else {
            await delay();
            await sock.sendMessage(from, {
                text: '❓ Unbekannter Subbefehl. Gültige Optionen:\n*add*, *list*, *remove*'
            });
        }
    }
};