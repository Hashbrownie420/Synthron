const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner ist
const { category } = require('./echo');

module.exports = {
    name: 'love',
    description: 'Berechnet, wie gut du mit einer markierten Person zusammenpasst.\nBenutzung: *?love @person*',
    menu: 'Berechnet die Love-Chance',
    category: 'fun',
    execute: async (sock, sender, args, msg) => {
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

        if (!mentions || mentions.length === 0) {
            await delay(1000);
            await sock.sendMessage(sender, { text: 'Bitte markiere eine Person für den LoveCheck!' });
            return;
        }

        const partnerJid = mentions[0];
        const percentage = Math.floor(Math.random() * 100) + 1;
        const partnerNum = partnerJid.split('@')[0];

        const message = `❤️ *LoveCheck* ❤️\n\n` +
                        `Du + @${partnerNum} = *${percentage}%*\n\n` +
                        (percentage >= 90 ? 'Perfektes Match! Seelenverwandte! 💘' :
                        percentage >= 70 ? 'Sehr gute Chancen für eine Beziehung! 💞' :
                        percentage >= 40 ? 'Vielleicht ein gutes Team, aber braucht Arbeit! ✨' :
                        'Uff... lieber Freunde bleiben. ❄️');

        await delay(1000);
        await sock.sendMessage(sender, {
            text: message,
            mentions: [partnerJid]
        });
    }
};