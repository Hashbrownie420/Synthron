const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'sticker',
  description: 'Erstellt Sticker und klaut/benennt Sticker um\n\nBenutzung:\nMarkiere ein Bild, Video, GIF oder Sticker und schreibe *?sticker*.\nMit *?sticker steal [Packname] [Autor]* kannst du den Sticker umbennen.',
  menu: 'Erstelle und benenne Sticker',
  category: 'utility',

  execute: async (sock, sender, args, msg) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedContext = msg.message?.extendedTextMessage?.contextInfo;

    if (!quoted) {
      await sock.sendMessage(sender, { text: '❌ Du musst ein Bild, Video, GIF oder Sticker markieren!' });
      return;
    }

    const isSteal = args[0]?.toLowerCase() === 'steal';
    const pack = isSteal ? (args[1] || 'Synthron') : 'Synthron';
    const author = isSteal ? (args[2] || 'by Ecliptic') : 'by Ecliptic';

    const isImage = !!quoted.imageMessage;
    const isVideo = !!quoted.videoMessage;
    const isSticker = !!quoted.stickerMessage;

    if (!isImage && !isVideo && !isSticker) {
      await sock.sendMessage(sender, { text: '❌ Nur Bilder, Videos, GIFs oder Sticker sind erlaubt!' });
      return;
    }

    try {
      const stream = await downloadMediaMessage(
        { key: { id: quotedContext.stanzaId, remoteJid: quotedContext.participant || sender }, message: quoted },
        'buffer'
      );

      if (isVideo) {
        const tmp = path.join(__dirname, 'tmp');
        if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

        const input = path.join(tmp, `in_${Date.now()}.mp4`);
        const output = path.join(tmp, `out_${Date.now()}.webp`);

        fs.writeFileSync(input, stream);

        await new Promise((resolve, reject) => {
          ffmpeg(input)
            .outputOptions([
              '-vf', 'scale=400:400:force_original_aspect_ratio=decrease,fps=6',
              '-vcodec', 'libwebp',
              '-lossless', '0',
              '-qscale:v', '60',
              '-compression_level', '9',
              '-loop', '0',
              '-an',
              '-vsync', '0'
            ])
            .output(output)
            .on('end', resolve)
            .on('error', reject)
            .run();
        });

        const webp = fs.readFileSync(output);
        const sticker = new Sticker(webp, {
          pack,
          author,
          type: StickerTypes.FULL,
          quality: 80,
          background: 'transparent',
          animated: true
        });
        const buf = await sticker.toBuffer();
        await sock.sendMessage(sender, { sticker: buf });

        fs.unlinkSync(input);
        fs.unlinkSync(output);

      } else {
        const sticker = new Sticker(stream, {
          pack,
          author,
          type: isSticker ? StickerTypes.FULL : StickerTypes.DEFAULT,
          quality: 80,
          background: 'transparent',
          animated: false
        });
        const buf = await sticker.toBuffer();
        await sock.sendMessage(sender, { sticker: buf });
      }

    } catch (e) {
      console.error('Fehler beim Sticker:', e);
      await sock.sendMessage(sender, { text: '❌ Fehler beim Erstellen des Stickers.' });
    }
  }
};