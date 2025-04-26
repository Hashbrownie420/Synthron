const { delay } = require('../utils'); // oder './utils' wenn utils.js im selben Ordner ist

module.exports = {
    name: 'echo',
    description: 'Sendet den eingegebenen Text zurück\nBenutzung: *?echo [Text]*',
    menu: 'Sendet den eingegebenen Text zurück',
    category: 'utility',
    execute: async (sock, sender, args) => {
        const text = args.join(' ');

        // Wenn keine Argumente (Text) übergeben wurden
        if (args.length === 0) {
            await delay(1000);
            await sock.sendMessage(sender, { text: '❗ Du musst einen Text eingeben!' });
            return;
        }

        // Überprüfen, ob das erste Zeichen ein Sonderzeichen ist
        const firstChar = text.charAt(0);
        const specialCharRegex = /[^a-zA-Z0-9\s]/; // Erlaubt nur Buchstaben, Zahlen und Leerzeichen

        if (specialCharRegex.test(firstChar)) {
            await delay(1000);
            await sock.sendMessage(sender, { text: '❌ Das erste Zeichen darf kein Sonderzeichen sein!' });
            return;
        }

        // Echo der Nachricht
        await delay(1000);
        await sock.sendMessage(sender, { text: text });
    }
};