const fs = require('fs');
const path = require('path');
const { delay } = require('../utils'); // delay aus utils.js importieren

// === KONFIGURATION ===
const SUPPORT_FILE = path.join(__dirname, '../supportRequests.json'); // Prüfen des Pfades zur Datei
const TEAM_GROUP_ID = '120363419565553363@g.us'; // Die ID der Teamgruppe
const ANSWER_GROUP_ID = '120363418928335716@g.us'; // Die ID der Gruppe, in der die Antwort gesendet werden soll

// === Utils ===
function loadJson(file) {
    if (!fs.existsSync(file)) {
        return { requests: [], nextId: 100 }; // Leeres Array zurückgeben und nextId auf 100 setzen
    }
    try {
        const data = fs.readFileSync(file, 'utf8');
        const parsedData = JSON.parse(data); // Versuche, die Datei zu laden
        if (!Array.isArray(parsedData.requests)) {
            parsedData.requests = []; // Falls "requests" kein Array ist, auf leeres Array setzen
        }
        if (typeof parsedData.nextId !== 'number') {
            parsedData.nextId = 100; // Falls "nextId" nicht gesetzt ist, auf 100 setzen
        }
        return parsedData;
    } catch (error) {
        return { requests: [], nextId: 100 }; // Falls Fehler beim Parsen auftritt, ein leeres Objekt zurückgeben und nextId auf 100 setzen
    }
}

function saveJson(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fehler beim Speichern der JSON-Datei:', error);
    }
}

function isValidNumber(number) {
    return /^\d+$/.test(number);
}

