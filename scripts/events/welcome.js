
const Canvas = require("canvas");
const { createCanvas, loadImage, registerFont } = Canvas;
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

let fontLoaded = false;

async function loadWelcomeFont() {
  if (fontLoaded) return;

  try {
    const fontPath = path.join(
      __dirname,
      "cache",
      "tt-modernoir-trial.bold.ttf"
    );

    if (!await fs.pathExists(fontPath)) {
      const fontUrl =
        "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";

      const response = await axios.get(fontUrl, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      await fs.outputFile(fontPath, response.data);
    }

    registerFont(fontPath, {
      family: "ModernoirBold"
    });

    fontLoaded = true;
  } catch (error) {
    console.error("Erreur police Modernoir :", error.message);
  }
}

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
  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - radius
  );
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth, initialSize) {
  let size = initialSize;

  while (size > 15) {
    ctx.font = `bold ${size}px ModernoirBold, Arial`;

    if (ctx.measureText(text).width <= maxWidth)
      break;

    size -= 2;
  }

  return size;
}

function drawCorner(ctx, x, y, horizontal, vertical) {
  ctx.save();
  ctx.strokeStyle = "#c084fc";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x, y + vertical * 65);
  ctx.lineTo(x, y);
  ctx.lineTo(x + horizontal * 65, y);
  ctx.stroke();

  ctx.strokeStyle = "rgba(216, 180, 254, 0.55)";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x + horizontal * 12, y + vertical * 48);
  ctx.lineTo(x + horizontal * 12, y + vertical * 12);
  ctx.lineTo(x + horizontal * 48, y + vertical * 12);
  ctx.stroke();

  ctx.restore();
}

