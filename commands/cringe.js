const { description, category } = require("./sticker");
const { delay } = require('../utils');

const cringeMap = {
    0: '0% Cringe: Du bist ein echter Profi, kein Cringe hier!',
    1: '1% Cringe: Noch alles gut, aber etwas schüchtern.',
    2: '2% Cringe: Hm, warte... was war das?',
    3: '3% Cringe: Bisschen komisch, aber noch okay.',
    4: '4% Cringe: Die Vibes sind irgendwie merkwürdig.',
    5: '5% Cringe: Ist das jetzt ironisch oder ernst?',
    6: '6% Cringe: Schon ein bisschen unbehaglich.',
    7: '7% Cringe: Okay, jetzt wird\'s komisch.',
    8: '8% Cringe: Das ist schon leicht unangenehm.',
    9: '9% Cringe: Kannst du das noch retten?',
    10: '10% Cringe: Uff, das war peinlich.',
    11: '11% Cringe: Oh je, das war schon ziemlich cringe.',
    12: '12% Cringe: Da hätten wir uns auch etwas anderes ausdenken können.',
    13: '13% Cringe: Die Leute schauen dich jetzt seltsam an.',
    14: '14% Cringe: Hast du das wirklich gemacht?',
    15: '15% Cringe: Du weißt, dass das gerade nicht cool war, oder?',
    16: '16% Cringe: Was hast du dir dabei gedacht?',
    17: '17% Cringe: Das war wirklich nicht dein Moment.',
    18: '18% Cringe: Unangenehm, wirklich unangenehm.',
    19: '19% Cringe: Die Stimmung ist jetzt etwas seltsam.',
    20: '20% Cringe: Der Cringe-Level geht nach oben!',
    21: '21% Cringe: Das war ein bisschen zu viel.',
    22: '22% Cringe: Hättest du das nicht besser machen können?',
    23: '23% Cringe: Das wird langsam richtig unangenehm.',
    24: '24% Cringe: Ehm... wir sollten jetzt weitermachen.',
    25: '25% Cringe: Du bist jetzt auf der Cringe-Skala!',
    26: '26% Cringe: Oha, das ist wirklich cringe.',
    27: '27% Cringe: Du bist auf einem gefährlichen Niveau.',
    28: '28% Cringe: Es wird immer schlimmer.',
    29: '29% Cringe: Das tut schon fast weh zu sehen.',
    30: '30% Cringe: Dein Cringe-Level ist jetzt hoch!',
    31: '31% Cringe: Kannst du das noch retten? Bitte!',
    32: '32% Cringe: Hast du das wirklich getan?',
    33: '33% Cringe: Das ist der Moment, in dem du es bereust.',
    34: '34% Cringe: Wir reden nicht mehr darüber.',
    35: '35% Cringe: Oof, das war hart.',
    36: '36% Cringe: Du solltest dich jetzt entschuldigen.',
    37: '37% Cringe: Wäre das nicht besser ungesagt geblieben?',
    38: '38% Cringe: Die Leute schauen dich fragend an.',
    39: '39% Cringe: Kannst du bitte aufhören?',
    40: '40% Cringe: Wir sind jetzt offiziell im Cringe-Modus.',
    41: '41% Cringe: Der Peak des Cringe ist fast erreicht!',
    42: '42% Cringe: Das ist jetzt schon unangenehm.',
    43: '43% Cringe: Was tust du da?',
    44: '44% Cringe: Es wird immer schlimmer.',
    45: '45% Cringe: Du hättest dir das wirklich sparen können.',
    46: '46% Cringe: Bitte nicht mehr.',
    47: '47% Cringe: Hast du keine Scham?',
    48: '48% Cringe: Der Cringe-Level ist auf Maximum!',
    49: '49% Cringe: Ist das wirklich der richtige Zeitpunkt?',
    50: '50% Cringe: Du hast die Hälfte des Cringe erreicht.',
    51: '51% Cringe: Noch schlimmer und es wird unangenehm.',
    52: '52% Cringe: Das ist echt der Moment, wo du dich verkriechen möchtest.',
    53: '53% Cringe: Schon jetzt zu viel für mich.',
    54: '54% Cringe: Du hast dich gerade ins Cringe-Universum katapultiert.',
    55: '55% Cringe: Kannst du das wirklich noch retten?',
    56: '56% Cringe: Du bist dabei, eine Legende zu werden... leider die falsche.',
    57: '57% Cringe: Jetzt sind wir wirklich tief im Cringe-Bereich.',
    58: '58% Cringe: Bitte hör auf, es wird immer schlimmer.',
    59: '59% Cringe: Du hast den Cringe-Bereich jetzt voll ausgereizt.',
    60: '60% Cringe: Das war zu viel, jetzt wird\'s episch schlecht.',
    61: '61% Cringe: Ab hier geht es nur noch bergab.',
    62: '62% Cringe: Ein paar Leute haben gerade den Raum verlassen.',
    63: '63% Cringe: Das war deine beste Idee, oder? 😳',
    64: '64% Cringe: Du bist wirklich ein Cringe-Guru.',
    65: '65% Cringe: Du bist jetzt ein Symbol für Cringe.',
    66: '66% Cringe: Das war ein schwerer Fehler, den du nie wieder machen solltest.',
    67: '67% Cringe: Hättest du nur den Moment zurückspulen können...',
    68: '68% Cringe: Du bist fast am Ziel: totaler Cringe!',
    69: '69% Cringe: Noch ein bisschen und du bist auf Platz 1.',
    70: '70% Cringe: Du hast es geschafft, jetzt ist es offiziell: Cringe!',
    71: '71% Cringe: Jetzt wird es wirklich richtig unangenehm.',
    72: '72% Cringe: Du hast den Cringe-Level noch nicht erreicht!',
    73: '73% Cringe: Es tut weh, es zu sehen...',
    74: '74% Cringe: Jeder in der Gruppe fühlt sich unwohl.',
    75: '75% Cringe: Da will keiner mehr zuhören.',
    76: '76% Cringe: Vielleicht war das doch nicht die beste Idee.',
    77: '77% Cringe: Der Cringe-König ist jetzt gekrönt!',
    78: '78% Cringe: Alle Augen sind jetzt auf dich gerichtet.',
    79: '79% Cringe: Das ist das neue Maß für Cringe.',
    80: '80% Cringe: Du bist jetzt ein echter Cringe-Influencer.',
    81: '81% Cringe: Du hast alle Erwartungen gesprengt.',
    82: '82% Cringe: Hier ist nichts mehr zu retten.',
    83: '83% Cringe: Jeder schaut dich jetzt an, als wärst du ein Exempel.',
    84: '84% Cringe: Es tut wirklich weh, das zu sehen.',
    85: '85% Cringe: Niemand kann dir helfen, du bist im Cringe-Himmel.',
    86: '86% Cringe: Du hast einen neuen Rekord im Cringe aufgestellt.',
    87: '87% Cringe: Wir sind jetzt offiziell im höchsten Cringe-Level.',
    88: '88% Cringe: Du hast die Grenze des Cringe überschritten.',
    89: '89% Cringe: Der Cringe ist kaum noch zu ertragen.',
    90: '90% Cringe: Du bist auf dem Weg zu einem neuen Weltrekord!',
    91: '91% Cringe: Du hast das Cringe-Universum erobert.',
    92: '92% Cringe: Alle sprechen nur noch über dich... leider schlecht.',
    93: '93% Cringe: Du hast die höchste Cringe-Stufe erreicht.',
    94: '94% Cringe: Du wirst jetzt in den Annalen des Cringe verewigt.',
    95: '95% Cringe: Es ist offiziell, du bist ein Cringe-Ikone.',
    96: '96% Cringe: Du hast alle anderen in den Schatten gestellt.',
    97: '97% Cringe: Jetzt bist du wirklich auf einem ganz anderen Level.',
    98: '98% Cringe: Niemand kann das jetzt noch aufhalten.',
    99: '99% Cringe: Das ist der wahre Höhepunkt des Cringe.',
    100: '100% Cringe: Du hast es geschafft! Du bist der absolute Cringe-Champion! 🏆'
};
  
  module.exports = {
    name: 'cringe',
    description: 'Zeige an wie cringe eine Person ist\n\nBenutzung:\nMarkiere eine Nachricht und schreibe *?cringe* um zu sehen wie cringe die Person ist\nMarkiere eine Person *?cringe @person* um anzuzeigen wie cringe die Person ist\nMarkiere keine Nachricht und keine Person *?cringe* um anzuzeigen wie cringe du bist.',
    menu: 'Zeige an wie cringe eine Person ist',
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
      const text = cringeMap[percent] || `${percent}% cringe – Beschreibung fehlt. Vielleicht ein neues Level?`;
  
	  await delay();
      await sock.sendMessage(sender, {
        text: `😬 *Cringe-Scan*\n@${targetJid.split('@')[0]} ist heute bei *${text}*`,
        mentions: [targetJid]
      });
    }
  };