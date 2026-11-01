
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slot",
    version: "3.0.0",
    author: "Dark",
    shortDescription: {
      fr: "👑 Casino Royal Dark"
    },
    longDescription: {
      fr: "Une machine à sous royale avec jackpot et gains."
    },
    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
    guide: {
      fr: "{pn} <mise>"
    }
  },

  langs: {
    fr: {
      invalid_amount: "⚠️ Entre une mise valide et positive.",
      not_enough_money: "💸 Ton solde est insuffisant pour cette mise.",
      error: "❌ Une erreur est survenue pendant la partie."
    }
  },

  onStart: async function ({
    args,
    message,
    event,
    api,
    usersData,
    getLang
  }) {
    const senderID = event.senderID;
    const amount = Number(args[0]);

    if (!Number.isSafeInteger(amount) || amount <= 0)
      return message.reply(getLang("invalid_amount"));

    try {
      const userData = await usersData.get(senderID);
      const balance = Number(userData.money) || 0;

      if (amount > balance)
        return message.reply(getLang("not_enough_money"));

      // Récupération du profil Facebook
      let playerName = "Joueur";
      let avatar = null;

      try {
        const info = await api.getUserInfo(senderID);
        const profile = info[senderID] || info;

        playerName = profile.name || "Joueur";

        const avatarUrl =
          profile.thumbSrc ||
          profile.profilePic ||
          profile.picture;

        if (avatarUrl) {
          const response = await axios.get(avatarUrl, {
            responseType: "arraybuffer",
            timeout: 10000
          });

          avatar = await loadImage(response.data);
        }
      } catch (error) {
        console.log("Profil joueur indisponible :", error.message);
      }

      // Symboles de la machine
      const symbols = [
        "🍒", "🍋", "🍇", "🍉", "🔔",
        "7️⃣", "💎", "⭐", "🍀"
      ];

      const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
      const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
      const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

      // Calcul des gains
      const payout = calculatePayout(
        slot1,
        slot2,
        slot3,
        amount
      );

      const netGain = payout - amount;
      const newBalance = balance + netGain;

      await usersData.set(senderID, {
        money: newBalance,
        data: userData.data
      });

      const diamondJackpot =
        slot1 === "💎" &&
        slot2 === "💎" &&
        slot3 === "💎";

      const sevenJackpot =
        slot1 === "7️⃣" &&
        slot2 === "7️⃣" &&
        slot3 === "7️⃣";

      const triple = slot1 === slot2 && slot2 === slot3;

      const pair =
        slot1 === slot2 ||
        slot1 === slot3 ||
        slot2 === slot3;

      let result;
      let resultColor;

      if (diamondJackpot) {
        result = "💎 DIAMOND JACKPOT";
        resultColor = "#ffe08a";
      } else if (sevenJackpot) {
        result = "👑 777 JACKPOT";
        resultColor = "#ffe08a";
      } else if (triple) {
        result = "✨ TRIPLE WIN";
        resultColor = "#c4a5ff";
      } else if (pair) {
        result = "🎉 DOUBLE WIN";
        resultColor = "#75e6a5";
      } else {
        result = "💀 YOU LOST";
        resultColor = "#ff7373";
      }

      // Création de l'image
      const width = 1200;
      const height = 900;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Fond sombre
      const background = ctx.createLinearGradient(
        0, 0, width, height
      );

      background.addColorStop(0, "#080511");
      background.addColorStop(0.5, "#1b1031");
      background.addColorStop(1, "#05030a");

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      // Décoration
      ctx.strokeStyle = "#a879ff";
      ctx.lineWidth = 5;
      ctx.strokeRect(20, 20, 1160, 860);

      ctx.strokeStyle = "#d7ad65";
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, 1130, 830);

      // Fonctions graphiques
      function panel(x, y, w, h) {
        ctx.fillStyle = "#160f27";
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "#8d62d8";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
      }

      function centerText(text, x, y, size, color, bold = true) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        ctx.font = `${bold ? "bold " : ""}${size}px Arial`;
        ctx.fillText(text, x, y);
      }

      // En-tête
      centerText(
        "♛ CASINO ROYAL DARK ♛",
        600, 95, 62, "#e4c2ff"
      );

      centerText(
        "✦ THE ROYAL SLOT EXPERIENCE ✦",
        600, 155, 25, "#bd91ff"
      );

      // Profil joueur
      panel(100, 205, 1000, 130);

      // Avatar circulaire
      ctx.save();
      ctx.beginPath();
      ctx.arc(175, 270, 48, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (avatar) {
        ctx.drawImage(avatar, 127, 222, 96, 96);
      } else {
        ctx.fillStyle = "#382451";
        ctx.fillRect(127, 222, 96, 96);
        centerText("👤", 175, 270, 48, "#ffffff");
      }

      ctx.restore();

      // Bordure avatar
      ctx.beginPath();
      ctx.arc(175, 270, 51, 0, Math.PI * 2);
      ctx.strokeStyle = "#e2bc75";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#d9b7ff";
      ctx.font = "bold 22px Arial";
      ctx.fillText("ROYAL PLAYER", 255, 245);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px Arial";

      let displayName = playerName;
      while (
        ctx.measureText(displayName).width > 790 &&
        displayName.length > 5
      ) {
        displayName = displayName.slice(0, -1);
      }

      if (displayName !== playerName)
        displayName += "...";

      ctx.fillText(displayName, 255, 292);

      // Machine
      panel(100, 370, 1000, 275);

      centerText(
        "♛ LUCKY REELS ♛",
        600, 405, 30, "#e5c58b"
      );

      const positions = [350, 600, 850];

      positions.forEach((x) => {
        ctx.fillStyle = "#241638";
        ctx.fillRect(x - 105, 445, 210, 150);

        ctx.strokeStyle = "#bd91ff";
        ctx.lineWidth = 4;
        ctx.strokeRect(x - 105, 445, 210, 150);

        ctx.strokeStyle = "#d5a95f";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 95, 455, 190, 130);
      });

      // Symboles
      positions.forEach((x, index) => {
        centerText(
          [slot1, slot2, slot3][index],
          x, 520, 85, "#ffffff"
        );
      });

      // Résultat
      centerText(
        result,
        600, 690, 43, resultColor
      );

      // Mise et gain
      panel(100, 735, 480, 80);
      panel(620, 735, 480, 80);

      centerText(
        `MISE : ${amount}$`,
        340, 775, 29, "#ffffff"
      );

      centerText(
        `GAIN : ${netGain > 0 ? "+" : ""}${netGain}$`,
        860, 775, 29,
        netGain > 0 ? "#72e6a2" : "#ff7777"
      );

      // Solde
      centerText(
        `💰 SOLDE ACTUEL : ${newBalance}$`,
        600, 845, 35, "#e5c18b"
      );

      // Enregistrement
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const imagePath = path.join(
        cacheDir,
        `royal_slot_${senderID}_${Date.now()}.png`
      );

      await fs.writeFile(
        imagePath,
        canvas.toBuffer("image/png")
      );

      // Envoi de l'image
      return message.reply(
        {
          body:
            `👑 𝗖𝗔𝗦𝗜𝗡𝗢 𝗥𝗢𝗬𝗔𝗟 𝗗𝗔𝗥𝗞\n` +
            `━━━━━━━━━━━━━━\n` +
            `${result}\n` +
            `💰 Solde : ${newBalance}$\n` +
            `━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(imagePath)
        },
        () => {
          if (fs.existsSync(imagePath))
            fs.unlinkSync(imagePath);
        }
      );

    } catch (error) {
      console.error("Erreur SLOT :", error);
      return message.reply(getLang("error"));
    }
  }
};

// Retourne le montant total versé par la machine
function calculatePayout(slot1, slot2, slot3, bet) {
  if (slot1 === "💎" && slot2 === "💎" && slot3 === "💎")
    return bet * 10;

  if (slot1 === "7️⃣" && slot2 === "7️⃣" && slot3 === "7️⃣")
    return bet * 5;

  if (slot1 === slot2 && slot2 === slot3)
    return bet * 3;

  if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3)
    return bet * 2;

  return 0;
                    }
