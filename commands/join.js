const fs = require('fs');
const path = require('path');
const { delay } = require('../utils');
const { category } = require('./echo');

const joinRequestsFile = path.join(__dirname, '../joinRequests.json');
const teamDataFile = path.join(__dirname, '../botTeamData.json');
const counterFile = path.join(__dirname, '../joinIdCounter.json');
const ADMIN_GROUP_ID = '120363403067644626@g.us';

function loadRequests() {
    if (!fs.existsSync(joinRequestsFile)) return {};
    return JSON.parse(fs.readFileSync(joinRequestsFile, 'utf-8'));
}

function saveRequests(data) {
    fs.writeFileSync(joinRequestsFile, JSON.stringify(data, null, 2));
}

function loadTeamData() {
    if (!fs.existsSync(teamDataFile)) return {};
    return JSON.parse(fs.readFileSync(teamDataFile, 'utf-8'));
}

function getNextId() {
    let counter = { lastId: 0 };
    if (fs.existsSync(counterFile)) {
        counter = JSON.parse(fs.readFileSync(counterFile, 'utf-8'));
    }
    counter.lastId++;
    fs.writeFileSync(counterFile, JSON.stringify(counter, null, 2));
    return counter.lastId.toString();
}

module.exports = {
    name: 'join',
    description: 'Sendet eine Join-Anfrage für deine Gruppe an das Team zur Überprüfung\nBenutzung: *?join [Gruppenlink]',
    menu: 'Sende eine Join-Anfrage',
    category: 'admin',
    execute: async (sock, sender, args, msg) => {
        const senderNum = msg.key.participant
            ? msg.key.participant.split('@')[0]
            : sender.split('@')[0];

        const teamData = loadTeamData();
        const requests = loadRequests();

        const subCommand = args[0];

        if (subCommand === 'accept') {
            const id = args[1];
            const request = requests[id];

            if (!request) {
                await delay(1000);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Keine Join-Anfrage mit dieser ID gefunden.' });
                return;
            }

            if (!teamData[senderNum] || (teamData[senderNum] !== 'Admin' && teamData[senderNum] !== 'Owner')) {
                await delay(1000);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Nur Admins oder Owner dürfen Join-Anfragen akzeptieren.' });
                return;
            }

            const userJid = `${request.number}@s.whatsapp.net`;
            await delay(1000);
            await sock.sendMessage(userJid, {
                text: `✅ Deine Join-Anfrage wurde *angenommen*! Der Bot wird der Gruppe nun beitreten.\n\n${request.groupLink}`
            });

            await delay(1000);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🟢 Join-Anfrage von *${request.number}* (ID: ${id}) wurde akzeptiert.`
            });

            delete requests[id];
            saveRequests(requests);
            return;
        }

        if (subCommand === 'deny') {
            const id = args[1];
            const request = requests[id];

            if (!request) {
                await delay(1000);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Keine Join-Anfrage mit dieser ID gefunden.' });
                return;
            }

            if (!teamData[senderNum] || (teamData[senderNum] !== 'Admin' && teamData[senderNum] !== 'Owner')) {
                await delay(1000);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Nur Admins oder Owner dürfen Join-Anfragen ablehnen.' });
                return;
            }

            const userJid = `${request.number}@s.whatsapp.net`;
            await delay(1000);
            await sock.sendMessage(userJid, {
                text: `❌ Deine Join-Anfrage wurde *abgelehnt*.`
            });

            await delay(1000);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🔴 Join-Anfrage von *${request.number}* (ID: ${id}) wurde abgelehnt.`
            });

            delete requests[id];
            saveRequests(requests);
            return;
        }

        if (subCommand === 'list') {
            if (!teamData[senderNum] || (teamData[senderNum] !== 'Admin' && teamData[senderNum] !== 'Owner')) {
                await delay(1000);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Nur Admins oder Owner dürfen Join-Anfragen einsehen.' });
                return;
            }

            const keys = Object.keys(requests);
            if (keys.length === 0) {
                await delay(1000);
                await sock.sendMessage(msg.key.remoteJid, { text: '📭 Keine offenen Join-Anfragen.' });
                return;
            }

            const list = keys.map(id => `🆔 *ID:* ${id}\n👤 *Nummer:* ${requests[id].number}\n🖇️ *Gruppenlink:* ${requests[id].groupLink}`).join('\n\n\n');
            await delay(1000);
            await sock.sendMessage(msg.key.remoteJid, { text: `📋 *Offene Join-Anfragen:*\n\n${list}` });
            return;
        }

        // Default: Neue Join-Anfrage
        const groupLink = args[0];
        if (!groupLink || !groupLink.startsWith('https://chat.whatsapp.com/')) {
            await delay(1000);
            await sock.sendMessage(msg.key.remoteJid, { text: '❗ Benutzung: *?join [Gruppenlink]*' });
            return;
        }

        const id = getNextId();
        requests[id] = {
            number: senderNum,
            groupLink
        };
        saveRequests(requests);

        await delay(1000);
        await sock.sendMessage(sender, {
            text: `✅ Deine Anfrage wurde erfolgreich gesendet!\n\n🆔 *Anfrage-ID:* ${id}`
        });

        await delay(1000);
        await sock.sendMessage(ADMIN_GROUP_ID, {
            text: `📥 *Neue Join-Anfrage!*\n\n🆔 *ID:* ${id}\n👤 *Nummer:* ${senderNum}\n🖇️ *Gruppenlink:* ${groupLink}\n\n*?join accept ${id}* oder *?join deny ${id}*`
        });
    }
};