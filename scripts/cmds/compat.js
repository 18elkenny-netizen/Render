
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const { Readable } = require("stream");

const THEMES = [
  {
    name: "ICE PALACE",
    subtitle: "LOVE CONNECTION",
    background: ["#e8faff", "#9bdcf5", "#d9f4ff"],
    primary: "#168bd3",
    secondary: "#65c9f4",
    text: "#07518c",
    particle: "#ffffff",
    particleType: "snow",
    footer: "❄ Eternal Love ❄",
    quote: "Cold outside, warm inside"
  },
  {
    name: "LOVE ROMANCE",
    subtitle: "SWEET CONNECTION",
    background: ["#ffe0ec", "#ff9fca", "#fff0f6"],
    primary: "#e83e83",
    secondary: "#ff80ad",
    text: "#a51c59",
    particle: "#ffffff",
    particleType: "heart",
    footer: "♡ Forever Together ♡",
    quote: "Two hearts, one destiny"
  },
  {
    name: "ETERNAL LOVE",
    subtitle: "PASSION CONNECTION",
    background: ["#ffe0e0", "#ff9b9b", "#fff0e8"],
    primary: "#dc3545",
    secondary: "#ff7373",
    text: "#921b2b",
    particle: "#ffffff",
    particleType: "heart",
    footer: "♥ Eternal Love ♥",
    quote: "Love is written in the stars"
  },
  {
    name: "PURPLE LOVE",
    subtitle: "MAGICAL CONNECTION",
    background: ["#eee0ff", "#c49aff", "#f6edff"],
    primary: "#8546cf",
    secondary: "#bd8cff",
    text: "#50218c",
    particle: "#ffffff",
    particleType: "star",
    footer: "✦ Magical Love ✦",
    quote: "A mysterious connection"
  },
  {
    name: "DARK LOVE",
    subtitle: "DANGEROUS CONNECTION",
    background: ["#29152f", "#54243f", "#170e20"],
    primary: "#e34d82",
    secondary: "#a83c76",
    text: "#ffffff",
    particle: "#e9a4c4",
    particleType: "heart",
    footer: "♥ Love Beyond Darkness ♥",
    quote: "Even darkness has a heart"
  }
];

const PHRASES = [
  { min: 0, max: 10, title: "AMOUR IMPOSSIBLE", text: "Même Cupidon refuse de travailler aujourd'hui... 💔" },
  { min: 11, max: 25, title: "DESTIN COMPLIQUÉ", text: "Votre histoire risque d'être pleine de rebondissements." },
  { min: 26, max: 40, title: "ATTIRANCE MYSTÉRIEUSE", text: "Quelque chose se passe, mais personne ne veut l'avouer." },
  { min: 41, max: 60, title: "BELLE CONNEXION", text: "Une belle complicité pourrait naître entre vous." },
  { min: 61, max: 75, title: "COUPLE PROMETTEUR", text: "Les étoiles semblent vous rapprocher." },
  { min: 76, max: 89, title: "AMOUR EXCEPTIONNEL", text: "Votre connexion est vraiment spéciale !" },
  { min: 90, max: 99, title: "ÂMES SŒURS", text: "Le destin semble avoir écrit votre histoire." },
  { min: 100, max: 100, title: "AMOUR ÉTERNEL", text: "Une compatibilité parfaite ! Même les étoiles vous envient." }
];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function arrondirTexte(ctx, texte, x, y, largeur, hauteur, rayon) {
  ctx.beginPath();
  ctx.moveTo(x + rayon, y);
  ctx.lineTo(x + largeur - rayon, y);
  ctx.quadraticCurveTo(x + largeur, y, x + largeur, y + rayon);
  ctx.lineTo(x + largeur, y + hauteur - rayon);
  ctx.quadraticCurveTo(x + largeur, y + hauteur, x + largeur - rayon, y + hauteur);
  ctx.lineTo(x + rayon, y + hauteur);
  ctx.quadraticCurveTo(x, y + hauteur, x, y + hauteur - rayon);
  ctx.lineTo(x, y + rayon);
  ctx.quadraticCurveTo(x, y, x + rayon, y);
  ctx.closePath();
}

function dessinerTexte(ctx, texte, x, y, largeur, tailleMax = 35) {
  let taille = tailleMax;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  do {
    ctx.font = `bold ${taille}px Arial`;
    if (ctx.measureText(texte).width <= largeur) break;
    taille -= 2;
  } while (taille > 15);

  ctx.fillText(texte, x, y);
}

