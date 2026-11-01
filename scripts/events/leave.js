
const Canvas = require("canvas");
const { getTime, drive } = global.utils;

const insults = [
  "Ton depart est probablement ta meilleure contribution au groupe.",
  "Une notification en moins, et personne ne s'en plaint.",
  "Le groupe vient de gagner quelques decibels de tranquillite.",
  "Tu pars comme tu es venu : sans laisser de legende.",
  "La porte etait ouverte. Pas besoin de faire une scene.",
  "Meme le silence que tu laisses est plus interessant.",
  "Le bouton quitter a enfin servi a quelque chose.",
  "Les applaudissements pour ton depart sont facultatifs.",
  "On aurait bien retenu ton nom, mais on a mieux a faire.",
  "Ton absence risque de passer inapercue."
];

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth, startSize, font = "Arial") {
  let size = startSize;

  while (size > 16) {
    ctx.font = `bold ${size}px ${font}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }

  return size;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) ctx.fillText(line, x, currentY);
}

async function createLeaveCard({
  userID,
  userName,
  threadName,
  type,
  date,
  time,
  session,
  insult,
  usersData
}) {
  const width = 1200;
  const height = 700;

  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond sombre
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#08060d");
  background.addColorStop(0.5, "#160b24");
  background.addColorStop(1, "#050407");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  // Motifs lumineux
  ctx.save();
  ctx.globalAlpha = 0.12;

  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.arc(
      (i * 173) % width,
      (i * 97) % height,
      2 + (i % 4) * 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#c084fc";
    ctx.fill();
  }

  ctx.restore();

  // Bordure extérieure
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 4;
  roundedRect(ctx, 18, 18, width - 36, height - 36, 28);
  ctx.stroke();

  // Bordure intérieure
  ctx.strokeStyle = "rgba(192, 132, 252, 0.25)";
  ctx.lineWidth = 2;
  roundedRect(ctx, 32, 32, width - 64, height - 64, 22);
  ctx.stroke();

  // En-tête
  ctx.textAlign = "center";
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 25px Arial";
  ctx.fillText("𖤐  D A R K   N E T W O R K  𖤐", width / 2, 83);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 43px Arial";
  ctx.fillText("AVIS DE DEPART", width / 2, 145);

  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(330, 170);
  ctx.lineTo(870, 170);
  ctx.stroke();

  // Photo de profil
  const avatarX = 255;
  const avatarY = 380;
  const avatarRadius = 145;

  ctx.save();

  // Cercle extérieur lumineux
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius + 9, 0, Math.PI * 2);
  ctx.fillStyle = "#8b5cf6";
  ctx.fill();

  ctx.shadowBlur = 0;

  // Fond du cercle
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#1b1028";
  ctx.fill();

  // Chargement de l'avatar
  try {
    const avatarURL = await usersData.getAvatarUrl(userID);

    if (avatarURL) {
      const avatar = await Canvas.loadImage(avatarURL);

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();

      const scale = Math.max(
        (avatarRadius * 2) / avatar.width,
        (avatarRadius * 2) / avatar.height
      );

      const drawWidth = avatar.width * scale;
      const drawHeight = avatar.height * scale;

      ctx.drawImage(
        avatar,
        avatarX - drawWidth / 2,
        avatarY - drawHeight / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();
    } else {
      throw new Error("Avatar indisponible");
    }
  } catch (error) {
    // Avatar de remplacement si le chargement échoue
    const initials = String(userName || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0] || "")
      .join("")
      .toUpperCase();

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 90px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials || "?", avatarX, avatarY);
    ctx.textBaseline = "alphabetic";
  }

  ctx.restore();

  // Informations du membre
  const infoX = 490;
  const infoWidth = 620;

  ctx.textAlign = "left";
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 22px Arial";
  ctx.fillText("MEMBRE CONCERNE", infoX, 265);

  const safeName = String(userName || "Membre inconnu");
  const nameSize = fitText(ctx, safeName, infoWidth, 43);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${nameSize}px Arial`;
  ctx.fillText(safeName, infoX, 320);

  // Statut
  ctx.fillStyle = "#a855f7";
  ctx.font = "bold 25px Arial";
  ctx.fillText(type.toUpperCase(), infoX, 375);

  // Informations du groupe
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 19px Arial";
  ctx.fillText("GROUPE", infoX, 430);

  ctx.fillStyle = "#eeeeee";
  ctx.font = "23px Arial";
  drawWrappedText(ctx, threadName || "Groupe inconnu", infoX, 465, infoWidth, 30);

  // Date et heure
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 19px Arial";
  ctx.fillText("DATE ET HEURE", infoX, 530);

  ctx.fillStyle = "#eeeeee";
  ctx.font = "22px Arial";
  ctx.fillText(`${date}  •  ${time}`, infoX, 565);

  // Période
  ctx.fillStyle = "#a78bfa";
  ctx.font = "18px Arial";
  ctx.fillText(`PERIODE : ${session}`, infoX, 600);

  // Encadré de la phrase sarcastique
  const panelX = 75;
  const panelY = 615;
  const panelWidth = 1050;
  const panelHeight = 55;

  roundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 14);
  ctx.fillStyle = "rgba(139, 92, 246, 0.17)";
  ctx.fill();

  ctx.strokeStyle = "rgba(192, 132, 252, 0.65)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#e9d5ff";
  ctx.textAlign = "center";
  ctx.font = "bold 18px Arial";

  const shortInsult =
    insult.length > 100 ? insult.slice(0, 97) + "..." : insult;

  ctx.fillText(shortInsult, width / 2, 649);

  return canvas.createPNGStream();
}

