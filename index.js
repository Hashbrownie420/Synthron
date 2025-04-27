global.botStartTime = Date.now();

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { delay } = require('./utils');

const ADMIN_GROUP_ID = '120363403067644626@g.us';
const commands = new Map();
let botStartTime = null;

// === Cooldown-Daten für jede Gruppe ===
const groupCooldowns = {};
const SPAM_COOLDOWN = 5000;  // 5 Sekunden Cooldown

// === Blacklist für Lesebestätigungen ===
const noReadChats = [
    '491782102904@s.whatsapp.net',
    '491726071134@s.whatsapp.net'
];

// === Funktion zum Laden des Präfixes aus der prefix.json ===
function getPrefixForGroup(groupId) {
    const filePath = 'prefix.json';
    if (!fs.existsSync(filePath)) return '?';
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data[groupId] || '?';
}

// === Mute-System ===
const muteFile = path.join(__dirname, 'mutes.json');
// muteStore wird bei jedem Message-Upsert neu geladen, damit Änderungen durch commands/mute.js sofort gelten
function loadMuteStore() {
    if (!fs.existsSync(muteFile)) return {};
    return JSON.parse(fs.readFileSync(muteFile, 'utf-8'));
}

// === Funktion zum Laden der Befehle ===
async function loadCommands() {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        if (command.name && command.execute) {
            commands.set(command.name, command.execute);
            console.log(`✅ Befehl geladen: ${command.name}`);
        }
    }
}

// === Bot starten ===
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
    });

    botStartTime = Date.now();

    sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'close') {
            console.log('❌ Verbindung getrennt, Neustart...');
            await startBot();
        }
        if (update.connection === 'open') {
            console.log('✅ Verbindung hergestellt');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const chatId = msg.key.remoteJid;
        const from = msg.key.participant || msg.key.remoteJid;

        // 1) Mute-Check: lösche Nachricht, wenn gemutet
        if (chatId.endsWith('@g.us')) {
            const muteStore = loadMuteStore();
            const groupMutes = muteStore[chatId] || {};
            const expiry = groupMutes[from];
            if (expiry !== undefined) {
                if (expiry === null || expiry > Date.now()) {
                    // Nachricht löschen und nicht weiter verarbeiten
                    await sock.sendMessage(chatId, { delete: msg.key });
                    return;
                } else {
                    // Mute abgelaufen → aus Store entfernen
                    delete groupMutes[from];
                    muteStore[chatId] = groupMutes;
                    fs.writeFileSync(muteFile, JSON.stringify(muteStore, null, 2));
                }
            }
        }

        // 2) Lesebestätigung
        if (!noReadChats.includes(chatId)) {
            await sock.readMessages([msg.key]);
        }

        // 3) Command-Handling
        const prefix = getPrefixForGroup(chatId);
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const sender = msg.key.remoteJid;
        const messageTimestamp = msg.messageTimestamp * 1000;
        if (messageTimestamp < botStartTime) return;

        if (text && text.startsWith(prefix)) {
            const now = Date.now();
            if (groupCooldowns[chatId] && now - groupCooldowns[chatId] < SPAM_COOLDOWN) {
                console.log(`🚫 Cooldown aktiv für Gruppe ${chatId}`);
                return;
            }
            groupCooldowns[chatId] = now;

            const fullArgs = text.slice(prefix.length).trim().split(/ +/);
            const baseCommand = fullArgs[0].toLowerCase();
            const args = fullArgs.slice(1);

            const command = commands.get(baseCommand);
            if (!command) {
                console.log(`❌ Unbekannter Befehl: ${baseCommand}`);
                return;
            }

            console.log(`📥 Befehl empfangen: "${baseCommand}" von ${sender}`);
            try {
                await command(sock, sender, args, msg);
                console.log(`📤 Antwort gesendet an: ${sender}`);
            } catch (err) {
                console.error(`❗ Fehler bei ${baseCommand}:`, err);
                await sock.sendMessage(sender, { text: '❌ Es ist ein Fehler aufgetreten. Der Entwickler wurde benachrichtigt.' });
                await sock.sendMessage(ADMIN_GROUP_ID, {
                    text: `❗ *Fehler bei Befehl:* ${baseCommand}\n👤 *Von:* ${sender}\n\n\`\`\`${err.stack || err}\`\`\``
                });
            }
        }

        // === Nosticker-Logik ===
        const status = require('./commands/nosticker'); // Lade das nosticker-Modul
        await status.onMessage(sock, msg); // Überprüfen und Sticker löschen, wenn deaktiviert
    });

}

// === Starten des Bots ===
loadCommands().then(startBot);