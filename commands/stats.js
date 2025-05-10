const fs = require('fs');
const path = require('path');
const { delay } = require('../utils'); // delay aus utils.js importieren
const teamData = require('../botTeamData.json');

const statsFile = path.join(__dirname, '../fightStats.json');

// Kampfstatistiken laden & speichern
function loadStats() {
    if (!fs.existsSync(statsFile)) return {};
    return JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
}

function saveStats(data) {
    fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));
}

function getStatsText(mentionTag, wins = 0, fights = 0, points = 0, rank = null) {
    const losses = fights - wins;
    return `📊 *Kampfstatistiken von ${mentionTag}* 📊
━━━━━━━━━━━━━━━━━━━━
🏅 Punkte: ${points}
📊 Platzierung: ${rank !== null ? `#${rank + 1}` : '–'}
🥇 Siege: ${wins}
❌ Niederlagen: ${losses}
⚔️ Kämpfe insgesamt: ${fights}
━━━━━━━━━━━━━━━━━━━━`;
}

// Prüft, ob Nummer eine Teamrolle besitzt
function isTeamMemberWithRole(number) {
    const role = teamData[number];
    return role === 'Owner' || role === 'Admin';
}

// Rang auf Leaderboard ermitteln
function getRank(stats, id) {
    const players = Object.entries(stats)
        .map(([userId, data]) => ({ id: userId, points: data.points || 0 }))
        .sort((a, b) => b.points - a.points);

    return players.findIndex(p => p.id === id);
}

module.exports = {
    name: 'stats',
    description: 'Zeigt eigene oder andere Stats an\nBenutzung: *?stats* für eigene Statistiken\nOptional: *?stats @person* für andere Gruppenmitglieder',
    menu: 'Zeigt Kampfstatistiken',
    category: 'fun',
    execute: async (sock, sender, args, msg) => {
        const stats = loadStats();
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const senderId = (msg.key.participant || sender); // richtige JID

        // === STATS RESET ===
        if (args[0] === 'reset') {
            const senderNum = senderId.split('@')[0];
            if (!isTeamMemberWithRole(senderNum)) {
                await delay(1000);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Nur Teammitglieder mit der Rolle *Admin* oder höher dürfen die Statistiken zurücksetzen!'
                });
                return;
            }

            saveStats({});
            await delay(1000);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '✅ Alle Kampfstatistiken wurden erfolgreich zurückgesetzt!'
            });
            return;
        }

        // === STATS VON MENTIONED USER ===
        if (mentions.length > 0) {
            const target = mentions[0];
            const userStats = stats[target] || { wins: 0, fights: 0, points: 0 };
            const mentionTag = `@${target.split('@')[0]}`;
            const rank = getRank(stats, target);

            await delay(1000);
            await sock.sendMessage(msg.key.remoteJid, {
                text: getStatsText(mentionTag, userStats.wins, userStats.fights, userStats.points, rank),
                mentions: [target]
            });
            return;
        }

        // === EIGENE STATS ===
        const selfStats = stats[senderId];

        if (!selfStats) {
            await delay(1000);
            await sock.sendMessage(msg.key.remoteJid, {
                text: 'ℹ️ Du hast bisher noch keine Kämpfe absolviert!'
            });
            return;
        }

        const mentionTag = `@${senderId.split('@')[0]}`;
        const rank = getRank(stats, senderId);

        await delay(1000);
        await sock.sendMessage(msg.key.remoteJid, {
            text: getStatsText(mentionTag, selfStats.wins, selfStats.fights, selfStats.points, rank),
            mentions: [senderId]
        });
    }
};