// === Support System ===
module.exports = {
    name: 'support',
    description: 'Supportanfrage an das Team senden\n\nBenutzung:\nVerwende *?support [Text]* um eine Supportanfrage an das Team zu senden',
    menu: 'Sende ein Hilfeschrei an das Team',
    category: 'info',
    execute: async (sock, sender, args, msg) => {
        const from = msg.key.remoteJid;
        const senderNum = (msg.key.participant || sender).split('@')[0];
        const subCommand = args[0]?.toLowerCase();  // Subbefehl (z.B. answer, list, close)
        const supportData = loadJson(SUPPORT_FILE); // Lade die Support-Daten
        const teamData = loadJson(path.join(__dirname, '../botTeamData.json')); // Teamdaten laden

        // === Überprüfen, ob requests als Array vorliegt ===
        if (!Array.isArray(supportData.requests)) {
            await delay();
            return sock.sendMessage(from, { text: '❗ Es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.' });
        }

        // === Überprüfen, ob Subbefehl vorhanden ist ===
        if (subCommand === 'answer') {
            const requestId = parseInt(args[1]);
            const responseText = args.slice(2).join(' ');

            if (!requestId || !responseText) {
                await delay();
                return sock.sendMessage(from, { text: '❗ Nutzung: `?support answer [ID] [Antwort]`' });
            }

            // Überprüfen, ob der Sender mindestens die Rolle Supporter, Admin oder Owner hat
            const senderRole = teamData[senderNum];
            if (!senderRole || (senderRole !== 'Supporter' && senderRole !== 'Admin' && senderRole !== 'Owner')) {
                await delay();
                return sock.sendMessage(from, { text: '🚫 *Nur Teammitglieder mit den Rollen Supporter, Admin oder Owner dürfen Anfragen beantworten.*' });
            }

            // Anfrage in den Support-Daten finden
            const request = supportData.requests.find(r => r.id === requestId && r.status === 'offen');
            if (!request) {
                await delay();
                return sock.sendMessage(from, { text: '❌ Anfrage nicht gefunden oder bereits geschlossen.' });
            }

            // Anfrage als beantwortet markieren
            request.status = 'beantwortet';
            saveJson(SUPPORT_FILE, supportData);

            // Antwort in die Antwort-Gruppe senden
            const answerMessage = `🔧 *Antwort auf Support-Anfrage (ID: ${requestId})*\n\n\n*Anliegen:* ${request.text}\n\n*Antwort:* ${responseText}\n\n\n*Beantwortet von:* ${senderNum}`;
            await delay();
            sock.sendMessage(ANSWER_GROUP_ID, { text: answerMessage });

            await delay();
            return sock.sendMessage(from, { text: `✅ Deine Antwort wurde gespeichert und an die Antwortgruppe gesendet.` });
        }

        // === Liste der offenen Anfragen ===
        if (subCommand === 'list') {
            // Überprüfen, ob der Sender mindestens die Rolle Supporter, Admin oder Owner hat
            const senderRole = teamData[senderNum];
            if (!senderRole || (senderRole !== 'Supporter' && senderRole !== 'Admin' && senderRole !== 'Owner')) {
                await delay();
                return sock.sendMessage(from, { text: '🚫 *Nur Teammitglieder mit den Rollen Supporter, Admin oder Owner dürfen offene Anfragen anzeigen.*' });
            }

            if (supportData.requests.length === 0) {
                await delay();
                return sock.sendMessage(from, { text: '📭 *Keine offenen Anfragen.*' });
            }

            let text = '📋 *Offene Support-Anfragen:*\n\n';
            supportData.requests.forEach(request => {
                if (request.status === 'offen') {
                    text += `🆔 *ID:* ${request.id} ➝ *Anliegen:* ${request.text} _(von ${request.sender})_\n`;
                }
            });

            if (text === '📋 *Offene Support-Anfragen:*\n\n') {
                await delay();
                return sock.sendMessage(from, { text: '📭 *Keine offenen Anfragen.*' });
            }

            await delay();
            return sock.sendMessage(from, { text });
        }

        // === Anfrage schließen (nach Beantwortung) ===
        if (subCommand === 'close') {
            // Überprüfen, ob der Sender mindestens die Rolle Supporter, Admin oder Owner hat
            const senderRole = teamData[senderNum];
            if (!senderRole || (senderRole !== 'Supporter' && senderRole !== 'Admin' && senderRole !== 'Owner')) {
                await delay();
                return sock.sendMessage(from, { text: '🚫 *Nur Teammitglieder mit den Rollen Supporter, Admin oder Owner dürfen Anfragen schließen.*' });
            }

            const requestId = parseInt(args[1]);
            await delay();
            if (!requestId) return sock.sendMessage(from, { text: '❗ Nutzung: `?support close [ID]`' });

            const index = supportData.requests.findIndex(r => r.id === requestId && r.status === 'offen');
            await delay();
            if (index === -1) return sock.sendMessage(from, { text: '❌ Anfrage nicht gefunden oder bereits geschlossen.' });

            const closedRequest = supportData.requests[index];
            closedRequest.status = 'geschlossen'; // Anfrage als geschlossen markieren
            saveJson(SUPPORT_FILE, supportData);

            // Nachricht an den Anfragensteller senden, dass die Anfrage geschlossen wurde
            await delay();
            sock.sendMessage(closedRequest.sender + '@s.whatsapp.net', { 
                text: `❗ Deine Support-Anfrage (ID: ${requestId}) wurde leider geschlossen und wird nicht beantwortet.` 
            });

            await delay();
            return sock.sendMessage(from, { text: `✅ Anfrage #${requestId} wurde geschlossen und der Anfragensteller informiert.` });
        } 

        // === Neue Support-Anfrage (Wenn kein Subbefehl) ===
        const supportText = args.join(' ');
        if (!supportText) {
            await delay();
            return sock.sendMessage(from, { text: '❗ Bitte gib deine Anfrage an.' });
        }

        const newRequest = {
            id: supportData.nextId, // Setze die ID auf den nächsten Wert
            sender: senderNum,
            text: supportText,
            status: 'offen' // Offen bedeutet, dass die Anfrage noch nicht bearbeitet wurde
        };

        supportData.requests.push(newRequest);
        supportData.nextId += 1; // Erhöhe die nächste ID für die nächste Anfrage
        saveJson(SUPPORT_FILE, supportData);

        // Nachricht an die Teamgruppe senden
        const supportMessage = `🔧 *Neue Support-Anfrage* (ID: ${newRequest.id})\n\n*Anliegen:* ${newRequest.text}\n*Anfrage von:* ${newRequest.sender}`;
        await delay();
        sock.sendMessage(TEAM_GROUP_ID, { text: supportMessage });

        await delay();
        return sock.sendMessage(from, { text: `✅ Deine Anfrage wurde gespeichert.\nID: ${newRequest.id}\n\nSobald die Anfrage bearbeitet wurde, findest du Sie hier:\nhttps://chat.whatsapp.com/CWjGbXu5qdEDnfdogoaJM3` });
    }
};