
const Canvas = require("canvas");
const { createCanvas, loadImage, registerFont } = Canvas;
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

let policeChargee = false;

async function chargerPoliceBienvenue() {
  if (policeChargee) return;

  try {
    const cheminPolice = path.join(
      __dirname,
      "cache",
      "tt-modernoir-trial.bold.ttf"
    );

    if (!await fs.pathExists(cheminPolice)) {
      const adressePolice =
        "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";

      const reponse = await axios.get(adressePolice, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      await fs.outputFile(cheminPolice, reponse.data);
    }

    registerFont(cheminPolice, {
      family: "ModernoirBold"
    });

    policeChargee = true;
  } catch (erreur) {
    console.error("Erreur lors du chargement de la police :", erreur.message);
  }
}

function dessinerRectangleArrondi(ctx, x, y, largeur, hauteur, rayon) {
  ctx.beginPath();
  ctx.moveTo(x + rayon, y);
  ctx.lineTo(x + largeur - rayon, y);
  ctx.quadraticCurveTo(x + largeur, y, x + largeur, y + rayon);
  ctx.lineTo(x + largeur, y + hauteur - rayon);
  ctx.quadraticCurveTo(
    x + largeur,
    y + hauteur,
    x + largeur - rayon,
    y + hauteur
  );
  ctx.lineTo(x + rayon, y + hauteur);
  ctx.quadraticCurveTo(
    x,
    y + hauteur,
    x,
    y + hauteur - rayon
  );
  ctx.lineTo(x, y + rayon);
  ctx.quadraticCurveTo(x, y, x + rayon, y);
  ctx.closePath();
}

function ajusterTexte(ctx, texte, largeurMax, tailleInitiale) {
  let taille = tailleInitiale;

  while (taille > 15) {
    ctx.font = `bold ${taille}px ModernoirBold, Arial`;

    if (ctx.measureText(texte).width <= largeurMax)
      break;

    taille -= 2;
  }

  return taille;
}

function dessinerCoin(ctx, x, y, horizontal, vertical) {
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

async function creerCarteBienvenue({
  userID,
  userName,
  threadName,
  memberCount,
  usersData
}) {
  await chargerPoliceBienvenue();

  const largeur = 900;
  const hauteur = 1200;

  const canvas = createCanvas(largeur, hauteur);
  const ctx = canvas.getContext("2d");

  // Arrière-plan principal
  const degrade = ctx.createLinearGradient(0, 0, largeur, hauteur);
  degrade.addColorStop(0, "#08060d");
  degrade.addColorStop(0.45, "#21102f");
  degrade.addColorStop(1, "#07050b");

  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, largeur, hauteur);

  // Halo violet
  const halo = ctx.createRadialGradient(
    450, 440, 20,
    450, 440, 520
  );

  halo.addColorStop(0, "rgba(147, 51, 234, 0.23)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, largeur, hauteur);

  // Cadre extérieur
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 5;

  dessinerRectangleArrondi(
    ctx,
    25,
    25,
    largeur - 50,
    hauteur - 50,
    30
  );

  ctx.stroke();

  // Cadre intérieur
  ctx.strokeStyle = "rgba(216, 180, 254, 0.45)";
  ctx.lineWidth = 2;

  dessinerRectangleArrondi(
    ctx,
    43,
    43,
    largeur - 86,
    hauteur - 86,
    24
  );

  ctx.stroke();

  // Décoration des quatre coins
  dessinerCoin(ctx, 55, 55, 1, 1);
  dessinerCoin(ctx, 845, 55, -1, 1);
  dessinerCoin(ctx, 55, 1145, 1, -1);
  dessinerCoin(ctx, 845, 1145, -1, -1);

  // Décoration supérieure
  ctx.textAlign = "center";
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 34px Arial";
  ctx.fillText("𖤐", 450, 115);

  // Titre principal
  ctx.fillStyle = "#e9d5ff";
  ctx.font = "bold 43px ModernoirBold, Arial";
  ctx.fillText("NOUVELLE ÂME", 450, 185);

  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(180, 215);
  ctx.lineTo(720, 215);
  ctx.stroke();

  // Cadre de la photo de profil
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

  // Chargement de la photo du membre
  try {
    let adressePhoto;

    if (usersData && usersData.getAvatarUrl)
      adressePhoto = await usersData.getAvatarUrl(userID);

    if (!adressePhoto)
      throw new Error("Photo de profil indisponible");

    const avatar = await loadImage(adressePhoto);

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

    const echelle = Math.max(
      (avatarRadius * 2) / avatar.width,
      (avatarRadius * 2) / avatar.height
    );

    const largeurPhoto = avatar.width * echelle;
    const hauteurPhoto = avatar.height * echelle;

    ctx.drawImage(
      avatar,
      avatarX - largeurPhoto / 2,
      avatarY - hauteurPhoto / 2,
      largeurPhoto,
      hauteurPhoto
    );

    ctx.restore();

  } catch (erreur) {
    // Image de remplacement si la photo est indisponible
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

    const initiale = String(userName || "?")
      .trim()
      .charAt(0)
      .toUpperCase();

    ctx.fillStyle = "#e9d5ff";
    ctx.font = "bold 130px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initiale, avatarX, avatarY);

    ctx.textBaseline = "alphabetic";
  }

  ctx.restore();

  // Nom du membre
  ctx.textAlign = "center";

  const nomSecurise = String(userName || "Nouveau membre");
  const tailleNom = ajusterTexte(ctx, nomSecurise, 740, 48);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${tailleNom}px ModernoirBold, Arial`;

  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 15;

  ctx.fillText(nomSecurise, 450, 730);

  ctx.shadowBlur = 0;

  // Décoration
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 28px Arial";
  ctx.fillText("𓆩 🥀 𓆪", 450, 785);

  // Nom du groupe
  ctx.fillStyle = "#c4b5fd";
  ctx.font = "bold 24px ModernoirBold, Arial";

  ctx.fillText("BIENVENUE DANS", 450, 855);

  const nomGroupe = String(threadName || "Groupe");
  const tailleGroupe = ajusterTexte(ctx, nomGroupe, 720, 35);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${tailleGroupe}px ModernoirBold, Arial`;

  ctx.fillText(nomGroupe, 450, 905);

  // Numéro du membre
  ctx.strokeStyle = "rgba(192, 132, 252, 0.6)";
  ctx.lineWidth = 2;

  dessinerRectangleArrondi(ctx, 250, 960, 400, 75, 18);
  ctx.stroke();

  ctx.fillStyle = "#e9d5ff";
  ctx.font = "bold 27px ModernoirBold, Arial";

  ctx.fillText(
    `MEMBRE N° ${memberCount}`,
    450,
    1007
  );

  // Signature du réseau
  ctx.fillStyle = "#a78bfa";
  ctx.font = "bold 23px ModernoirBold, Arial";

  ctx.fillText("𖤐 DARK NETWORK 𖤐", 450, 1090);

  ctx.fillStyle = "#c084fc";
  ctx.font = "22px Arial";

  ctx.fillText("BIENVENUE DANS LES TÉNÈBRES", 450, 1125);

  const flux = canvas.createPNGStream();
  flux.path = `bienvenue_${userID}.png`;

  return flux;
}

module.exports = {
  config: {
    name: "welcome",
    version: "6.1",
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

      const participantsAjoutes =
        logMessageData.addedParticipants || [];

      if (!participantsAjoutes.length)
        return;

      // CAS 1 : Le bot est ajouté au groupe
      const botAjoute = participantsAjoutes.some(
        participant => participant.userFbId == botID
      );

      if (botAjoute) {
        const surnom =
          global.GoatBot?.config?.nickNameBot || "DARK SYSTEM";

        const prefixeConfigure =
          global.GoatBot?.config?.prefix || "-";

        const prefixe = Array.isArray(prefixeConfigure)
          ? prefixeConfigure[0]
          : prefixeConfigure;

        try {
          await api.changeNickname(surnom, threadID, botID);
        } catch (erreur) {
          console.error("Erreur lors du changement de surnom :", erreur);
        }

        
const messageBot =

const messageBot =
`𓆩 ⚜️ 𓆪 𝗗𝗔𝗥𝗞 𝗦𝗬𝗦𝗧𝗘𝗠 𓆩 ⚜️ 𓆪

╭───────「 🦇 」───────╮
     𝗖𝗢𝗡𝗡𝗘𝗫𝗜𝗢𝗡 𝗘́𝗧𝗔𝗕𝗟𝗜𝗘
╰────────────────────╯

♛ 𝗔ssistant : ${surnom}
♛ 𝗣réfixe : ${prefixe}
♛ 𝗠enu : ${prefixe}help
♛ 𝗘́tat : Opérationnel

𓆩 🥀 𓆪 Le système est activé.
Bienvenue dans les ténèbres.`;

await api.sendMessage(messageBot, threadID);
return;
      }

      // CAS 2 : De nouveaux membres rejoignent le groupe
      const donneesGroupe = await threadsData.get(threadID);
      const nomGroupe = donneesGroupe.threadName || "Groupe";

      const informationsGroupe = await api.getThreadInfo(threadID);

      const nouveauxMembres = participantsAjoutes.filter(
        participant => participant.userFbId != botID
      );

      // Calcul du nombre de membres
      let nombreMembres =
        informationsGroupe.participantIDs.length - nouveauxMembres.length + 1;

      for (const membre of nouveauxMembres) {
        const identifiantMembre = membre.userFbId;

        if (!identifiantMembre)
          continue;

        let nomMembre = membre.fullName || "Nouveau membre";

        try {
          if (usersData && usersData.getName)
            nomMembre = await usersData.getName(identifiantMembre) || nomMembre;
        } catch (erreur) {
          console.error("Erreur lors de la récupération du nom :", erreur);
        }

        try {
          const carte = await creerCarteBienvenue({
            userID: identifiantMembre,
            userName: nomMembre,
            threadName: nomGroupe,
            memberCount: nombreMembres,
            usersData
          });

          await message.send({
            attachment: carte
          });

        } catch (erreur) {
          console.error("Erreur lors de la création de la carte :", erreur);

          await message.send(
            `𓆩 🦇 𓆪 Bienvenue ${nomMembre} dans ${nomGroupe} ! 🥀`
          );
        }

        nombreMembres++;
      }

    } catch (erreur) {
      console.error("Erreur dans le fichier welcome.js :", erreur);
    }
  }
};
