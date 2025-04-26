// utils.js
const fs = require('fs');
const path = require('path');

// Verzögerung (falls schon vorhanden)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// === Spieler-Registrierungssystem ===
const playerNamesFile = path.join(__dirname, '../playerNames.json');

function loadPlayerNames() {
    if (!fs.existsSync(playerNamesFile)) return {};
    return JSON.parse(fs.readFileSync(playerNamesFile, 'utf-8'));
}

function savePlayerNames(data) {
    fs.writeFileSync(playerNamesFile, JSON.stringify(data, null, 2));
}

// Spieler registrieren (unique name)
function registerPlayerName(jid, name) {
    const names = loadPlayerNames();

    // Name bereits vergeben?
    if (Object.values(names).includes(name)) {
        return { success: false };
    }

    // Registrierung durchführen
    names[jid] = name;
    savePlayerNames(names);
    return { success: true };
}

// Namen abrufen
function getPlayerName(jid) {
    const names = loadPlayerNames();
    return names[jid] || null;
}

module.exports = {
    delay,
    registerPlayerName,
    getPlayerName
};