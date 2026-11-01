
const { getTime } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// Chargement de la police
(async () => {
  try {
    const fontPath = path.join(__dirname, "cache", "tt-modernoir-trial.bold.ttf");

    if (!fs.existsSync(fontPath)) {
      console.log("⏬ Téléchargement de la police...");
      const fontUrl = "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";
      const { data } = await axios.get(fontUrl, { responseType: "arraybuffer" });
      await fs.outputFile(fontPath, data);
      console.log("✅ Police téléchargée");
    }

    registerFont(fontPath, { family: "ModernoirBold" });
    console.log("✅ Police enregistrée");
  } catch (err) {
    console.error("❌ Erreur de chargement de la police :", err);
  }
})();

module.exports = {
  config: {
    name: "welcome",
    version: "4.2",
    author: "Dark",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api }) => {
    try {
      const { threadID, logMessageType, logMessageData } = event;

      const botID = api.getCurrentUserID();
      const addedParticipants = logMessageData.addedParticipants || [];

      // CAS 1 : Le bot rejoint un nouveau groupe
      if (
        logMessageType === "log:subscribe" &&
        addedParticipants.some(p => p.userFbId === botID)
      ) {
        const nickname = global.GoatBot?.config?.nickNameBot || "Bot";
        await api.changeNickname(nickname, threadID, botID);

        const msg = `
𓆩 🖤 𓆪 ━━━━ 𖤐 ━━━━ 𓆩 🦇 𓆪

𝗠𝖾𝗋𝖼𝗂 𝖽'𝖺𝗏𝗈𝗂𝗋 𝗂𝗇𝗏𝗂𝗍𝖾́ 𝗆𝗈𝗇 𝗌𝗒𝗌𝗍𝖾̀𝗆𝖾. 🥀

♛ 𝗡𝗼𝗺 𝗱𝘂 𝗯𝗼𝘁 : ヾΩ.Ꭰꪖꪹӄ 命༘
♛ 𝗣𝗿𝗲́𝗳𝗶𝘅𝗲 : 『 $ 』
♛ 𝗠𝗲𝗻𝘂 : 『 $help 』

⚜️ 𝗠𝗼𝗱𝗲 : 𝗦𝘆𝘀𝘁𝗲̀𝗺𝗲 𝗗𝗮𝗿𝗸
🩸 𝗦𝘁𝗮𝘁𝘂𝘁 : 𝗘𝗻 𝗹𝗶𝗴𝗻𝗲

༺ 𝑳𝒆 𝒔𝒊𝒍𝒆𝒏𝒄𝒆 𝒆𝒔𝒕 𝒖𝒏𝒆 𝒇𝒐𝒓𝒄𝒆. ༻

𓆩 ⚜️ 𓆪 ━━━━━━━━━ 𓆩 ⚜️ 𓆪
        `;

        await api.sendMessage(msg, threadID);
        return;
      }

      // CAS 2 : Un membre rejoint le groupe
      if (logMessageType !== "log:subscribe") return;

      const threadData = await threadsData.get(threadID);
      const threadName = threadData.threadName || "Groupe";
      const memberCount = (await api.getThreadInfo(threadID)).participantIDs.length;

      const user = addedParticipants[0];
      if (!user) return;

      const userName = user.fullName;
      const userID = user.userFbId;

      // Photo de profil
      const avatarUrl = `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Fonds aléatoires
      const backgrounds = [
        "https://files.catbox.moe/cj68oa.jpg",
        "https://files.catbox.moe/0n8mmb.jpg",
        "https://files.catbox.moe/hvynlb.jpg",
        "https://files.catbox.moe/leyeuq.jpg",
        "https://files.catbox.moe/7ufcfb.jpg",
        "https://files.catbox.moe/y78bmv.jpg"
      ];

      const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // Création du Canvas
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      const bgResponse = await axios.get(randomBg, {
        responseType: "arraybuffer"
      });

      const bg = await loadImage(bgResponse.data);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Chargement de l'avatar
      let avatar;

      try {
        const response = await axios.get(avatarUrl, {
          responseType: "arraybuffer"
        });
        avatar = await loadImage(response.data);
      } catch {
        avatar = await loadImage("https://i.ibb.co/2kR9xgQ/default-avatar.png");
      }

      // Avatar circulaire
      const avatarSize = 200;
      const avatarX = canvas.width / 2 - avatarSize / 2;
      const avatarY = 40;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Textes sur l'image
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 6;

      ctx.font = "bold 55px ModernoirBold";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(userName, canvas.width / 2, 310);

      ctx.font = "bold 35px ModernoirBold";
      ctx.fillStyle = "#ffea00";
      ctx.fillText(threadName.toUpperCase(), canvas.width / 2, 370);

      ctx.font = "bold 30px ModernoirBold";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText(
        `Tu es notre ${memberCount}e membre !`,
        canvas.width / 2,
        420
      );

      // Enregistrement de l'image
      const imgPath = path.join(__dirname, "cache", `welcome_${userID}.png`);
      await fs.ensureDir(path.dirname(imgPath));

      const out = fs.createWriteStream(imgPath);
      const stream = canvas.createPNGStream();

      stream.pipe(out);

      await new Promise((resolve, reject) => {
        out.on("finish", resolve);
        out.on("error", reject);
        stream.on("error", reject);
      });

      // Message de bienvenue en français
      await message.send(
        {
          body:
            `𓆩 🖤 𓆪 Bienvenue ${userName} dans ${threadName} ! 🥀\n\n` +
            `⚜️ Tu es notre ${memberCount}e membre ! 🎉\n` +
            `Nous te souhaitons de passer de bons moments parmi nous. 🦇`,
          attachment: fs.createReadStream(imgPath)
        },
        () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
      );

    } catch (err) {
      console.error("❌ Erreur de bienvenue :", err);
    }
  }
};
      
