
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "bal",
    version: "1.0.0",
    author: "Dark",
    countDown: 5,
    role: 0,
    shortDescription: "Voir son argent",
    longDescription: "Affiche ton solde total",
    category: "economy",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event, usersData, api }) {
    try {
      const uid = event.senderID;
      const userData = await usersData.get(uid);
      const balance = Number(userData.money) || 0;

      let name = "Joueur";
      let avatar = null;

      try {
        const info = await api.getUserInfo(uid);
        const profile = info[uid] || info;
        name = profile.name || profile.fullName || name;

        const avatarUrl =
          profile.thumbSrc ||
          profile.profilePic ||
          profile.picture;

        if (avatarUrl) {
          const response = await axios.get(avatarUrl, {
            responseType: "arraybuffer"
          });
          avatar = await loadImage(response.data);
        }
      } catch (e) {
        console.log("Impossible de charger le profil :", e.message);
      }

      const width = 1000;
      const height = 600;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Fond
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#10091f");
      bg.addColorStop(0.5, "#251044");
      bg.addColorStop(1, "#080611");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Bordure dorée
      ctx.strokeStyle = "#d6ad55";
      ctx.lineWidth = 5;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Décoration
      ctx.fillStyle = "#d6ad55";
      ctx.font = "bold 38px Arial";
      ctx.textAlign = "center";
      ctx.fillText("♛  DARK CASINO  ♛", width / 2, 85);

      ctx.font = "bold 25px Arial";
      ctx.fillStyle = "#c7a6ff";
      ctx.fillText("PLAYER BALANCE", width / 2, 135);

      // Avatar
      if (avatar) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(500, 245, 75, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, 425, 170, 150, 150);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(500, 245, 78, 0, Math.PI * 2);
        ctx.strokeStyle = "#e6bd63";
        ctx.lineWidth = 5;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(500, 245, 75, 0, Math.PI * 2);
        ctx.fillStyle = "#382451";
        ctx.fill();
        ctx.strokeStyle = "#e6bd63";
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Nom du joueur
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px Arial";
      ctx.fillText(name.slice(0, 25), 500, 365);

      // Solde
      ctx.fillStyle = "#d6ad55";
      ctx.font = "bold 27px Arial";
      ctx.fillText("SOLDE TOTAL", 500, 430);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 55px Arial";

      let money = balance.toLocaleString("fr-FR") + " $";
      while (ctx.measureText(money).width > 850) {
        ctx.font = "bold 35px Arial";
        break;
      }

      ctx.fillText(money, 500, 505);

      // Bas de carte
      ctx.fillStyle = "#a58acb";
      ctx.font = "20px Arial";
      ctx.fillText("✦ YOUR FORTUNE, YOUR RULES ✦", 500, 555);

      const folder = path.join(__dirname, "cache");
      await fs.ensureDir(folder);

      const imagePath = path.join(folder, `balance_${uid}.png`);
      await fs.writeFile(imagePath, canvas.toBuffer("image/png"));

      message.reply({
        body: `💰 Voici ton solde total, ${name}.`,
        attachment: fs.createReadStream(imagePath)
      }, () => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });

    } catch (error) {
      console.error(error);
      message.reply("❌ Impossible d'afficher ton solde.");
    }
  }
};
