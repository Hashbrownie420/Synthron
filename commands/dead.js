const { delay } = require('../utils');

const killMessages = [
  "🔪 Synthron schneidet dir langsam die Kehle durch...",
  "☠️ Synthron zerquetscht deinen Schädel mit bloßen Händen...",
  "⚡ Synthron grillt dich bei lebendigem Leib mit Hochspannung...",
  "☠️ Synthron lässt dich von wilden Hunden zerfleischen...",
  "🔥 Synthron verbrennt dich in einem höllischen Feuer...",
  "🧟 Synthron verwandelt dich in einen willenlosen Zombie...",
  "⚔️ Synthron spießt dich auf seinem Schwert auf...",
  "☣️ Synthron infiziert dich mit einem tödlichen Virus...",
  "⛓️ Synthron reißt dir Gliedmaßen mit Ketten ab...",
  "⚙️ Synthron zermahlt dich in einer Maschinenpresse...",
  "☢️ Synthron taucht dich in radioaktives Gift...",
  "⚰️ Synthron beerdigt dich lebendig...",
  "❄️ Synthron friert dein Blut bis zum Zerreißen ein...",
  "☠️ Synthron wirft dich hungrigen Piranhas zum Fraß vor...",
  "⛰️ Synthron stößt dich von einer Klippe in den Abgrund...",
  "🩸 Synthron zapft dir jeden Tropfen Blut ab...",
  "⚡ Synthron lässt Blitze auf dich niederregnen...",
  "☠️ Synthron legt dir eine Giftschlange ins Bett...",
  "⚔️ Synthron spaltet deinen Körper in zwei Hälften...",
  "☣️ Synthron infiziert dich mit einer fleischfressenden Seuche...",
  "🔥 Synthron grillt dein Inneres von innen heraus...",
  "🔫 Synthron exekutiert dich ohne Gnade...",
  "⛓️ Synthron zerrt dich durch ein Meer aus Dornen...",
  "⚙️ Synthron zerschmettert deine Knochen Stück für Stück...",
  "☠️ Synthron zieht dir langsam die Haut ab...",
  "⚰️ Synthron nagelt dich lebendig in deinen Sarg...",
  "☢️ Synthron versenkt dich in einem Säurebad...",
  "⚡ Synthron schleudert dich in ein elektrisches Inferno...",
  "☣️ Synthron lässt mutierte Monster auf dich los...",
  "⚔️ Synthron zerstückelt dich mit chirurgischer Präzision...",
  "☠️ Synthron saugt deine Seele aus deinem Körper...",
  "❄️ Synthron lässt deinen Körper zu Eis zerbröseln...",
  "☠️ Synthron hetzt dir eine wilde Bestie auf den Hals...",
  "⚙️ Synthron presst dich in eine alte Eisenpresse...",
  "⛓️ Synthron stranguliert dich mit rostigen Ketten...",
  "🔥 Synthron steckt dich in einen brennenden Käfig...",
  "⚡ Synthron explodiert direkt neben dir...",
  "☣️ Synthron lässt dich an einem tödlichen Gas ersticken...",
  "☠️ Synthron bricht dir das Genick wie ein Streichholz...",
  "⚔️ Synthron enthauptet dich mit einem gezielten Schlag...",
  "☢️ Synthron vergiftet deinen Verstand und Körper...",
  "⚡ Synthron lässt deine Adern explodieren...",
  "☠️ Synthron treibt dir einen rostigen Nagel durchs Herz...",
  "🔥 Synthron verbrennt dir langsam das Fleisch von den Knochen...",
  "⚔️ Synthron zerreißt deine Eingeweide in Stücke...",
  "☣️ Synthron injiziert dir einen tödlichen Virus...",
  "⚰️ Synthron mauert dich in einer dunklen Gruft ein...",
  "☢️ Synthron verwandelt dich in verstrahlten Staub...",
  "❄️ Synthron erfriert dein Herz in Sekunden...",
  "☠️ Synthron lässt dich in Dunkelheit verrotten...",
  "⚡ Synthron stößt dich in ein Blitzgewitter...",
  "☠️ Synthron vergisst nie und kommt immer zurück...",
  "⛓️ Synthron fesselt dich in ewiger Qual...",
  "⚔️ Synthron schlitzt deine Träume auf...",
  "☢️ Synthron zerlegt deinen Körper Molekül für Molekül...",
  "⚡ Synthron bringt deine Organe zum Explodieren...",
  "☠️ Synthron umarmt dich - tödlich...",
  "🔥 Synthron verwandelt dein Leben in eine Feuersbrunst...",
  "⚙️ Synthron zermahlt deinen Schädel wie Papier...",
  "☣️ Synthron löst deine Haut in Säure auf...",
  "⚰️ Synthron schaufelt dein Grab eigenhändig...",
  "☠️ Synthron bezieht dein Zimmer mit Dunkelheit und Tod...",
  "⚡ Synthron schleudert dich gegen die Zeit selbst...",
  "☣️ Synthron lässt dich in Finsternis verschwinden...",
  "⚔️ Synthron zerreißt dein Herz mit bloßen Händen...",
  "☢️ Synthron entzieht dir jede Lebensenergie...",
  "⚡ Synthron zerstört deine Existenz auf allen Ebenen...",
  "☠️ Synthron verfolgt dich bis in deine Träume...",
  "⛓️ Synthron wirft dich in endlose Tiefen...",
  "🔥 Synthron entzündet ein ewiges Feuer in dir...",
  "⚔️ Synthron schickt deine Seele ins Nichts...",
  "☣️ Synthron zerstäubt dich mit einem Todesstrahl...",
  "⚙️ Synthron zerbricht deine Knochen wie Äste...",
  "☢️ Synthron infiziert dich mit tödlichem Strahlenfieber...",
  "⚡ Synthron sprengt dich in tausend Teile...",
  "☠️ Synthron lässt dich an purer Angst sterben...",
  "⚔️ Synthron schnitzt ein Kunstwerk aus deinem Körper...",
  "☣️ Synthron lässt dich in endloser Agonie sterben...",
  "⚰️ Synthron vernagelt dein Schicksal für immer...",
  "☢️ Synthron kocht dein Blut in deinen Adern...",
  "❄️ Synthron friert dein Inneres zu Stein...",
  "☠️ Synthron hetzt dir alptraumhafte Kreaturen auf den Hals...",
  "⚡ Synthron jagt einen Blitz durch dein Herz...",
  "☣️ Synthron löscht dein Gedächtnis und deinen Atem...",
  "⚔️ Synthron zerschneidet dein Schicksal mit seiner Klinge...",
  "☠️ Synthron holt dich aus der Welt der Lebenden...",
  "⚙️ Synthron zerquetscht dein Dasein mit kalter Präzision...",
  "☢️ Synthron entfesselt eine atomare Hölle auf dich...",
  "⚡ Synthron zerreißt dein Bewusstsein in Stücke...",
  "☠️ Synthron entzieht dir alle Hoffnung...",
  "🔥 Synthron verbrennt deine Existenz aus dem Gedächtnis der Welt...",
  "⚔️ Synthron reißt die Zeit auf und löscht dich aus...",
  "☣️ Synthron vernichtet deinen letzten Atemzug...",
  "⚙️ Synthron verarbeitet dich zu Staub...",
  "☢️ Synthron blendet dich mit tödlichem Licht...",
  "⚡ Synthron zieht dir den Boden unter den Füßen weg...",
  "☠️ Synthron beendet dich... auf seine ganz eigene Art."
];

// Automatisch 100 Sprüche generieren falls du willst:
for (let i = killMessages.length; i < 100; i++) {
  killMessages.push(`☠️ Synthron findet eine neue brutale Art, dich zu vernichten (#${i + 1})...`);
}

module.exports = {
  name: 'dead',
  description: 'Synthron bringt dich auf blutige Weise um.',
  menu: 'Blutige Tötungssprüche',
  category: 'fun', // Spaßkategorie

  execute: async (sock, sender, args, msg) => {
    const randomIndex = Math.floor(Math.random() * killMessages.length);
    const chosenMessage = killMessages[randomIndex];

    await delay(500); // kleine Verzögerung für mehr Drama
    await sock.sendMessage(msg.key.remoteJid, { text: chosenMessage });
  }
};