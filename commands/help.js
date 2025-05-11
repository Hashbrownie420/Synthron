const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner ist

const fs = require('fs');
const path = require('path');
const { category } = require('./echo');

module.exports = {
    name: 'help',
    description: 'Zeigt eine Erklärung für einen bestimmten Befehl.\nBenutzung: *?help [Befehl]*',
    menu: 'Hilfe für Befehle',
    category: 'info',
    execute: async (sock, sender, args) => {
        const commandName = args[0]?.toLowerCase();
        if (!commandName) {
            await delay();
            await sock.sendMessage(sender, { text: 'Bitte gib einen Befehl an, z. B. *?help echo*' });
            return;
        }

        const commandPath = path.join(__dirname, `${commandName}.js`);

        if (!fs.existsSync(commandPath)) {
            await delay();
            await sock.sendMessage(sender, { text: `❌ Der Befehl *${commandName}* existiert nicht.` });
            return;
        }

        const command = require(commandPath);
        const helpText = command.description || 'Keine Beschreibung verfügbar.';

        await delay();
        await sock.sendMessage(sender, {
            text: `ℹ️ *Hilfe zu ?${commandName}*\n\n${helpText}`
        });
    }
};