module.exports = {
  config: {
    name: "leave",
    version: "2.0",
    author: "Dark",
    category: "events"
  },

  langs: {
    fr: {
      session1: "MATIN",
      session2: "MIDI",
      session3: "APRES-MIDI",
      session4: "SOIR",

      leaveType1: "A QUITTE LE GROUPE",
      leaveType2: "A ETE EXCLU DU GROUPE",

      defaultLeaveMessage:
        "╔═══━━━─── 🥀 ───━━━═══╗\n" +
        "       𓆩 🖤 DEPART DU GROUPE 🖤 𓆪\n" +
        "╚═══━━━─── 🥀 ───━━━═══╝\n\n" +
        "   👤 Membre : {userName}\n" +
        "   🥀 Statut : {type}\n" +
        "   🏰 Groupe : {threadName}\n" +
        "   ⏰ Heure : {time}\n" +
        "   🌙 Periode : {session}\n\n" +
        "╭───────〔 🦇 〕───────╮\n" +
        "   UNE PRESENCE DE MOINS...\n" +
        "╰─────────────────────╯"
    }
  },

  onStart: async ({
    threadsData,
    message,
    event,
    api,
    usersData,
    getLang
  }) => {
    if (event.logMessageType !== "log:unsubscribe")
      return;

    return async function () {
      try {
        const { threadID } = event;
        const threadData = await threadsData.get(threadID);

        if (!threadData.settings.sendLeaveMessage)
          return;

        const userID = event.logMessageData.leftParticipantFbId;

        if (!userID || userID == api.getCurrentUserID())
          return;

        const hours = Number(getTime("HH"));
        const date = getTime("DD/MM/YYYY");
        const time = getTime("HH:mm");
        const fullTime = getTime("DD/MM/YYYY HH:mm");

        const threadName = threadData.threadName || "Groupe inconnu";

        let userName = "Membre inconnu";

        try {
          userName = await usersData.getName(userID) || userName;
        } catch (error) {
          // On garde le nom de remplacement.
        }

        const type =
          event.author === userID
            ? getLang("leaveType1")
            : getLang("leaveType2");

        const session =
          hours <= 10
            ? getLang("session1")
            : hours <= 12
            ? getLang("session2")
            : hours <= 18
            ? getLang("session3")
            : getLang("session4");

        const insult = insults[Math.floor(Math.random() * insults.length)];

        // Message texte existant, conservé pour ne pas casser tes réglages.
        let leaveMessage =
          threadData.data.leaveMessage ||
          getLang("defaultLeaveMessage");

        const shouldMention = leaveMessage.includes("{userNameTag}");

        leaveMessage = leaveMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName)
          .replace(/\{type\}/g, type)
          .replace(/\{threadName\}|\{boxName\}/g, threadName)
          .replace(/\{time\}/g, fullTime)
          .replace(/\{session\}/g, session);

        // Création de la carte graphique.
        const card = await createLeaveCard({
          userID,
          userName,
          threadName,
          type,
          date,
          time,
          session,
          insult,
          usersData
        });

        card.path = "dark-network-leave.png";

        const form = {
          body: leaveMessage,
          attachment: [card]
        };

        if (shouldMention) {
          form.mentions = [
            {
              id: userID,
              tag: userName
            }
          ];
        }

        // Conservation des pièces jointes configurées dans le groupe.
        if (threadData.data.leaveAttachment) {
          const files = threadData.data.leaveAttachment;

          const attachments = files.map(file =>
            drive.getFile(file, "stream")
          );

          const results = await Promise.allSettled(attachments);

          for (const result of results) {
            if (result.status === "fulfilled")
              form.attachment.push(result.value);
          }
        }

        await message.send(form);
      } catch (error) {
        console.error("Erreur dans leave.js :", error);
      }
    };
  }
};
