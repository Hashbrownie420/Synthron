const fs = require('fs');
const path = require('path');
const { delay } = require('../utils');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const joinRequestsFile = path.join(__dirname, '../joinRequests.json');
const teamDataFile     = path.join(__dirname, '../botTeamData.json');
const counterFile      = path.join(__dirname, '../joinIdCounter.json');
const ADMIN_GROUP_ID   = '120363403067644626@g.us';

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

async function sendWelcomeMessage(sock, groupJid) {
  const welcomeText = `📢 *Synthron ist der Gruppe beigetreten!*\n━━━━━━━━━━━━━━━━━━\n✨ Hallo zusammen! Ich bin *Synthron*, euer neuer Gruppenbegleiter.\nIch freue mich, ab jetzt hier zu sein und euch mit Infos, Spaß und Support zu unterstützen!\n\nTippt einfach *?menu*, um mein Hauptmenü anzuzeigen.\nAuf eine coole Zeit zusammen!\n\n━━━━━━━━━━━━━━━━━━\n> Verwende *?help (Befehl)*, um mehr Infos zur Benutzung eines Befehls zu erfahren.\nBeispiel:\n\n\`?help menu\``;

  await delay(2000);
  await sock.sendMessage(groupJid, { text: welcomeText });
}

module.exports = {
  name: 'join',
  description: 'Sendet eine Join-Anfrage für deine Gruppe an das Team zur Überprüfung\nBenutzung: *?join [Gruppenlink]*',
  menu: 'Sende eine Join-Anfrage',
  category: 'admin',

  execute: async (sock, sender, args, msg) => {
    const senderNum = msg.key.participant
      ? msg.key.participant.split('@')[0]
      : sender.split('@')[0];

    const teamData = loadTeamData();
    const requests = loadRequests();
    const subCommand = args[0];

    // ─── Accept ───────────────────────────────────────────────────────────────
    if (subCommand === 'accept') {
      const id = args[1];
      const request = requests[id];
      if (!request) {
        await delay();
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Keine Join-Anfrage mit dieser ID gefunden.' });
      }
      if (!teamData[senderNum] || (teamData[senderNum] !== 'Admin' && teamData[senderNum] !== 'Owner')) {
        await delay();
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Nur Admins oder Owner dürfen Join-Anfragen akzeptieren.' });
      }

      const userJid = `${request.number}@s.whatsapp.net`;
      await delay();
      await sock.sendMessage(userJid, {
        text: `✅ Deine Join-Anfrage wurde *angenommen*! Der Bot wird der Gruppe nun beitreten.\n\n${request.groupLink}`
      });

      const inviteCode = request.groupLink.split('/').pop();
      try {
        const groupJid = await sock.groupAcceptInvite(inviteCode);
        await delay();
        await sendWelcomeMessage(sock, groupJid); // Begrüßungsnachricht nach Beitritt
      } catch (e) {
        console.error('Fehler beim Beitreten der Gruppe:', e);
        await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Der Bot konnte der Gruppe nicht automatisch beitreten.' });
      }

      await delay();
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🟢 Join-Anfrage von *${request.number}* (ID: ${id}) wurde akzeptiert.`
      });

      delete requests[id];
      saveRequests(requests);
      return;
    }

    // ─── Deny ─────────────────────────────────────────────────────────────────
    if (subCommand === 'deny') {
      const id = args[1];
      const request = requests[id];
      if (!request) {
        await delay();
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Keine Join-Anfrage mit dieser ID gefunden.' });
      }
      if (!teamData[senderNum] || (teamData[senderNum] !== 'Admin' && teamData[senderNum] !== 'Owner')) {
        await delay();
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Nur Admins oder Owner dürfen Join-Anfragen ablehnen.' });
      }

      const userJid = `${request.number}@s.whatsapp.net`;
      await delay();
      await sock.sendMessage(userJid, { text: `❌ Deine Join-Anfrage wurde *abgelehnt*.` });

      await delay();
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🔴 Join-Anfrage von *${request.number}* (ID: ${id}) wurde abgelehnt.`
      });

      delete requests[id];
      saveRequests(requests);
      return;
    }

    // ─── List ─────────────────────────────────────────────────────────────────
    if (subCommand === 'list') {
      if (!teamData[senderNum] || (teamData[senderNum] !== 'Admin' && teamData[senderNum] !== 'Owner')) {
        await delay();
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Nur Admins oder Owner dürfen Join-Anfragen einsehen.' });
      }
      const keys = Object.keys(requests);
      if (keys.length === 0) {
        await delay();
        return sock.sendMessage(msg.key.remoteJid, { text: '📭 Keine offenen Join-Anfragen.' });
      }
      const list = keys
        .map(id => `🆔 *ID:* ${id}\n👤 *Nummer:* ${requests[id].number}\n🖇️ *Gruppenlink:* ${requests[id].groupLink}`)
        .join('\n\n\n');
      await delay();
      return sock.sendMessage(msg.key.remoteJid, { text: `📋 *Offene Join-Anfragen:*\n\n${list}` });
    }

    // ─── Neue Join-Anfrage ────────────────────────────────────────────────────
    const groupLink = args[0];
    if (!groupLink || !groupLink.startsWith('https://chat.whatsapp.com/')) {
      await delay();
      return sock.sendMessage(msg.key.remoteJid, { text: '❗ Benutzung: *?join [Gruppenlink]*' });
    }

    const id = getNextId();
    requests[id] = { number: senderNum, groupLink };
    saveRequests(requests);

    await delay();
    await sock.sendMessage(sender, {
      text: `✅ Deine Anfrage wurde erfolgreich gesendet!\n\n🆔 *Anfrage-ID:* ${id}`
    });

    await delay();
    await sock.sendMessage(ADMIN_GROUP_ID, {
      text:
        `📥 *Neue Join-Anfrage!*\n\n` +
        `🆔 *ID:* ${id}\n` +
        `👤 *Nummer:* ${senderNum}\n` +
        `🖇️ *Gruppenlink:* ${groupLink}\n\n` +
        `*?join accept ${id}* oder *?join deny ${id}*`
    });
  }
};