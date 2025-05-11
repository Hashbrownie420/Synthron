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
    const masked = number.slice(0, -4).replace(/\d/g, 'X') + number.slice(-4); // Zeigt nur die letzten 4 Ziffern an
    return masked;
}

// Funktion zur Bestimmung der Flagge basierend auf der Nummer
function getCountryFlag(number) {
    // Mapping der Ländervorwahlen zu Flaggen-Emojis
    const countryCodes = {
        '49': '🇩🇪', // Deutschland
        '41': '🇨🇭', // Schweiz
        '43': '🇦🇹', // Österreich
        '1': '🇺🇸', // USA (Beispiel)
        '44': '🇬🇧', // Großbritannien (Beispiel)
        '33': '🇫🇷', // Frankreich (Beispiel)
        // Füge hier weitere Länder und deren Vorwahlen hinzu
    };

    const countryCode = number.slice(0, 2); // Holen der Vorwahl (erste zwei Ziffern)
    return countryCodes[countryCode] || '🌍'; // Standard-Flagge, wenn keine Übereinstimmung
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
			await delay();
            await sock.sendMessage(msg.key.remoteJid, {
                text: 'ℹ️ Noch keine Spieler auf dem Leaderboard!'
            });
            return;
        }

        // Leaderboard Text formatieren
        let text = `🏆 *Top 10 Spieler – Leaderboard (Punkte)* 🏆\n\n`;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const medal = getMedalEmoji(i);
            const phoneNumber = player.id.split('@')[0]; // Nur Nummer ohne @s.whatsapp.net
            const maskedPhone = maskPhoneNumber(phoneNumber); // Maskierte Nummer
            const flag = getCountryFlag(phoneNumber); // Flagge basierend auf der Vorwahl

            // Abfrage des echten Namens mit getProfile
            try {
                const profile = await sock.getProfile(phoneNumber + '@s.whatsapp.net'); // Holt das Profil des Kontakts
                const userName = profile.pushName || "Unbekannt"; // Wenn kein Name vorhanden ist, dann "Unbekannt"

                text += `${medal} ${i + 1}. ${userName} ${flag}\n   🏅 ${player.points} Punkte | ${player.wins} Siege | ${player.fights} Kämpfe\n\n`;
            } catch (error) {
                console.error('Fehler beim Abrufen des Profils:', error);
                text += `${medal} ${i + 1}. Unbekannter Benutzer ${flag}\n   🏅 ${player.points} Punkte | ${player.wins} Siege | ${player.fights} Kämpfe\n\n`;
            }
        }

        await delay();
        await sock.sendMessage(msg.key.remoteJid, {
            text
        });
    }
};