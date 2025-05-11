// commands/mute.js
const fs = require('fs');
const path = require('path');
const { delay } = require('../utils');

const teamFile    = path.join(__dirname, '../botTeamData.json');
const muteFile    = path.join(__dirname, '../mutes.json');

// Hilfen: lade / speichere Mute-Daten
function loadMutes() {
  if (!fs.existsSync(muteFile)) return {};
  return JSON.parse(fs.readFileSync(muteFile, 'utf-8'));
}
function saveMutes(m) {
  fs.writeFileSync(muteFile, JSON.stringify(m, null, 2));
}
// Zeitparser: "10s","5m","2h","1d"
function parseDuration(str) {
  const m = /^(\d+)([smhd])$/i.exec(str);
  if (!m) return null;
  const n = parseInt(m[1]);
  switch (m[2].toLowerCase()) {
    case 's': return n*1000;
    case 'm': return n*60*1000;
    case 'h': return n*3600*1000;
    case 'd': return n*86400*1000;
  }
  return null;
}

module.exports = {
  name: 'mute',
  description: 'Mutet eine Person (löscht ihre Nachrichten)\n?mute enable @person [Zeit]\n?mute disable @person',
  menu: 'Person muten',
  category: 'admin',
  async execute(sock, sender, args, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
	  await delay();
      return sock.sendMessage(chatId, { text: '❌ Nur in Gruppen!' }, { quoted: msg });
    }

    // wer ruft auf?
    const senderJid = msg.key.participant;
    const senderNum = senderJid.split('@')[0];

    // Gruppen-Admin prüfen
    let isGroupAdmin = false;
    try {
      const meta = await sock.groupMetadata(chatId);
      isGroupAdmin = meta.participants.some(p =>
        p.id === senderJid && (p.admin==='admin'||p.admin==='superadmin')
      );
    } catch {}

    // Bot-Team-Admin prüfen
    let teamData = {};
    if (fs.existsSync(teamFile)) teamData = JSON.parse(fs.readFileSync(teamFile,'utf-8'));
    const role = teamData[senderNum]; // "Owner"|"Admin"

    if (!isGroupAdmin && role!=='Owner' && role!=='Admin') {
	  await delay();
      return sock.sendMessage(chatId, { text: '❌ Nur Gruppen-Admins oder Bot-Owner/Team-Admins dürfen das!' }, { quoted: msg });
    }

    const sub = args[0]?.toLowerCase();
    const mutes = loadMutes();
    mutes[chatId] = mutes[chatId]||{};

    if (sub === 'enable') {
      const mentions = msg.message.extendedTextMessage.contextInfo.mentionedJid||[];
      const target = mentions[0];
      if (!target) {
		await delay();
        return sock.sendMessage(chatId, { text: '❗ Markiere per @ jemanden, den du muten willst.' }, { quoted: msg });
      }
      let expiry = null;
      if (args[2]) {
        const d = parseDuration(args[2]);
        if (!d) return sock.sendMessage(chatId, { text: '❗ Zeitformat ungültig. z.B. 10s,5m,2h,1d' }, { quoted: msg });
        expiry = Date.now()+d;
      }
      mutes[chatId][target] = expiry;      // null = unendlich
      saveMutes(mutes);
      if (expiry) {
		await delay();
        await sock.sendMessage(chatId, { text: `🤫 <@${target.split('@')[0]}> gemutet für ${args[2]}.` }, { quoted: msg, contextInfo:{mentionedJid:[target]}});
      } else {
		await delay();
        await sock.sendMessage(chatId, { text: `🤫 <@${target.split('@')[0]}> unendlich gemutet.` }, { quoted: msg, contextInfo:{mentionedJid:[target]}});
      }
    }
    else if (sub === 'disable') {
      const mentions = msg.message.extendedTextMessage.contextInfo.mentionedJid||[];
      const target = mentions[0];
      if (!target) return sock.sendMessage(chatId, { text: '❗ Markiere per @ jemanden, dessen Mute du aufheben willst.' }, { quoted: msg });
      delete mutes[chatId][target];
      saveMutes(mutes);
	  await delay();
      await sock.sendMessage(chatId, { text: `🔊 <@${target.split('@')[0]}> wurde entmutet.` }, { quoted: msg, contextInfo:{mentionedJid:[target]}});
    }
    else {
	  await delay();
      await sock.sendMessage(chatId, { text: '❗ Benutzung: ?mute enable @user [Zeit] oder ?mute disable @user' }, { quoted: msg });
    }
  }
};