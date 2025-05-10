module.exports = {
  name: 'pm2',
  description: 'Starte, stoppe oder starte den Server neu.',
  menu: 'Verwalte den Server',
  category: 'team',
  async execute(sock, sender, args, msg) {
    const ownerNumbers = [
      '4915739034434', // Deine WhatsApp-Nummern ohne @s.whatsapp.net
      '491728853747',
    ];

    // Überprüfen, ob es sich um eine private Nachricht oder eine Gruppen-Nachricht handelt
    let participant;
    if (msg.key.remoteJid.endsWith('@g.us')) {
      // Wenn es eine Gruppen-Nachricht ist, dann `msg.key.participant`
      participant = msg.key.participant.split('@')[0];  // Entferne die Endung @s.whatsapp.net
    } else {
      // In einer privaten Nachricht ist der Sender direkt der `sender`
      participant = sender.split('@')[0];  // Entferne die Endung @s.whatsapp.net
    }

    console.log('Sender:', sender);  // Ausgabe des senders
    console.log('Participant:', participant);  // Ausgabe des participants

    // Berechtigung prüfen
    if (!ownerNumbers.includes(participant)) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Du hast keine Berechtigung.' });
      return;
    }

    // Argument prüfen
    if (!args.length) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❗ Bitte gib einen Befehl an: start, stop oder restart.' });
      return;
    }

    const action = args[0].toLowerCase();
    let pm2cmd, infoText;
    switch (action) {
      case 'start':
        pm2cmd = 'pm2 start index.js';
        infoText = '🔄 Starte den Bot mit PM2…';
        break;
      case 'stop':
        pm2cmd = 'pm2 stop index.js';
        infoText = '🔄 Stoppe den Bot mit PM2…';
        break;
      case 'restart':
        pm2cmd = 'pm2 restart index.js';
        infoText = '🔄 Starte den Bot neu mit PM2…';
        break;
      default:
        await sock.sendMessage(msg.key.remoteJid, { text: '❗ Ungültiger Befehl. Nutze: start, stop oder restart.' });
        return;
    }

    await sock.sendMessage(msg.key.remoteJid, { text: infoText });

    const { exec } = require('child_process');
    exec(pm2cmd, async (err, stdout, stderr) => {
      if (err) {
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ Fehler beim Ausführen von PM2:\n${err.message}` });
        return;
      }
      if (stderr) {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ PM2 meldet Warnung:\n${stderr}` });
      }

      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const synthronMsg =
        `📜 *Synthron Nachricht* 📜\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📌 *Antwort:*\n\n` +
        `Dein PM2-Command *${action}* wurde ausgeführt.\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${hh}.${mm} Uhr`;
      await sock.sendMessage(msg.key.remoteJid, { text: synthronMsg });
    });
  }
};