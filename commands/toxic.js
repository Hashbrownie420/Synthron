const { description } = require("./cringe");
const { category } = require("./sticker");
const { delay } = require("../utils");

const toxicMap = {
    0: '0% – Dieser Mensch heilt toxische Beziehungen allein mit seiner Anwesenheit.',
    1: '1% – Fast ein Engel, nur manchmal ein bisschen nervig.',
    2: '2% – Gibt dir Wasser, wenn du am Verdursten bist, aber vorher ein Kommentar dazu.',
    3: '3% – Macht einmal im Monat einen toxischen Witz.',
    4: '4% – Meckert über die Lautstärke, hört aber selbst Deutschrap auf Anschlag.',
    5: '5% – Leicht angeekelt von zu viel Harmonie.',
    6: '6% – Ein Screenshot hier und da. Just in case.',
    7: '7% – Liest Nachrichten und antwortet absichtlich nicht direkt.',
    8: '8% – Redet in "ich sag ja nur" Phrasen.',
    9: '9% – Stalkt deinen Status und regt sich über Smileys auf.',
    10: '10% – Hat dich entfolgt, aber stalkt über Zweitaccount.',
    11: '11% – Wird still, wenn du Recht hast.',
    12: '12% – Lässt dich ausreden... nur um dann doppelt so laut zurückzuschießen.',
    13: '13% – Ghostet Leute, wenn er/sie einen schlechten Tag hat.',
    14: '14% – Schreibt "Haha" aber lacht nie.',
    15: '15% – Merkt sich jeden Fehler – wie ein persönliches Archiv.',
    16: '16% – Schickt dir Reels, um passiv-aggressiv zu sein.',
    17: '17% – Sagt "mach wie du willst", meint aber "mach was ich will".',
    18: '18% – Macht beim Uno-Spielen ernsthafte Feindschaften.',
    19: '19% – Lacht über dein Sternzeichen, aber glaubt an Karma.',
    20: '20% – Ist auf einmal leise, wenn’s um eigene Fehler geht.',
    21: '21% – Verliert Diskussionen und verlässt den Chat.',
    22: '22% – Mischt sich in Dramen ein, obwohl’s ihn nix angeht.',
    23: '23% – Macht dir Komplimente... mit Beleidigungen drin.',
    24: '24% – "Ich bin nicht eifersüchtig, aber wer ist das?"',
    25: '25% – Weiß ganz genau, wie man mit einem Satz dein Selbstwertgefühl killt.',
    26: '26% – Macht sich über deine Playlist lustig, hört aber selber Schlager.',
    27: '27% – Gibt Ratschläge, die niemand wollte.',
    28: '28% – Ist passiv-aggressiv auf einem Profi-Level.',
    29: '29% – Fragt "Was los?", aber liest nicht die Antwort.',
    30: '30% – Benutzt deine Worte später gegen dich.',
    31: '31% – Lacht über Leute, die emotionale Intelligenz haben.',
    32: '32% – Hört bei Diskussionen nur um zu antworten, nicht zu verstehen.',
    33: '33% – Erkennt Fehler, macht sie aber trotzdem weiter.',
    34: '34% – "Hab ich nie gesagt!" – obwohl du den Screenshot hast.',
    35: '35% – Wird passiv, wenn er verliert – dann blockiert er dich.',
    36: '36% – "Ich bin ehrlich" heißt bei ihm/ihr = toxisch verpackt.',
    37: '37% – Legt alles auf die Goldwaage, aber selbst wie ein Vorschlaghammer.',
    38: '38% – Lässt dich extra warten, nur um Kontrolle zu behalten.',
    39: '39% – Lebt für Subtweets und Story-Passiv-Aggression.',
    40: '40% – Ist der Grund, warum "Seen" weh tut.',
    41: '41% – Will Streit gewinnen, nicht lösen.',
    42: '42% – Argumentiert wie ein Politiker.',
    43: '43% – Gibt zu, toxisch zu sein – als wär’s cool.',
    44: '44% – War früher in jeder WhatsApp-Gruppe Admin.',
    45: '45% – Nutzt Zodiac als Ausrede für schlechtes Verhalten.',
    46: '46% – Sag "nein" und du siehst die dunkle Seite.',
    47: '47% – Wirft dir deine Vergangenheit täglich vor.',
    48: '48% – Postet Deep Quotes, lebt aber gegenteilig.',
    49: '49% – Macht sich Notizen, was du falsch gemacht hast.',
    50: '50% – Half Devil, Half Saint.',
    51: '51% – Redet wie dein Therapeut, handelt wie dein Ex.',
    52: '52% – Spielt Engel vor anderen, ist privat das Chaos.',
    53: '53% – Kann keine Kritik vertragen, aber teilt sie großzügig.',
    54: '54% – War bei jeder Beziehung „das Opfer“.',
    55: '55% – Sieht toxische Posts und fühlt sich angesprochen.',
    56: '56% – Hat noch 20 ungeklärte DMs mit Exen.',
    57: '57% – Streitet sich gern um Prinzipien, nicht um Inhalt.',
    58: '58% – Macht aus jeder Mücke nen Elefanten.',
    59: '59% – Sagt dir, dass du überreagierst, obwohl du ruhig warst.',
    60: '60% – "Witzige" Beleidigungen seit 2003.',
    61: '61% – Ist so sarkastisch, dass keiner mehr weiß, was ernst ist.',
    62: '62% – Hat passive Aggression in der Bio stehen.',
    63: '63% – Ist nie schuld. Immer du.',
    64: '64% – Drama ist sein/ihr Frühstück.',
    65: '65% – Hält Versprechen wie TikTok Trends – kurzlebig.',
    66: '66% – Mach aus einem „Hi“ ein Weltuntergangsgespräch.',
    67: '67% – Könnte in der Netflix-Serie "Manipulators" spielen.',
    68: '68% – Reagiert wie ein Meme. Nur ohne Spaß.',
    69: '69% – Nice. Aber auch gefährlich.',
    70: '70% – Sieht alles als Angriff.',
    71: '71% – Redet in Rätseln, erwartet Verständnis.',
    72: '72% – "Hast du ein Problem?" – Klassiker.',
    73: '73% – Steht vorm Spiegel und diskutiert mit sich selbst.',
    74: '74% – Ist das "Problem" in "Beziehungsproblem".',
    75: '75% – Wenn du gewinnst, verlierst du trotzdem.',
    76: '76% – Lebt für toxische "Tests".',
    77: '77% – Liebt Ignorieren als Waffe.',
    78: '78% – Macht Schluss wie bei DSDS: "Du bist raus."',
    79: '79% – Blockiert, entblockiert, blockiert…',
    80: '80% – Hat Ghosting im Blut.',
    81: '81% – Fragt "Wer ist das?" bei jedem Kontakt.',
    82: '82% – Spielt die verletzte Unschuld perfekt.',
    83: '83% – Gibt dir Schuldgefühle für seine Fehler.',
    84: '84% – Verdreht alles, bis du dich fragst ob du verrückt bist.',
    85: '85% – Redet so lange, bis du aufgibst.',
    86: '86% – Lächelt dir ins Gesicht, plant aber dein Ende.',
    87: '87% – Psycho mit WLAN.',
    88: '88% – Hat "Eifersucht" im Blut und "Vertrauen" gelöscht.',
    89: '89% – Könnte Dramaserie schreiben.',
    90: '90% – Widerspricht dir einfach aus Prinzip.',
    91: '91% – Nutzt Tränen als Waffe.',
    92: '92% – Macht alles kompliziert. Immer.',
    93: '93% – Hat "toxisch" studiert.',
    94: '94% – Weiß was du fühlst, spielt aber dumm.',
    95: '95% – Lächelt beim Chaos.',
    96: '96% – Wird nie erwachsen.',
    97: '97% – Will Streit in Frieden verpackt.',
    98: '98% – Drama ist seine/ihr Kaffee.',
    99: '99% – Warnung: Nur mit Schutzkleidung betreten.',
    100: '100% – Toxischer geht nicht. Sofort blockieren!'
  };
  
  module.exports = {
    name: 'toxic',
    description: 'Zeige an wie toxisch eine Person ist\n\nBenutzung:\nMarkiere eine Nachricht und schreibe *?toxic* um zu sehen wie toxisch die Person ist\nMarkiere eine Person *?toxic @person* um anzuzeigen wie toxisch die Person ist\nMarkiere keine Nachricht und keine Person *?toxic* um anzuzeigen wie toxisch du bist.',
    menu: 'Zeige an wie toxisch eine Person ist',
    category: 'fun',
    execute: async (sock, sender, args, msg) => {
      let targetJid;
      let targetName = sender; // Standardmäßig den eigenen Namen setzen
  
      // Wenn es eine markierte Nachricht gibt (z. B. durch "Antwort")
      if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        targetJid = msg.message.extendedTextMessage.contextInfo.participant;
        try {
          const userInfo = await sock.onWhatsApp(targetJid);
          targetName = userInfo[0]?.notify || targetJid.split('@')[0]; // Versucht, den Benutzernamen abzurufen
        } catch (e) {
          targetName = targetJid.split('@')[0]; // Wenn Fehler, dann nur die ID anzeigen
        }
      // Wenn jemand mit @ erwähnt wurde
      } else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        try {
          const userInfo = await sock.onWhatsApp(targetJid);
          targetName = userInfo[0]?.notify || targetJid.split('@')[0]; // Versucht, den Benutzernamen abzurufen
        } catch (e) {
          targetName = targetJid.split('@')[0]; // Wenn Fehler, dann nur die ID anzeigen
        }
      } else {
        // Wenn niemand markiert oder zitiert wird, bleibt der Standardwert (Eigenname)
        targetJid = msg.key.participant || sender;
      }
  
      const percent = Math.floor(Math.random() * 101);
      const text = toxicMap[percent] || `${percent}% toxisch – Beschreibung fehlt. Vielleicht ein neues Level?`;
  
	  await delay();
      await sock.sendMessage(sender, {
        text: `☣️ *Toxizitäts-Scan*\n@${targetJid.split('@')[0]} ist heute bei *${text}*`,
        mentions: [targetJid]
      });
    }
  };