const fs = require('fs');
const path = require('path');
const { delay } = require('../utils'); // passe ggf. den Pfad an

// Pfad zur Bot-Team-Datei
const teamFile = path.join(__dirname, '../botTeamData.json');

module.exports = {
  name: 'leave',
  description: 'Lässt den Bot die Gruppe verlassen\n\nBenutzung: *?leave*',
  menu: 'Bot verlassen lassen',
  category: 'admin',

  async execute(sock, sender, args, msg) {
    const chatId = msg.key.remoteJid;

    // Nur in Gruppen zulassen
    if (!chatId.endsWith('@g.us')) {
	  await delay();
      return sock.sendMessage(chatId, { text: '❌ Dieser Befehl funktioniert nur in Gruppen!' }, { quoted: msg });
    }

    // 1) Ermittle Absender-JID und Nummer
    const senderJid = msg.key.participant;          // z.B. "491711234567@s.whatsapp.net"
    const senderNum = senderJid.split('@')[0];      // z.B. "491711234567"

    // 2) Lade Gruppen-Metadaten und prüfe echten Gruppen-Admin
    let isGroupAdmin = false;
    try {
      const meta = await sock.groupMetadata(chatId);
      isGroupAdmin = meta.participants.some(p =>
        p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } catch (e) {
      console.error('Konnte groupMetadata nicht laden:', e);
    }

    // 3) Lade Bot-Team-Daten und prüfe Bot-Owner/Team-Admin
    let teamData = {};
    if (fs.existsSync(teamFile)) {
      teamData = JSON.parse(fs.readFileSync(teamFile, 'utf-8'));
    }
    const role = teamData[senderNum]; // "Owner" | "Admin" | undefined

    // 4) Erlaubnis-Check: echte Gruppen-Admin ODER Bot-Owner/Team-Admin
    if (!isGroupAdmin && role !== 'Owner' && role !== 'Admin') {
      await delay();
      return sock.sendMessage(
        chatId,
        { text: '❌ Nur Gruppen-Admins oder Bot-Owner/Team-Admins dürfen mich aus der Gruppe schicken!' },
        { quoted: msg }
      );
    }

    // 5) Bestätigung an die Gruppe
    await delay();
    await sock.sendMessage(chatId, { text: '👋 Ich verlasse die Gruppe auf Wunsch der Admins.' }, { quoted: msg });

    // 6) Bot verlässt die Gruppe
    try {
      await sock.groupLeave(chatId);
    } catch (e) {
      console.error('Fehler beim Verlassen der Gruppe:', e);
      await sock.sendMessage(chatId, { text: '⚠️ Ich konnte die Gruppe leider nicht verlassen.' }, { quoted: msg });
    }
  }
};