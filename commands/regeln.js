const fs = require('fs');
const path = require('path');
const { delay } = require('../utils');

const rulesFile = path.join(__dirname, '../regeln.json');

module.exports = {
    name: 'regeln',
    description: 'Verwalte oder zeige Gruppenregeln\n\nBenutzung für Admins:\n*?regeln set [Text]* Um Regeln festzulegen\n*?regeln reset* um die Standardregeln (Gruppenbeschreibung) anzuzeigen\n\nBenutzung für jedes Gruppenmitglied:\n*?regeln show* um die festgelegten Regeln anzuzeigen',
    category: 'admin',
    menu: 'Regeln verwalten und anzeigen',
    async execute(sock, sender, args, msg) {
        const groupId = msg.key.remoteJid;
        const senderId = msg.key.participant || msg.key.remoteJid;
        const subCommand = args[0]?.toLowerCase();

        // Lade existierende Regeln oder starte leer
        const rulesData = loadRulesData();

        // Lade Gruppeninfos für Admincheck oder Beschreibung
        const groupMetadata = await sock.groupMetadata(groupId);
        const isAdmin = groupMetadata.participants.some(p => 
            p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin')
        );

        if (subCommand === 'set') {
            if (!isAdmin) {
				await delay();
                await sock.sendMessage(groupId, { text: '❌ Nur Gruppenadmins können Regeln setzen.' });
                return;
            }

            const customRules = args.slice(1).join(' ');
            if (!customRules) {
				await delay();
                await sock.sendMessage(groupId, { text: '❗ Bitte gib die neuen Regeln an. Beispiel: `?regeln set Kein Spam!`' });
                return;
            }

            rulesData[groupId] = customRules;
            saveRulesData(rulesData);

            await delay();
            await sock.sendMessage(groupId, { text: `✅ Neue Regeln gespeichert:\n\n${customRules}` });

        } else if (subCommand === 'reset') {
            if (!isAdmin) {
				await delay();
                await sock.sendMessage(groupId, { text: '❌ Nur Gruppenadmins können die Regeln zurücksetzen.' });
                return;
            }

            delete rulesData[groupId];
            saveRulesData(rulesData);

            await delay();
            await sock.sendMessage(groupId, { text: '♻️ Die benutzerdefinierten Regeln wurden gelöscht. Es wird nun wieder die Gruppenbeschreibung verwendet.' });

        } else if (subCommand === 'show') {
            const customRules = rulesData[groupId];

            if (customRules) {
				await delay();
                await sock.sendMessage(groupId, { text: `📋 *Gruppenregeln:*\n\n${customRules}` });
            } else {
                const fallback = groupMetadata.desc || 'ℹ️ Es wurde keine Gruppenbeschreibung gesetzt.';
				await delay();
                await sock.sendMessage(groupId, { text: `📋 *Standard-Regeln (Gruppenbeschreibung):*\n\n${fallback}` });
            }

        } else {
			await delay();
            await sock.sendMessage(groupId, {
                text: '❗ Unbekannter Befehl. Benutze:\n\n▪️ `?regeln set [Text]`\n▪️ `?regeln show`\n▪️ `?regeln reset`'
            });
        }
    }
};

function loadRulesData() {
    if (!fs.existsSync(rulesFile)) return {};
    return JSON.parse(fs.readFileSync(rulesFile, 'utf-8'));
}

function saveRulesData(data) {
    fs.writeFileSync(rulesFile, JSON.stringify(data, null, 2));
}