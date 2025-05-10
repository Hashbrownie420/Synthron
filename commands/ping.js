const { delay } = require("../utils");

module.exports = {
    name: 'ping',
    description: 'Zeigt die Antwortzeit des Bots an\nBenutzung: *?ping*',
    menu: 'Zeigt die Reaktionszeit',
    category: 'info',
    execute: async (sock, sender, args, msg) => {
        const start = Date.now(); // Startzeitpunkt
        const sentMsg = await sock.sendMessage(sender, { text: '🏓 Pong!' });

        const end = Date.now(); // Endzeitpunkt nach dem Senden

        const responseTime = end - start;

        // Antwort mit Reaktionszeit aktualisieren
        await delay(1000);
        await sock.sendMessage(sender, {
            text: `Antwortzeit: *${responseTime}ms*`
        }, { quoted: sentMsg });
    }
};