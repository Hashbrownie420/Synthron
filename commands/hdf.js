const { delay } = require("../utils");

// dsgvo.js
module.exports = {
    name: 'hdf',
    description: 'Ein kleiner Funbefehl ^^.\n\nBenutzung:\n*?hdf*',
    menu: 'Kleiner Funbefehl',
    category: 'fun',
    async execute(sock, sender, args, msg) {
        const hdfText = `
Das ist das einzige was dir einfällt? Mein Gott halt doch selbst die Fresse.
Ich hoffe du trittst auf einen Legostein mein lieber. `;

		await delay();
        await sock.sendMessage(sender, {
            text: hdfText
        });
    }
};