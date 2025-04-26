global.botStartTime = Date.now();

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { delay } = require('./utils'); // Importiere die delay-Funktion aus der utils.js

const ADMIN_GROUP_ID = '120363403067644626@g.us';
const commands = new Map();
let botStartTime = null;

// === Cooldown-Daten für jede Gruppe ===
const groupCooldowns = {};
const SPAM_COOLDOWN = 5000;  // 5 Sekunden Cooldown

// === Funktion zum Laden des Präfixes aus der prefix.json ===
function getPrefixForGroup(groupId) {
    const filePath = 'prefix.json';
    if (!fs.existsSync(filePath)) return '?';
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data[groupId] || '?';
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

    botStartTime = new Date().getTime();

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

        const groupId = msg.key.remoteJid;
        const prefix = getPrefixForGroup(groupId);
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const sender = msg.key.remoteJid;

        const messageTimestamp = msg.messageTimestamp * 1000;
        if (messageTimestamp < botStartTime) return;

        const now = Date.now();

        if (text && text.startsWith(prefix)) {
            if (groupCooldowns[groupId] && now - groupCooldowns[groupId] < SPAM_COOLDOWN) {
                console.log(`🚫 Cooldown aktiv für Gruppe ${groupId}`);
                return;
            }

            groupCooldowns[groupId] = now;

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
    });

}

// === Starten des Bots ===
loadCommands().then(startBot);