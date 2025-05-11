const fs = require('fs');
const path = require('path');
const { delay } = require('../utils');

const teamFile = path.join(__dirname, '../botTeamData.json');

module.exports = {
  name: 'kick',
  description: 'Kicke ein Mitglied aus der Gruppe\n\nBenutzung: *?kick @Person [Grund]*',
  menu: 'Mitglied kicken',
  category: 'admin',

  async execute(sock, sender, args, msg) {
    const chatId = msg.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
		await delay();
      return sock.sendMessage(chatId, { text: '❌ Dieser Befehl funktioniert nur in Gruppen!' }, { quoted: msg });
    }

    const senderJid = msg.key.participant;
    const senderNum = senderJid.split('@')[0];

    let isGroupAdmin = false;
    try {
      const meta = await sock.groupMetadata(chatId);
      isGroupAdmin = meta.participants.some(p =>
        p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } catch (e) {
      console.error('Konnte groupMetadata nicht laden:', e);
    }

    let teamData = {};
    if (fs.existsSync(teamFile)) {
      teamData = JSON.parse(fs.readFileSync(teamFile, 'utf-8'));
    }
    const role = teamData[senderNum];

    if (!isGroupAdmin && role !== 'Owner' && role !== 'Admin') {
      await delay();
      return sock.sendMessage(
        chatId,
        { text: '❌ Nur Gruppen-Admins oder Bot-Owner/Team-Admins dürfen diesen Befehl nutzen.' },
        { quoted: msg }
      );
    }

    const mentionedJidList = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentionedJidList.length === 0) {
      return sock.sendMessage(chatId, { text: '❌ Bitte erwähne die Person, die du kicken möchtest.' }, { quoted: msg });
    }
    const mentioned = mentionedJidList[0];

    const grund = args.slice(1).join(' ') || 'Kein Grund angegeben.';

    let meta;
    try {
      meta = await sock.groupMetadata(chatId);
    } catch (e) {
      console.error('Fehler beim Laden der Gruppendaten:', e);
    }

    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = meta?.participants?.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!isBotAdmin) {
      await sock.sendMessage(chatId, {
        text: '❌ Ich bin kein Admin und kann niemanden kicken. Bitte gib mir Adminrechte!',
      }, { quoted: msg });
      return;
    }

    const isTargetAdmin = meta?.participants?.some(p => p.id === mentioned && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (isTargetAdmin) {
      return sock.sendMessage(chatId, { text: '❌ Ich kann keine Admins kicken.' }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [mentioned], 'remove');
      await sock.sendMessage(chatId, {
        text: `✅ Erfolgreich entfernt: @${mentioned.split('@')[0]}\n\n📝 Grund: ${grund}`,
        mentions: [mentioned]
      }, { quoted: msg });

      await delay();
      try {
        await sock.sendMessage(mentioned, {
          text: `⚠️ Du wurdest aus der Gruppe *${meta.subject}* entfernt.\n\n📝 *Grund:* ${grund}`
        });
      } catch (e) {
        console.error('⚠️ Konnte private Nachricht nicht senden:', e);
      }

    } catch (e) {
      console.error('Fehler beim Kicken:', e);
      await sock.sendMessage(chatId, { text: '⚠️ Kick fehlgeschlagen. Vielleicht bin ich kein Admin oder ein anderer Fehler ist aufgetreten.' }, { quoted: msg });
    }
  }
};