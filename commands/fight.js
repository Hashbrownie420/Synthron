const fs = require('fs');
const path = require('path');
const { category } = require('./echo');
const { delay } = require('../utils'); // delay aus utils.js importieren

const statsFile = path.join(__dirname, '../fightStats.json');
const cooldownsFile = path.join(__dirname, '../cooldowns.json'); // Datei für Cooldowns

// === Stats laden/speichern (unverändert) ===
function loadStats() {
    try {
        if (!fs.existsSync(statsFile)) {
            fs.writeFileSync(statsFile, JSON.stringify({}, null, 2));
            console.log("fightStats.json wurde erstellt.");
            return {};
        }
        const data = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
        console.log("fightStats.json erfolgreich geladen.");
        return data;
    } catch (err) {
        console.error("Fehler beim Laden der Stats:", err);
        return {};
    }
}

function saveStats(data) {
    try {
        fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));
        console.log("fightStats.json erfolgreich gespeichert.");
    } catch (err) {
        console.error("Fehler beim Speichern der Stats:", err);
    }
}

// === Cooldowns laden/speichern (neu) ===
function loadCooldowns() {
    try {
        if (!fs.existsSync(cooldownsFile)) {
            fs.writeFileSync(cooldownsFile, JSON.stringify({}, null, 2));
            return {};
        }
        return JSON.parse(fs.readFileSync(cooldownsFile, 'utf-8'));
    } catch (err) {
        console.error("Fehler beim Laden der Cooldowns:", err);
        return {};
    }
}