async function obtenirImage(url) {
  try {
    if (!url) return null;

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 12000,
      maxContentLength: 5 * 1024 * 1024
    });

    return await loadImage(Buffer.from(response.data));
  } catch (error) {
    console.error("Erreur chargement avatar :", error.message);
    return null;
  }
}

function dessinerAvatar(ctx, image, x, y, rayon, theme, nom) {
  // Ombre
  ctx.save();
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 25;

  // Anneaux décoratifs
  ctx.beginPath();
  ctx.arc(x, y, rayon + 22, 0, Math.PI * 2);
  ctx.fillStyle = theme.secondary;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, rayon + 14, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, rayon + 8, 0, Math.PI * 2);
  ctx.fillStyle = theme.primary;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, rayon, 0, Math.PI * 2);
  ctx.clip();

  if (image) {
    const ratio = Math.max(
      (rayon * 2) / image.width,
      (rayon * 2) / image.height
    );

    const largeur = image.width * ratio;
    const hauteur = image.height * ratio;

    ctx.drawImage(
      image,
      x - largeur / 2,
      y - hauteur / 2,
      largeur,
      hauteur
    );
  } else {
    ctx.fillStyle = theme.background[1];
    ctx.fillRect(x - rayon, y - rayon, rayon * 2, rayon * 2);

    ctx.fillStyle = theme.text;
    ctx.font = "bold 90px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(nom.charAt(0).toUpperCase(), x, y);
  }

  ctx.restore();

  // Bordure extérieure
  ctx.beginPath();
  ctx.arc(x, y, rayon + 25, 0, Math.PI * 2);
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Petit cœur décoratif
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "center";
  ctx.fillText("♥", x, y - rayon - 35);
}

function dessinerCoeur(ctx, x, y, taille, couleur) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(taille / 100, taille / 100);

  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.bezierCurveTo(-90, -30, -50, -85, 0, -40);
  ctx.bezierCurveTo(50, -85, 90, -30, 0, 30);

  ctx.fillStyle = couleur;
  ctx.fill();

  ctx.restore();
}

function dessinerDecor(ctx, theme, largeur, hauteur) {
  for (let i = 0; i < 75; i++) {
    const x = random(20, largeur - 20);
    const y = random(20, hauteur - 20);
    const taille = random(8, 22);

    ctx.globalAlpha = random(25, 65) / 100;
    ctx.fillStyle = theme.particle;
    ctx.font = `${taille}px Arial`;
    ctx.textAlign = "center";

    let symbole = "✦";

    if (theme.particleType === "heart") symbole = "♥";
    if (theme.particleType === "snow") symbole = "❄";
    if (theme.particleType === "star") symbole = "✧";

    ctx.fillText(symbole, x, y);
  }

  ctx.globalAlpha = 1;
}

