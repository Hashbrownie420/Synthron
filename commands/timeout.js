// commands/timeout.js
const fs = require('fs');
const path = require('path');
const { delay } = require('../utils');  // ggf. Pfad anpassen

// Pfad zu eurem Bot-Team (Owner/Admins)
const teamFile = path.join(__dirname, '../botTeamData.json');

module.exports = {
  name: 'timeout',
  description: 'Schaltet “Nur-Admins dürfen schreiben” (Timeout) in der Gruppe ein oder aus\n\nBenutzung: *?timeout enable* oder *?timeout disable*',
  menu: 'Gruppen-Timeout',
  category: 'admin',

  async execute(sock, sender, args, msg) {
    const chatId = msg.key.remoteJid;

    // Nur in Gruppen zulassen
    if (!chatId.endsWith('@g.us')) {
	  await delay();
      return sock.sendMessage(chatId, { text: '❌ Dieser Befehl funktioniert nur in Gruppen!' }, { quoted: msg });
    }

    // Ermittle Absender-JID und Nummer
    const senderJid = msg.key.participant;       // z.B. "491711234567@s.whatsapp.net"
    const senderNum = senderJid.split('@')[0];   // z.B. "491711234567"

    // Lade Gruppen-Metadaten und prüfe echten Gruppen-Admin
    let isGroupAdmin = false;
    try {
      const meta = await sock.groupMetadata(chatId);
      isGroupAdmin = meta.participants.some(p =>
        p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } catch (e) {
      console.error('Konnte groupMetadata nicht laden:', e);
    }

    // Lade Bot-Team-Daten und prüfe Bot-Owner/Team-Admin
    let teamData = {};
    if (fs.existsSync(teamFile)) {
      teamData = JSON.parse(fs.readFileSync(teamFile, 'utf-8'));
    }
    const role = teamData[senderNum]; // "Owner" | "Admin" | undefined

    // Erlaubnis-Check: echte Gruppen-Admin ODER Bot-Owner/Team-Admin
    if (!isGroupAdmin && role !== 'Owner' && role !== 'Admin') {
      await delay();
      return sock.sendMessage(
        chatId,
        { text: '❌ Nur Gruppen-Admins oder Bot-Owner/Team-Admins dürfen das Timeout setzen!' },
        { quoted: msg }
      );
    }

    // Sub-Command prüfen
    const sub = args[0]?.toLowerCase();
    if (sub !== 'enable' && sub !== 'disable') {
      await delay();
      return sock.sendMessage(
        chatId,
        { text: '❗ Benutzung: *?timeout enable* oder *?timeout disable*' },
        { quoted: msg }
      );
    }

    const restrict = sub === 'enable';
    try {
      // announcement = nur Admins dürfen schreiben; not_announcement = alle dürfen schreiben
      await sock.groupSettingUpdate(chatId, restrict ? 'announcement' : 'not_announcement');
      await delay();
      const reply = restrict
        ? '🔇 Timeout aktiviert: Nur Admins dürfen jetzt schreiben.'
        : '🔊 Timeout deaktiviert: Jeder darf wieder schreiben.';
      await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    } catch (e) {
      console.error('Fehler beim Ändern der Gruppen-Einstellung', e);
	  await delay();
      await sock.sendMessage(chatId, { text: '⚠️ Konnte das Timeout nicht ändern.' }, { quoted: msg });
    }
  }
};