// commands/kickall.js
const fs = require('fs');
const path = require('path');

const teamFile = path.join(__dirname, '../botTeamData.json');

module.exports = {
  name: 'kickall',
  description: 'Kickt ALLE Mitglieder aus der Gruppe. Nur Gruppenersteller oder Bot-Owner dürfen das!',
  menu: 'Alle aus Gruppe kicken',
  category: 'admin',
  async execute(sock, sender, args, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ Nur in Gruppen möglich!' }, { quoted: msg });
    }

    // Teamdaten laden
    let teamData = {};
    if (fs.existsSync(teamFile)) teamData = JSON.parse(fs.readFileSync(teamFile,'utf-8'));
    const senderJid = msg.key.participant;
    const senderNum = senderJid.split('@')[0];
    const senderRole = teamData[senderNum]; // "Owner"|"Admin"|undefined

    // Gruppen-Meta laden
    const meta = await sock.groupMetadata(chatId);

    // Ist der Sender der Gruppenersteller?
    const groupOwner = meta.owner; // Achtung: kann undefined sein bei bestimmten Gruppen
    const isGroupCreator = (groupOwner && groupOwner === senderJid);

    if (!isGroupCreator && senderRole !== 'Owner') {
      return sock.sendMessage(chatId, { text: '❌ Nur der Gruppenersteller oder ein Bot-Owner darf ?kickall verwenden!' }, { quoted: msg });
    }

    // Bot Admin?
    const botId = sock.user.id.split(':')[0]+'@s.whatsapp.net';
    const botParticipant = meta.participants.find(p => p.id === botId);
    if (!botParticipant || !(botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')) {
      return sock.sendMessage(chatId, { text: '❌ Ich brauche Adminrechte, um alle zu kicken!' }, { quoted: msg });
    }

    // Kicken
    for (const participant of meta.participants) {
      if (participant.id !== botId && participant.id !== senderJid) {
        try {
          await sock.groupParticipantsUpdate(chatId, [participant.id], 'remove');
          await delay(300); // Kurze Pause, damit WhatsApp nicht meckert
        } catch (e) {
          console.error('Fehler beim Kicken:', participant.id, e);
        }
      }
    }

    await sock.sendMessage(chatId, { text: '✅ Alle wurden gekickt!' }, { quoted: msg });
  }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}