async function createWelcomeCard({
  userID,
  userName,
  threadName,
  memberCount,
  usersData
}) {
  await loadWelcomeFont();

  const width = 900;
  const height = 1200;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond principal
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#08060d");
  gradient.addColorStop(0.45, "#21102f");
  gradient.addColorStop(1, "#07050b");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Halo violet
  const glow = ctx.createRadialGradient(
    450, 440, 20,
    450, 440, 520
  );

  glow.addColorStop(0, "rgba(147, 51, 234, 0.23)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Cadre extérieur
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 5;

  roundedRect(ctx, 25, 25, width - 50, height - 50, 30);
  ctx.stroke();

  // Cadre intérieur
  ctx.strokeStyle = "rgba(216, 180, 254, 0.45)";
  ctx.lineWidth = 2;

  roundedRect(ctx, 43, 43, width - 86, height - 86, 24);
  ctx.stroke();

  // Décoration des quatre coins
  drawCorner(ctx, 55, 55, 1, 1);
  drawCorner(ctx, 845, 55, -1, 1);
  drawCorner(ctx, 55, 1145, 1, -1);
  drawCorner(ctx, 845, 1145, -1, -1);

  // Petites décorations
  ctx.textAlign = "center";
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 34px Arial";
  ctx.fillText("𖤐", 450, 115);

  // Titre
  ctx.fillStyle = "#e9d5ff";
  ctx.font = "bold 43px ModernoirBold, Arial";
  ctx.fillText("NEW SOUL", 450, 185);

  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(180, 215);
  ctx.lineTo(720, 215);
  ctx.stroke();

  // Cadre de la photo
  const avatarX = 450;
  const avatarY = 440;
  const avatarRadius = 190;

  ctx.save();

  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 35;

  ctx.beginPath();
  ctx.arc(
    avatarX,
    avatarY,
    avatarRadius + 13,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "#a855f7";
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(
    avatarX,
    avatarY,
    avatarRadius + 5,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "#0b0711";
  ctx.fill();

  // Chargement de la photo du joueur
  try {
    let avatarUrl;

    if (usersData && usersData.getAvatarUrl)
      avatarUrl = await usersData.getAvatarUrl(userID);

    if (!avatarUrl)
      throw new Error("Photo de profil indisponible");

    const avatar = await loadImage(avatarUrl);

    ctx.save();

    ctx.beginPath();
    ctx.arc(
      avatarX,
      avatarY,
      avatarRadius,
      0,
      Math.PI * 2
    );
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

  } catch (error) {
    // Image de remplacement
    ctx.beginPath();
    ctx.arc(
      avatarX,
      avatarY,
      avatarRadius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#21102f";
    ctx.fill();

    const initial = String(userName || "?")
      .trim()
      .charAt(0)
      .toUpperCase();

    ctx.fillStyle = "#e9d5ff";
    ctx.font = "bold 130px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initial, avatarX, avatarY);

    ctx.textBaseline = "alphabetic";
  }

  ctx.restore();

  // Nom du joueur
  ctx.textAlign = "center";

  const safeName = String(userName || "Nouveau membre");
  const nameSize = fitText(ctx, safeName, 740, 48);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${nameSize}px ModernoirBold, Arial`;

  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 15;

  ctx.fillText(safeName, 450, 730);

  ctx.shadowBlur = 0;

  // Petite décoration
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 28px Arial";
  ctx.fillText("𓆩 🥀 𓆪", 450, 785);

  // Nom du groupe
  ctx.fillStyle = "#c4b5fd";
  ctx.font = "bold 24px ModernoirBold, Arial";

  ctx.fillText("WELCOME TO", 450, 855);

  const safeGroup = String(threadName || "Groupe");
  const groupSize = fitText(ctx, safeGroup, 720, 35);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${groupSize}px ModernoirBold, Arial`;
  ctx.fillText(safeGroup, 450, 905);

  // Numéro du membre
  ctx.strokeStyle = "rgba(192, 132, 252, 0.6)";
  ctx.lineWidth = 2;

  roundedRect(ctx, 250, 960, 400, 75, 18);
  ctx.stroke();

  ctx.fillStyle = "#e9d5ff";
  ctx.font = "bold 27px ModernoirBold, Arial";

  ctx.fillText(
    `MEMBER N° ${memberCount}`,
    450,
    1007
  );

  // Signature
  ctx.fillStyle = "#a78bfa";
  ctx.font = "bold 23px ModernoirBold, Arial";
  ctx.fillText("𖤐 DARK NETWORK 𖤐", 450, 1090);

  ctx.fillStyle = "#c084fc";
  ctx.font = "22px Arial";
  ctx.fillText("WELCOME TO THE DARK SIDE", 450, 1125);

  const stream = canvas.createPNGStream();
  stream.path = `welcome_${userID}.png`;

  return stream;
}

module.exports = {
  config: {
    name: "welcome",
    version: "6.0",
    author: "Dark",
    category: "events"
  },

  onStart: async ({
    threadsData,
    message,
    event,
    api,
    usersData
  }) => {
    try {
      const {
        threadID,
        logMessageType,
        logMessageData
      } = event;

      if (logMessageType !== "log:subscribe")
        return;

      const botID = api.getCurrentUserID();

      const addedParticipants =
        logMessageData.addedParticipants || [];

      if (!addedParticipants.length)
        return;

      // CAS 1 : Le bot est ajouté au groupe
      const botAdded = addedParticipants.some(
        participant => participant.userFbId == botID
      );

      if (botAdded) {
        const nickname =
          global.GoatBot?.config?.nickNameBot || "DARK SYSTEM";

        const configuredPrefix =
          global.GoatBot?.config?.prefix || "-";

        const prefix = Array.isArray(configuredPrefix)
          ? configuredPrefix[0]
          : configuredPrefix;

        try {
          await api.changeNickname(nickname, threadID, botID);
        } catch (error) {
          console.error("Erreur changement de pseudo :", error);
        }

        const botMessage =
`𓆩 ⚜️ 𓆪 DARK SYSTEM

Connexion établie.

♛ Bot : ${nickname}
♛ Préfixe : ${prefix}
♛ Menu : ${prefix}help
♛ Statut : En ligne

Le système est opérationnel. 🦇`;

        await api.sendMessage(botMessage, threadID);
        return;
      }

      // CAS 2 : Nouveaux membres
      const threadData = await threadsData.get(threadID);
      const threadName = threadData.threadName || "Groupe";

      const threadInfo = await api.getThreadInfo(threadID);

      const newMembers = addedParticipants.filter(
        participant => participant.userFbId != botID
      );

      // Le nombre de membres inclut déjà les personnes ajoutées.
      let memberCount =
        threadInfo.participantIDs.length - newMembers.length + 1;

      for (const user of newMembers) {
        const userID = user.userFbId;

        if (!userID)
          continue;

        let userName = user.fullName || "Nouveau membre";

        try {
          if (usersData && usersData.getName)
            userName = await usersData.getName(userID) || userName;
        } catch (error) {
          console.error("Erreur récupération du nom :", error);
        }

        try {
          const card = await createWelcomeCard({
            userID,
            userName,
            threadName,
            memberCount,
            usersData
          });

          await message.send({
            attachment: card
          });

        } catch (error) {
          console.error("Erreur création de la carte :", error);

          await message.send(
            `𓆩 🦇 𓆪 Bienvenue ${userName} dans ${threadName} ! 🥀`
          );
        }

        memberCount++;
      }

    } catch (error) {
      console.error("Erreur dans welcome.js :", error);
    }
  }
};