async function creerCarte({
  nom1,
  nom2,
  avatar1,
  avatar2,
  pourcentage,
  theme
}) {
  const largeur = 1536;
  const hauteur = 900;

  const canvas = createCanvas(largeur, hauteur);
  const ctx = canvas.getContext("2d");

  // Fond dégradé
  const fond = ctx.createLinearGradient(0, 0, largeur, hauteur);
  fond.addColorStop(0, theme.background[0]);
  fond.addColorStop(0.5, theme.background[1]);
  fond.addColorStop(1, theme.background[2]);

  ctx.fillStyle = fond;
  ctx.fillRect(0, 0, largeur, hauteur);

  // Décoration
  dessinerDecor(ctx, theme, largeur, hauteur);

  // Bordure pointillée
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.setLineDash([15, 12]);
  arrondirTexte(ctx, 18, 18, largeur - 36, hauteur - 36, 25, 25);
  ctx.stroke();
  ctx.setLineDash([]);

  // Titre
  ctx.textAlign = "center";
  ctx.fillStyle = theme.text;
  ctx.font = "bold 52px Arial";
  ctx.fillText(`✦ ${theme.name} ✦`, largeur / 2, 75);

  ctx.font = "bold 34px Arial";
  ctx.fillText(`✦ ${theme.subtitle} ✦`, largeur / 2, 135);

  // Avatars
  const image1 = await obtenirImage(avatar1);
  const image2 = await obtenirImage(avatar2);

  dessinerAvatar(ctx, image1, 285, 415, 140, theme, nom1);
  dessinerAvatar(ctx, image2, 1251, 415, 140, theme, nom2);

  // Ligne centrale
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.setLineDash([18, 16]);
  ctx.beginPath();
  ctx.moveTo(435, 415);
  ctx.lineTo(1101, 415);
  ctx.stroke();
  ctx.setLineDash([]);

  // Cœur central
  dessinerCoeur(ctx, 768, 415, 125, theme.primary);

  // Noms des joueurs
  ctx.fillStyle = theme.text;
  ctx.font = "bold 35px Arial";

  dessinerTexte(ctx, nom1, 285, 610, 440, 35);
  dessinerTexte(ctx, nom2, 1251, 610, 440, 35);

  // Phrase romantique
  ctx.font = "bold 30px Arial";
  ctx.fillText(
    `❝ ${theme.quote} ❞`,
    largeur / 2,
    655
  );

  // Barre de progression
  const barreX = 490;
  const barreY = 705;
  const barreLargeur = 556;
  const barreHauteur = 25;

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  arrondirTexte(
    ctx,
    barreX,
    barreY,
    barreLargeur,
    barreHauteur,
    20
  );
  ctx.fill();

  const progression = barreLargeur * pourcentage / 100;

  const couleurBarre = ctx.createLinearGradient(
    barreX,
    barreY,
    barreX + barreLargeur,
    barreY
  );

  couleurBarre.addColorStop(0, theme.secondary);
  couleurBarre.addColorStop(1, theme.primary);

  ctx.fillStyle = couleurBarre;

  if (progression > 0) {
    arrondirTexte(
      ctx,
      barreX,
      barreY,
      progression,
      barreHauteur,
      20
    );
    ctx.fill();
  }

  // Pourcentage
  ctx.fillStyle = theme.text;
  ctx.font = "bold 52px Arial";
  ctx.fillText(`${pourcentage}%`, largeur / 2, 760);

  // Résultat
  const phrase = PHRASES.find(
    p => pourcentage >= p.min && pourcentage <= p.max
  );

  ctx.font = "bold 30px Arial";
  ctx.fillText(
    `✦ ${phrase.title} ✦`,
    largeur / 2,
    825
  );

  // Signature
  ctx.font = "bold 20px Arial";
  ctx.fillText(
    "𓆩 DARK SYSTEM 𓆪",
    largeur / 2,
    870
  );

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "compat",
    aliases: ["compatibilite", "couple", "love"],
    version: "2.0",
    author: "Dark",
    countDown: 5,
    role: 0,
    shortDescription: {
      fr: "Carte de compatibilité amoureuse"
    },
    longDescription: {
      fr: "Génère une carte illustrée avec les photos et noms de deux membres."
    },
    category: "fun",
    guide: {
      fr: "{pn} @membre"
    }
  },

  onStart: async function ({
    event,
    message,
    usersData
  }) {
    try {
      const senderID = String(event.senderID);
      const mentions = Object.keys(event.mentions || {});

      if (mentions.length === 0) {
        return message.send(
          "𓆩 💘 𓆪 DARK COMPATIBILITY\n\n" +
          "Mentionne une personne pour calculer votre compatibilité.\n\n" +
          "Exemple : -compat @membre"
        );
      }

      const targetID = String(mentions[0]);

      if (senderID === targetID) {
        return message.send(
          "🥀 Tu ne peux pas calculer ta compatibilité avec toi-même !"
        );
      }

      const nom1 = await usersData.getName(senderID);
      const nom2 = await usersData.getName(targetID);

      const avatar1 = await usersData.getAvatarUrl(senderID);
      const avatar2 = await usersData.getAvatarUrl(targetID);

      const pourcentage = random(0, 100);

      // Sélection aléatoire du thème à chaque utilisation.
      const theme = THEMES[random(0, THEMES.length - 1)];

      const image = await creerCarte({
        nom1: nom1 || "Joueur 1",
        nom2: nom2 || "Joueur 2",
        avatar1,
        avatar2,
        pourcentage,
        theme
      });

      return message.send({
        body:
          `𓆩 💘 𓆪 Compatibilité calculée !\n` +
          `Thème : ${theme.name}\n` +
          `Résultat : ${pourcentage}%\n\n` +
          `Ce résultat est fictif, juste pour s'amuser. ❤️`,
        attachment: Readable.from(image),
        mentions: [
          { id: senderID, tag: nom1 || "Joueur 1" },
          { id: targetID, tag: nom2 || "Joueur 2" }
        ]
      });

    } catch (error) {
      console.error("DARK COMPATIBILITY ERROR :", error);

      return message.send(
        "𓆩 ⚠️ 𓆪 Impossible de créer la carte de compatibilité."
      );
    }
  }
};
      
