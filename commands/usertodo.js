const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner ist
const fs = require('fs');
const path = require('path');

const USER_TODO_PATH = path.join(__dirname, '../userTodoList.json');
const TEAM_DATA_PATH = path.join(__dirname, '../botTeamData.json');

// Hilfsfunktionen
function loadUserTodos() {
    if (!fs.existsSync(USER_TODO_PATH)) return [];
    return JSON.parse(fs.readFileSync(USER_TODO_PATH, 'utf8'));
}

function saveUserTodos(todos) {
    fs.writeFileSync(USER_TODO_PATH, JSON.stringify(todos, null, 2));
}

function loadTeamData() {
    if (!fs.existsSync(TEAM_DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(TEAM_DATA_PATH, 'utf8'));
}

function isOwner(number, teamData) {
    return teamData[number] === 'Owner';
}

module.exports = {
    name: 'usertodo',
    description: 'ToDo-System für alle User – Nur der Owner kann anzeigen und löschen.',
    menu: 'ToDo-System für User',
    category: 'utility',
    execute: async (sock, sender, args, msg) => {
        const from = msg.key.remoteJid;
        const senderNum = (msg.key.participant || sender).split('@')[0];

        const teamData = loadTeamData();
        const todos = loadUserTodos();

        const subCommand = args[0];

        // === OWNER CHECK ===
        const isOwnerUser = isOwner(senderNum, teamData);

        // === ADD ===
        if (subCommand === 'add') {
            const text = args.slice(1).join(' ');
            if (!text) {
                await delay(1000);
                await sock.sendMessage(from, { text: '❗ Bitte gib einen ToDo-Text ein: *?usertodo add [Text]*' });
                return;
            }

            todos.push({ user: senderNum, text });
            saveUserTodos(todos);
            await delay(1000);
            await sock.sendMessage(from, { text: `✅ *ToDo hinzugefügt:* ${text}` });
        }

        // === LIST (nur für Owner) ===
        else if (subCommand === 'list') {
            if (!isOwnerUser) {
                await delay(1000);
                await sock.sendMessage(from, { text: '❌ Nur der Owner kann die ToDo-Liste anzeigen!' });
                return;
            }

            if (todos.length === 0) {
                await delay(1000);
                await sock.sendMessage(from, { text: '📭 *Die ToDo-Liste ist aktuell leer.*' });
                return;
            }

            let list = '📝 *Aktuelle ToDo-Liste:*\n━━━━━━━━━━━━━━━━━━\n';
            todos.forEach((todo, i) => {
                list += `*${i + 1}.* ${todo.text} (von ${todo.user})\n\n`;
            });
            list += '━━━━━━━━━━━━━━━━━━\nℹ️ Nutze *?usertodo remove [Nummer]* zum Entfernen.';

            await delay(1000);
            await sock.sendMessage(from, { text: list });
        }

        // === REMOVE (nur für Owner) ===
        else if (subCommand === 'remove') {
            if (!isOwnerUser) {
                await delay(1000);
                await sock.sendMessage(from, { text: '❌ Nur der Owner kann Einträge entfernen!' });
                return;
            }

            const id = parseInt(args[1]);
            if (isNaN(id) || id < 1 || id > todos.length) {
                await delay(1000);
                await sock.sendMessage(from, { text: '❌ Ungültige Nummer! Nutze z. B. *?usertodo remove 2*' });
                return;
            }

            const removed = todos.splice(id - 1, 1);
            saveUserTodos(todos);
            await delay(1000);
            await sock.sendMessage(from, { text: `❌ *Entfernt:* ${removed[0].text}` });
        }

        // === UNBEKANNT ===
        else {
            await delay(1000);
            await sock.sendMessage(from, {
                text: '❓ Unbekannter Subbefehl. Gültige Optionen:\n*add*, *list*, *remove*'
            });
        }
    }
};