const { delay } = require('../utils');

module.exports = {
    name: 'uptime',
    description: 'Zeigt, wie lange der Bot/Server seit dem letzten Neustart läuft.\nBenutzung: *?uptime*',
    menu: 'Zeigt die Laufzeit des Bots',
    category: 'info',
    execute: async (sock, sender, args, msg) => {
        const from = msg.key.remoteJid;

        const uptimeMs = Date.now() - global.botStartTime;

        const seconds = Math.floor((uptimeMs / 1000) % 60);
        const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
        const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
        const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

        const startDate = new Date(global.botStartTime);
        const startTimeFormatted = startDate.toLocaleString('de-DE', {
            timeZone: 'Europe/Berlin',
            hour12: false
        });

        const message = 
`⏱ *Bot Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
🕒 *Gestartet am:* ${startTimeFormatted}`;

        await delay(1000);
        await sock.sendMessage(from, { text: message });
    }
};