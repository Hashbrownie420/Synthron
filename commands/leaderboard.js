const fs = require('fs');
const path = require('path');
const { delay } = require('../utils'); // delay aus utils.js importieren
const statsFile = path.join(__dirname, '../fightStats.json');

// Kampfstatistiken laden
function loadStats() {
    if (!fs.existsSync(statsFile)) return {};
    return JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
}

// Gibt das Emoji für die Platzierung zurück
function getMedalEmoji(index) {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] || '🔹';
}

module.exports = {
    name: 'leaderboard',
    description: 'Zeigt die Top 10 Spieler basierend auf ihren Punkten\nBenutzung: *?leaderboard*',
    menu: 'Zeigt die Top 10 Spieler',
    category: 'fun',
    execute: async (sock, sender, args, msg) => {
        const stats = loadStats();

        const players = Object.entries(stats)
            .map(([id, data]) => ({ id, ...data }))
            .filter(p => p.fights > 0)
            .sort((a, b) => b.points - a.points)
            .slice(0, 10);

        if (players.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: 'ℹ️ Noch keine Spieler auf dem Leaderboard!'
            });
            return;
        }

        // Leaderboard Text formatieren
        let text = `🏆 *Top 10 Spieler – Leaderboard (Punkte)* 🏆\n\n`;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const mentionTag = `@${player.id.split('@')[0]}`;
            const medal = getMedalEmoji(i);

            text += `${medal} ${i + 1}. ${mentionTag}\n   🏅 ${player.points} Punkte | ${player.wins} Siege | ${player.fights} Kämpfe\n\n`;
        }

        await delay(1000);
        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: players.map(p => p.id)
        });
    }
};