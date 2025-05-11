const fs = require('fs');
const { delay } = require("../utils");
const path = require('path');

// === Pfad zu den Teamdaten ===
const TEAM_DATA_PATH = path.join(__dirname, '../botTeamData.json');

function loadTeamData() {
    if (!fs.existsSync(TEAM_DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(TEAM_DATA_PATH, 'utf8'));
}

module.exports = {
    name: 'setstatus',
    description: 'Ändert den Profilstatus des Bots (nur Owner)',
    menu: 'Profilstatus ändern',
    category: 'team',
    execute: async (sock, sender, args, msg) => {
        const from = msg.key.remoteJid;
        const senderNum = (msg.key.participant || sender).split('@')[0];
        const teamData = loadTeamData();

        const senderRole = teamData[senderNum];

        if (senderRole !== 'Owner') {
			await delay();
            return sock.sendMessage(from, { text: '🚫 *Nur ein Team-Owner darf den Status ändern!*' });
        }

        const newStatus = args.join(' ');
        if (!newStatus) {
			await delay();
            return sock.sendMessage(from, { text: '❗ Nutzung: `?setstatus [Text]`' });
        }

        try {
            await sock.updateProfileStatus(newStatus);
			await delay();
            await sock.sendMessage(from, { text: `✅ *Status erfolgreich geändert zu:* "${newStatus}"` });
        } catch (err) {
            console.error('Fehler beim Ändern des Status:', err);
			await delay();
            await sock.sendMessage(from, { text: '❌ *Fehler beim Ändern des Status.*' });
        }
    }
};