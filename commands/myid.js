const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner ist
const { category } = require('./echo');

module.exports = {
    name: 'myid',
    description: 'Zeigt die Gruppen-ID oder Chat-ID an.\nBenutzung: *?myid*',
    menu: 'Zeigt die Gruppen-ID oder Chat-ID an',
    category: 'team',
    execute: async (sock, sender, args, msg) => {
        const isGroup = sender.endsWith('@g.us');
        const idType = isGroup ? 'Gruppen-ID' : 'Chat-ID';

        await delay();
        await sock.sendMessage(sender, {
            text: `🆔 *${idType}:*\n\`${sender}\`\n\nDu kannst diese ID z.B. für Log-Nachrichten nutzen.`
        });
    }
};