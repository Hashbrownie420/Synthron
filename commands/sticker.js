const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'sticker',
    description: 'Erstellt Sticker und klaut/benennt Sticker um\n\nBenutzung:\nMarkiere ein Bild/Video/GIF und schreibe *?sticker* um daraus ein Sticker zu machen\nMit *?sticker steal [Text1] [Text2]* kannst du du den Sticker umbennen',
    menu: 'Erstelle und benenne Sticker',
    category: 'utility',
    execute: async (sock, sender, args, msg) => {
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await sock.sendMessage(sender, { text: '❌ Du musst ein Bild, Video, GIF oder Sticker markieren!' });
            return;
        }

        const isSteal = args[0] === 'steal';
        const pack = isSteal ? args[1] || 'Synthron' : 'Synthron';
        const author = isSteal ? args[2] || 'by Ecliptic' : 'by Ecliptic';

        // Media-Typen erkennen
        const isImage = !!quotedMsg.imageMessage;
        const isVideo = !!quotedMsg.videoMessage;
        const isSticker = !!quotedMsg.stickerMessage;

        if (!isImage && !isVideo && !isSticker) {
            await sock.sendMessage(sender, { text: '❌ Nur Bilder, Videos, GIFs oder Sticker sind erlaubt!' });
            return;
        }

        try {
            const stream = await downloadMediaMessage(
                {
                    key: msg.message.extendedTextMessage.contextInfo.stanzaId ? msg.message.extendedTextMessage.contextInfo.stanzaId : msg.key,
                    message: quotedMsg
                },
                'buffer'
            );

            const type = isSticker ? StickerTypes.FULL :
                         isImage ? StickerTypes.DEFAULT :
                         isVideo ? StickerTypes.FULL :
                         StickerTypes.DEFAULT;

            const sticker = new Sticker(stream, {
                type,
                pack,
                author
            });

            const buffer = await sticker.toBuffer();
            await sock.sendMessage(sender, { sticker: buffer });

        } catch (err) {
            console.error('❌ Fehler beim Erstellen des Stickers:', err);
            await sock.sendMessage(sender, { text: '❌ Fehler beim Erstellen des Stickers.' });
        }
    }
};