// dsgvo.js
module.exports = {
    name: 'dsgvo',
    description: 'Sendet die Datenschutzerklärung des Bots.\n\nBenutzung:\n*?dsgvo*',
    menu: 'Zeige die Datenschutzerklärung',
    category: 'info',
    async execute(sock, sender, args, msg) {
        const dsgvoText = `
**Datenschutzerklärung für den Bot**

1. **Verantwortliche Stelle**  
Verantwortlich für die Datenverarbeitung ist:  
- **Janek (Owner)**, erreichbar unter +4915739034434 (WhatsApp)  
- **Sophie (Zweitowner und Botteam)**, erreichbar unter +491728853747 (WhatsApp)

2. **Erhebung und Speicherung von Daten**  
Es werden Gruppeninformationen gespeichert (MetaDaten von WhatsApp, unter anderem Gruppen/Chatid, Senderid). Zusätzlich werden Nachrichten ausgelesen, aber nicht dauerhaft gespeichert.  
Für den *fight* Befehl werden die IDs des Senders gespeichert, um ein Leaderboard und Statistiken anzeigen zu können. Diese Daten werden in einer JSON-Datei auf einem Server gespeichert.

3. **Zweck der Datenverarbeitung**  
Die gespeicherten Daten dienen ausschließlich dazu, Funktionen wie Leaderboards, Statistiken und den *fight* Befehl zu ermöglichen.

4. **Dauer der Datenspeicherung**  
Die gespeicherten Daten werden immer gespeichert, bis eine Löschung beantragt wird.

5. **Zugriff auf die Daten**  
Nur das Botteam hat Zugang zu den gespeicherten Daten und kann diese abfragen. Der Zugriff ist auf den Owner (Janek), die Admins und Supporter des Botteams beschränkt.

6. **Recht auf Löschung der Daten**  
Jeder Nutzer hat das Recht, seine Daten löschen zu lassen. Um deine Daten zu löschen, wende dich bitte an den Owner des Bots:  
- **Janek (Owner):** +4915739034434 (WhatsApp)  
- **Direktlink für Kontakt:** wa.me/4915739034434?text=Ich+möchte+meine+daten+löschen

7. **Datenweitergabe**  
Die gespeicherten Daten werden nicht an Dritte weitergegeben, außer es besteht eine gesetzliche Verpflichtung zur Weitergabe der Daten.

8. **Änderung der Datenschutzerklärung**  
Diese Datenschutzerklärung kann von Zeit zu Zeit aktualisiert werden. Änderungen werden auf der gleichen Stelle veröffentlicht.



Diese Datenschutzerklärung gilt ab dem Datum der Veröffentlichung und bleibt in Kraft, bis sie aktualisiert wird.
`;

        await sock.sendMessage(sender, {
            text: dsgvoText
        });
    }
};