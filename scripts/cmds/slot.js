
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "slot",
    version: "2.0.0",
    author: "Dark",
    shortDescription: {
      fr: "Machine à sous 🎰"
    },
    longDescription: {
      fr: "Joue à la machine à sous et tente de gagner le jackpot."
    },
    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
    guide: {
      fr: "{pn} <mise>"
    }
  },

  langs: {
    fr: {
      invalid_amount: "⚠️ Entre une mise valide et supérieure à 0.",
      not_enough_money: "💸 Tu n'as pas assez d'argent pour cette mise.",
      spin_message: "🎰 La machine tourne...",
      win_message: "🎉 Tu as gagné %1$ !",
      lose_message: "💀 Tu as perdu %1$.",
      jackpot_message: "💎 JACKPOT ! Tu remportes %1$ avec trois diamants !"
    }
  },

  onStart: async function ({
    args,
    message,
    event,
    usersData,
    getLang
  }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0)
      return message.reply(getLang("invalid_amount"));

    if (amount > userData.money)
      return message.reply(getLang("not_enough_money"));

    const slots = [
      "🍒", "🍋", "🍇", "🍉", "🔔",
      "7️⃣", "💎", "⭐", "🍀"
    ];

    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    const winnings = calculateWinnings(
      slot1,
      slot2,
      slot3,
      amount
    );

    const newBalance = userData.money + winnings;

    await usersData.set(senderID, {
      money: newBalance,
      data: userData.data
    });

    const isDiamondJackpot =
      slot1 === "💎" &&
      slot2 === "💎" &&
      slot3 === "💎";

    const isSevenJackpot =
      slot1 === "7️⃣" &&
      slot2 === "7️⃣" &&
      slot3 === "7️⃣";

    const isTriple = slot1 === slot2 && slot2 === slot3;
    const isPair = slot1 === slot2 || slot1 === slot3 || slot2 === slot3;

    let resultTitle;
    let resultColor;

    if (isDiamondJackpot) {
      resultTitle = "💎 DIAMOND JACKPOT";
      resultColor = "#f5d76e";
    } else if (isSevenJackpot) {
      resultTitle = "777 LUCKY JACKPOT";
      resultColor = "#f5d76e";
    } else if (isTriple) {
      resultTitle = "✨ TRIPLE WIN";
      resultColor = "#a78bfa";
    } else if (isPair) {
      resultTitle = "🎉 DOUBLE WIN";
      resultColor = "#60d394";
    } else {
      resultTitle = "💀 YOU LOST";
      resultColor = "#ef6464";
    }

    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext("2d");

    // Fond sombre
    const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
    gradient.addColorStop(0, "#090611");
    gradient.addColorStop(0.5, "#17102b");
    gradient.addColorStop(1, "#05040a");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 600);

    // Bordure
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, 964, 564);

    // Titre
    ctx.textAlign = "center";
    ctx.fillStyle = "#d8b4fe";
    ctx.font = "bold 55px Arial";
    ctx.fillText("DARK SLOT MACHINE", 500, 95);

    ctx.fillStyle = "#8b5cf6";
    ctx.font = "22px Arial";
    ctx.fillText("✦ TRY YOUR LUCK ✦", 500, 135);

    // Machine à sous
    const boxX = 125;
    const boxY = 180;
    const boxW = 750;
    const boxH = 190;

    ctx.fillStyle = "#100b1c";
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const positions = [290, 500, 710];

    positions.forEach((x) => {
      ctx.fillStyle = "#211735";
      ctx.fillRect(x - 85, 205, 170, 140);

      ctx.strokeStyle = "#6d4ca5";
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 85, 205, 170, 140);
    });

    // Symboles
    ctx.font = "82px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(slot1, positions[0], 275);
    ctx.fillText(slot2, positions[1], 275);
    ctx.fillText(slot3, positions[2], 275);

    // Résultat
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = resultColor;
    ctx.font = "bold 38px Arial";
    ctx.fillText(resultTitle, 500, 430);

    // Mise et gain
    ctx.fillStyle = "#ffffff";
    ctx.font = "26px Arial";
    ctx.fillText(`MISE : ${amount}$`, 280, 490);
    ctx.fillText(
      `GAIN : ${winnings > 0 ? "+" : ""}${winnings}$`,
      720,
      490
    );

    // Solde
    ctx.fillStyle = "#d8b4fe";
    ctx.font = "bold 34px Arial";
    ctx.fillText(`💰 SOLDE : ${newBalance}$`, 500, 545);

    const cacheDir = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir))
      fs.mkdirSync(cacheDir, { recursive: true });

    const imagePath = path.join(
      cacheDir,
      `slot_${senderID}_${Date.now()}.png`
    );

    fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));

    return message.reply({
      body: `🎰 𝗗𝗔𝗥𝗞 𝗦𝗟𝗢𝗧\n\n${resultTitle}\n💰 Solde actuel : ${newBalance}$`,
      attachment: fs.createReadStream(imagePath)
    }, () => {
      if (fs.existsSync(imagePath))
        fs.unlinkSync(imagePath);
    });
  }
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
  // Trois diamants : x10
  if (slot1 === "💎" && slot2 === "💎" && slot3 === "💎")
    return betAmount * 10;

  // Trois 7 : x5
  if (slot1 === "7️⃣" && slot2 === "7️⃣" && slot3 === "7️⃣")
    return betAmount * 5;

  // Trois symboles identiques : x3
  if (slot1 === slot2 && slot2 === slot3)
    return betAmount * 3;

  // Deux symboles identiques : x2
  if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3)
    return betAmount * 2;

  // Perte de la mise
  return -betAmount;
}