function saveCooldowns(data) {
    try {
        fs.writeFileSync(cooldownsFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fehler beim Speichern der Cooldowns:", err);
    }
}

// === Spezial-Attacken (unverändert) ===
const specialAttacks = [
    { name: 'Hirnschmelzer', effect: 'verwirrt das Ziel komplett', damage: 35 },
    { name: 'Sockenbombe', effect: 'hinterlässt einen bleibenden Geruchsschaden', damage: 30 },
    { name: 'TikTok-Cringe', effect: 'verursacht seelischen Schaden', damage: 28 },
    { name: 'Schuldenfalle', effect: 'zieht dir den Boden unter den Füßen weg', damage: 32 },
    { name: 'Lachflash', effect: 'bringt dich zum Weinen (vor Lachen)', damage: 27 },
    { name: 'Kabelsalat', effect: 'verwirrt dein Gehirn mit Technik', damage: 26 },
    { name: 'Reality-Check', effect: 'holt dich brutal auf den Boden zurück', damage: 34 },
    { name: 'Matheaufgabe', effect: 'verursacht Denkblockade', damage: 31 },
    { name: 'Großmutter-Klatscher', effect: 'knallt mit dem Hausschuh zu', damage: 29 },
    { name: 'Döner ohne Soße', effect: 'reiner Schmerz', damage: 33 },

    { name: 'Pizza-Wurf', effect: 'macht fettige Schäden', damage: 28 },
    { name: 'Koffein-Explosion', effect: 'versetzt das Ziel in Panik', damage: 30 },
    { name: 'WhatsApp-Spam', effect: 'blockiert das Gehirn mit Benachrichtigungen', damage: 26 },
    { name: 'Windows-Update', effect: 'friert das Ziel für Stunden ein', damage: 33 },
    { name: 'Sneaker-Stinker', effect: 'macht jeden kampfunfähig durch Gestank', damage: 27 },
    { name: 'Selfie-Flash', effect: 'blendet das Ziel komplett', damage: 25 },
    { name: 'Luftgitarren-Solo', effect: 'schneidet tief in die Coolness', damage: 29 },
    { name: 'Katzenvideo-Schock', effect: 'bringt das Ziel zum Sabbern', damage: 28 },
    { name: 'Tastatur-Wutanfall', effect: 'lässt Finger bluten', damage: 31 },
    { name: 'Troll-Kommentar', effect: 'triggert unkontrollierte Wut', damage: 30 },

    { name: 'Level 1 Magie', effect: 'sieht cool aus, tut aber nix', damage: 24 },
    { name: 'Kabelbruch', effect: 'lässt das Ziel die Verbindung verlieren', damage: 27 },
    { name: 'Lieferando-Zeitbombe', effect: 'explodiert nach 60 Minuten', damage: 29 },
    { name: 'YouTube-Ads', effect: 'nervt bis zur Aufgabe', damage: 28 },
    { name: 'Mathe-Klausur', effect: 'zieht jegliche Hoffnung ab', damage: 32 },
    { name: 'Lego-Fußtritt', effect: 'verursacht legendären Schmerz', damage: 33 },
    { name: 'Abo-Falle', effect: 'zieht langsam dein Leben', damage: 30 },
    { name: 'Emoji-Sturm', effect: 'macht alles niedlich aber tödlich', damage: 27 },
    { name: 'Kaugummi-Haarfalle', effect: 'lässt das Ziel verzweifeln', damage: 25 },
    { name: 'Zugverspätung', effect: 'bringt deinen Rhythmus komplett durcheinander', damage: 31 },

    { name: 'Memes des Todes', effect: 'zu lustig zum Überleben', damage: 29 },
    { name: 'Haargel-Explosion', effect: 'verklebt die Gedanken', damage: 26 },
    { name: 'TikTok-Tanzwelle', effect: 'zwingt das Ziel zum Mittanzen', damage: 28 },
    { name: 'Verwandtenbesuch', effect: 'zieht dir Energie mit Smalltalk ab', damage: 32 },
    { name: 'Kabelbinder-Falle', effect: 'macht alles unbeweglich', damage: 30 },
    { name: 'PowerPoint-Folter', effect: 'Schmerz durch Langeweile', damage: 27 },
    { name: 'Captcha-Krise', effect: 'hält dich ewig auf', damage: 25 },
    { name: 'Böller-Schreck', effect: 'macht das Trommelfell kaputt', damage: 33 },
    { name: 'Gurkenwasser-Schuss', effect: 'zieht die Kehle trocken', damage: 24 },
    { name: 'Autotune-Angriff', effect: 'verändert deine Stimme auf ewig', damage: 29 },

    { name: 'Rosenmontag-Bombe', effect: 'macht alles jeck', damage: 31 },
    { name: 'Lautsprecher-Overkill', effect: 'macht die Ohren taub', damage: 30 },
    { name: 'Streamer Rage', effect: 'lässt alles brennen', damage: 32 },
    { name: 'USB falsch rum', effect: 'maximale Frustration', damage: 28 },
    { name: 'Heißer Kaffee', effect: 'verbrüht die Geduld', damage: 26 },
    { name: 'Pfandflaschenwurf', effect: 'nachhaltiger Schaden', damage: 25 },
    { name: 'Stromausfall', effect: 'macht dich blind und taub', damage: 33 },
    { name: 'Philosophie-Stunde', effect: 'überlastet dein Denken', damage: 30 },
    { name: 'Handyakku leer', effect: 'Ziel verliert komplett die Kontrolle', damage: 29 },
    { name: 'Mückenschwarm', effect: 'nervt dich zu Tode', damage: 27 },

    { name: 'Regen beim Grillen', effect: 'macht alle Pläne zunichte', damage: 28 },
    { name: 'Ohrwurm', effect: 'dreht sich ewig im Kopf', damage: 26 },
    { name: 'Fehlermeldung 404', effect: 'Mind not found', damage: 25 },
    { name: 'Kinderschrei', effect: 'macht selbst den stärksten Krieger weich', damage: 31 },
    { name: 'Karaoke-Killer', effect: 'zersingt deine Ehre', damage: 30 },
    { name: 'Schwiegermutter-Blick', effect: 'lässt dich erstarren', damage: 32 },
    { name: 'Ketchup-Flecken', effect: 'verursacht maximalen Stress', damage: 29 },
    { name: 'Cringe-Level-9000', effect: 'zerstört deine Würde', damage: 30 },
    { name: 'Bananenschalen-Rutsch', effect: 'klassischer Knockout', damage: 27 },
    { name: 'Butterfinger-Attacke', effect: 'du verlierst alles', damage: 28 },

    { name: 'Ferndiagnose', effect: 'stellt falsche Krankheiten fest', damage: 26 },
    { name: 'Schlechte Witze', effect: 'töten langsam dein inneres Ich', damage: 27 },
    { name: 'Staubsauger-Horror', effect: 'zieht alles ein, auch deine Motivation', damage: 25 },
    { name: 'Vater-Sprüche', effect: 'macht dich sprachlos', damage: 30 },
    { name: 'Böller unter der Couch', effect: 'knallt emotional', damage: 31 },
    { name: 'Knusperchip-Angriff', effect: 'zieht Konzentration ab', damage: 26 },
    { name: 'Funkloch', effect: 'kommunikative Isolation', damage: 29 },
    { name: 'Karnevals-Schock', effect: 'bunt und brutal', damage: 28 },
    { name: 'Luftpolsterfolie-Explosion', effect: 'hypnotisiert das Ziel', damage: 27 },
    { name: 'Zoom-Meeting', effect: 'lässt dich innerlich sterben', damage: 30 },

    { name: 'Fake-Gewinnspiel', effect: 'zieht Hoffnung ab', damage: 25 },
    { name: 'Werbe-Jumpscare', effect: 'versetzt dich in Rage', damage: 26 },
    { name: 'Flixbus-Horrortrip', effect: 'verursacht seelische Narben', damage: 29 },
    { name: 'Bürokratie-Klatscher', effect: 'macht dich willenlos', damage: 30 },
    { name: 'Schneckenrennen', effect: 'bringt deine Geduld ans Limit', damage: 24 },
    { name: 'Sarkasmus-Dusche', effect: 'tropft in dein Ego', damage: 28 },
    { name: 'Gurkenmaske', effect: 'verwirrt optisch', damage: 26 },
    { name: 'Ketchup-Overload', effect: 'macht alles klebrig', damage: 25 },
    { name: 'Minecraft-Creeper', effect: 'explodiert mitten in deinem Leben', damage: 32 },
    { name: 'Flachwitz-Falle', effect: 'lässt dich sterben vor innerer Leere', damage: 27 },

    { name: 'Großmutter-Schmatzer', effect: 'erötet vor Peinlichkeit', damage: 33}
];

module.exports = {
    name: 'fight',
    description: 'Kämpfe gegen ein Gruppenmitglied und kletter auf die Bestenliste\nBenutzung: *?fight @person*',
    menu: 'Fordere ein Gruppenmitglied heraus',
    category: 'fun',
    execute: async (sock, sender, args, msg) => {
        const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const player1 = msg.key.participant || sender;
        const player2 = mentions[0];

        if (!player2) {
            await delay();
            await sock.sendMessage(msg.key.remoteJid, { text: '❗ Bitte erwähne jemanden zum Kämpfen: *?fight @user*' });
            return;
        }

        // ==== 5-MINUTEN COOLDOWN ====
        const cooldowns = loadCooldowns();
        const now = Date.now();
        const cd = 5 * 60 * 1000; // 5 Minuten

        if (cooldowns[player1] && now - cooldowns[player1] < cd) {
            const rem = cd - (now - cooldowns[player1]);
            const m = Math.floor(rem / 60000);
            const s = Math.ceil((rem % 60000) / 1000);
            await sock.sendMessage(msg.key.remoteJid, { text: `⏳ Du musst noch ${m}m ${s}s warten, bevor du wieder kämpfen kannst.` });
            return;
        }
        cooldowns[player1] = now;
        saveCooldowns(cooldowns);
        // ==== Ende Cooldown ====

        const stats = loadStats();

        // Init stats wenn Spieler neu ist
        if (!stats[player1]) stats[player1] = { wins: 0, fights: 0, points: 0 };
        if (!stats[player2]) stats[player2] = { wins: 0, fights: 0, points: 0 };

        // Zufällige Kraft und Attacke
        const getPower = () => Math.floor(Math.random() * 30) + 20;
        const getAttack = () => specialAttacks[Math.floor(Math.random() * specialAttacks.length)];

        const p1Power = getPower();
        const p2Power = getPower();
        const p1Attack = getAttack();
        const p2Attack = getAttack();

        const p1Total = p1Power + p1Attack.damage;
        const p2Total = p2Power + p2Attack.damage;

        let winner, loser;
        const pointsWinner = 5;
        const pointsLoser = 1;
        const pointsDraw = 3;
        let pointsForRoundPlayer1 = 0;
        let pointsForRoundPlayer2 = 0;

        if (p1Total > p2Total) {
            winner = player1; loser = player2;
            stats[player1].wins++;
            pointsForRoundPlayer1 = pointsWinner;
            pointsForRoundPlayer2 = pointsLoser;
        } else if (p2Total > p1Total) {
            winner = player2; loser = player1;
            stats[player2].wins++;
            pointsForRoundPlayer1 = pointsLoser;
            pointsForRoundPlayer2 = pointsWinner;
        } else {
            winner = null;
            pointsForRoundPlayer1 = pointsDraw;
            pointsForRoundPlayer2 = pointsDraw;
        }

        stats[player1].points += pointsForRoundPlayer1;
        stats[player2].points += pointsForRoundPlayer2;
        stats[player1].fights++;
        stats[player2].fights++;
        saveStats(stats);

        const hp = 100;
        const msgText =
`🥊 *FIGHT TIME!* 🥊
@${player1.split('@')[0]} VS @${player2.split('@')[0]}

━━━━━━━━━━━━━━━━━━━━
👊 *Angriffe:*
- @${player1.split('@')[0]} nutzt *${p1Attack.name}* (${p1Attack.effect}) – ${p1Total} Schaden
- @${player2.split('@')[0]} nutzt *${p2Attack.name}* (${p2Attack.effect}) – ${p2Total} Schaden

❤️ *HP:*
- @${player1.split('@')[0]}: ${hp - p2Total} / ${hp}
- @${player2.split('@')[0]}: ${hp - p1Total} / ${hp}

━━━━━━━━━━━━━━━━━━━━
${winner ? `🏆 *@${winner.split('@')[0]} gewinnt!*` : '⚖️ Unentschieden!'}

📈 *Stats:*
- @${player1.split('@')[0]}: ${stats[player1].wins} Siege | ${stats[player1].fights} Kämpfe | Punkte: ${stats[player1].points}\n (Erhielt ${pointsForRoundPlayer1})
- @${player2.split('@')[0]}: ${stats[player2].wins} Siege | ${stats[player2].fights} Kämpfe | Punkte: ${stats[player2].points}\n (Erhielt ${pointsForRoundPlayer2})
`;

        await delay();
        await sock.sendMessage(msg.key.remoteJid, {
            text: msgText,
            mentions: [player1, player2]
        });
    }
};