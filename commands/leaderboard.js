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

// Funktion zur Maskierung der Telefonnummern
function maskPhoneNumber(number) {
    const countryCode = number.slice(0, 2); // Ländervorwahl
    const areaCode = number.slice(2, 5); // Vorwahl
    const firstDigit = number.slice(5, 6); // erste Stelle nach der Vorwahl
    const lastThreeDigits = number.slice(-3); // die letzten 3 Ziffern

    return `+${countryCode} ${areaCode} ${firstDigit}xxxx${lastThreeDigits}`;
}

// Funktion zur Bestimmung der Flagge basierend auf der Nummer
function getCountryFlag(number) {
    const countryCodes = {
        '49': '🇩🇪', '41': '🇨🇭', '43': '🇦🇹', '1': '🇺🇸', '44': '🇬🇧', '33': '🇫🇷'
        // Weitere Länder kannst du hier hinzufügen
    };
    const countryCode = number.slice(0, 2);
    return countryCodes[countryCode] || '🌍';
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

        let text = `🏆 *Top 10 Spieler – Leaderboard (Punkte)* 🏆\n\n`;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const medal = getMedalEmoji(i);
            const phoneNumber = player.id.split('@')[0]; // Nummer ohne @s.whatsapp.net
            const maskedPhone = maskPhoneNumber(phoneNumber); // Maskierte Telefonnummer
            const flag = getCountryFlag(phoneNumber); // Flagge basierend auf der Vorwahl

            text += `${medal} ${i + 1}. ${maskedPhone} ${flag}\n   🏅 ${player.points} Punkte | ${player.wins} Siege | ${player.fights} Kämpfe\n\n`;
        }

        await delay(1000);
        await sock.sendMessage(msg.key.remoteJid, {
            text
        });
    }
};