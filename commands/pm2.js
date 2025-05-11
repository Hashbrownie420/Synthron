const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner

module.exports = {
  name: 'pm2',
  description: 'Starte, stoppe, starte neu oder zeige Logs.',
  menu: 'Verwalte den Server',
  category: 'team',
  async execute(sock, sender, args, msg) {
    const ownerNumbers = [
      '4915739034434',
      '491728853747',
    ];

    let participant;
    if (msg.key.remoteJid.endsWith('@g.us')) {
      participant = msg.key.participant.split('@')[0];
    } else {
      participant = sender.split('@')[0];
    }

    console.log('Sender:', sender);
    console.log('Participant:', participant);

    if (!ownerNumbers.includes(participant)) {
	  await delay();
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Du hast keine Berechtigung.' });
      return;
    }

    if (!args.length) {
	  await delay();
      await sock.sendMessage(msg.key.remoteJid, { text: '❗ Bitte gib einen Befehl an: start, stop, restart oder logs.' });
      return;
    }

    const action = args[0].toLowerCase();
    let pm2cmd, infoText;
    switch (action) {
      case 'start':
        pm2cmd = 'pm2 start Synthron'
        infoText = '🔄 Starte den Bot mit PM2…';
        break;
      case 'stop':
        pm2cmd = 'pm2 stop Synthron';
        infoText = '🔄 Stoppe den Bot mit PM2…';
        break;
      case 'restart':
        pm2cmd = 'pm2 restart Synthron';
        infoText = '🔄 Starte den Bot neu mit PM2…';
        break;
      case 'logs':
        pm2cmd = 'pm2 logs Synthron --lines 30 --nostream'; // Nur 30 Zeilen
        infoText = '📖 Lade die letzten Logs…';
        break;
      default:
	    await delay();
        await sock.sendMessage(msg.key.remoteJid, { text: '❗ Ungültiger Befehl. Nutze: start, stop, restart oder logs.' });
        return;
    }

	await delay();
    await sock.sendMessage(msg.key.remoteJid, { text: infoText });

    const { exec } = require('child_process');
    exec(pm2cmd, async (err, stdout, stderr) => {
      if (err) {
		await delay();
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ Fehler beim Ausführen von PM2:\n${err.message}` });
        return;
      }
      if (stderr && action !== 'logs') {
		await delay();
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ PM2 meldet Warnung:\n${stderr}` });
      }

      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');

      if (action === 'logs') {
        const logs = stdout.trim();
        if (!logs) {
			await delay();
          await sock.sendMessage(msg.key.remoteJid, { text: '❌ Keine Logs gefunden.' });
          return;
        }

        // Logs schön formatiert in einer Nachricht senden
        const message =
          `📜 *Synthron Logs* 📜\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📌 *Letzte 30 Zeilen:*\n\n` +
          `${logs}\n\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `${hh}.${mm} Uhr`;

		await delay();
        await sock.sendMessage(msg.key.remoteJid, { text: message });
      } else {
        const synthronMsg =
          `📜 *Synthron Nachricht* 📜\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📌 *Antwort:*\n\n` +
          `Dein PM2-Command *${action}* wurde ausgeführt.\n\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `${hh}.${mm} Uhr`;
		await delay();
        await sock.sendMessage(msg.key.remoteJid, { text: synthronMsg });
      }
    });
  }
};