const { delay } = require('../utils');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    description: 'Zeigt eine Liste aller verfügbaren Befehle.\nBenutzung: *?menu*',
    menu: 'Zeigt alle Befehle',
    category: 'info',
    execute: async (sock, sender) => {
        const commandFiles = fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js'));

        const categories = {
            info: { title: 'Info & System', emoji: '📌', symbol: '➤', commands: [] },
            admin: { title: 'Admin & Moderation', emoji: '🛠️', symbol: '⛓', commands: [] },
            fun: { title: 'Spaß & Games', emoji: '🎮', symbol: '🎲', commands: [] },
            utility: { title: 'Tools & Sonstiges', emoji: '🧩', symbol: '🔧', commands: [] },
            team: { title: 'Team & Verwaltung', emoji: '⚙️', symbol: '📂', commands: [] },
        };

        for (const file of commandFiles) {
            const command = require(`./${file}`);
            if (command.name && command.menu) {
                const category = command.category || 'utility';
                if (categories[category]) {
                    categories[category].commands.push(command);
                }
            }
        }

        let menuText = '🌀 *Synthron Command Center* 🌀\n';
        menuText += '━━━━━━━━━━━━━━━\n\n';

        for (const key of Object.keys(categories)) {
            const cat = categories[key];
            if (cat.commands.length > 0) {
                menuText += `${cat.emoji} *${cat.title}*\n`;
                menuText += '━━━━━━━━━━━━━━━\n';
                cat.commands.sort((a, b) => a.name.localeCompare(b.name));
                for (const cmd of cat.commands) {
                    menuText += `${cat.symbol} *?${cmd.name}* – ${cmd.menu}\n`;
                }
                menuText += '\n';
            }
        }

        menuText += 'ℹ️ Schreibe *?help [Befehl]* für Details zu einem Befehl.';

        await delay(1000);
        await sock.sendMessage(sender, { text: menuText });
    }
};