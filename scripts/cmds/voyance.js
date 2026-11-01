const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const { Readable } = require("stream");

const THEMES = [
  {
    name: "MYSTIC PURPLE",
    bg: ["#100b24", "#39205c", "#160d30"],
    primary: "#bd8aff",
    secondary: "#7546b8",
    text: "#f2e6ff",
    particle: "#d9baff",
    footer: "✦ THE FUTURE IS MYSTERIOUS ✦"
  },
  {
    name: "BLOOD ORACLE",
    bg: ["#17070b", "#571b2c", "#210b16"],
    primary: "#ff647c",
    secondary: "#a52e4b",
    text: "#ffe5e9",
    particle: "#ff9eaa",
    footer: "♥ YOUR DESTINY AWAITS ♥"
  },
  {
    name: "CELESTIAL GOLD",
    bg: ["#171021", "#59412b", "#24172b"],
    primary: "#eac477",
    secondary: "#a77c3c",
    text: "#fff1ce",
    particle: "#ffe4a1",
    footer: "✧ THE STARS HAVE SPOKEN ✧"
  },
  {
    name: "MIDNIGHT BLUE",
    bg: ["#071323", "#153b65", "#09192c"],
    primary: "#6ec9ff",
    secondary: "#2675b6",
    text: "#e0f4ff",
    particle: "#b3e5ff",
    footer: "❄ YOUR FATE IS WRITTEN ✧"
  },
  {
    name: "DARK PROPHECY",
    bg: ["#080808", "#28212c", "#100c14"],
    primary: "#c18bda",
    secondary: "#654276",
    text: "#f5eafa",
    particle: "#d5a9ed",
    footer: "𓆩 THE DARKNESS KNOWS 𓆪"
  }
];

const PREDICTIONS = {
  general: [
    {
      title: "UN NOUVEAU DÉPART",
      text: "Une nouvelle opportunité va bientôt apparaître dans ta vie. Ne la laisse pas passer.",
      symbol: "✦",
      level: "DESTIN FAVORABLE"
    },
    {
      title: "UN SECRET RÉVÉLÉ",
      text: "Une vérité que tu ignores pourrait bientôt changer ta manière de voir quelqu'un.",
      symbol: "🔮",
      level: "MYSTÈRE"
    },
    {
      title: "UNE SURPRISE INATTENDUE",
      text: "Une personne que tu n'attends plus pourrait refaire surface.",
      symbol: "✧",
      level: "DESTIN"
    },
    {
      title: "LE CALME AVANT L'ORAGE",
      text: "Une période de changement approche. Prépare-toi à prendre une décision importante.",
      symbol: "☾",
      level: "AVERTISSEMENT"
    },
    {
      title: "UNE BELLE RENCONTRE",
      text: "Ton chemin pourrait croiser celui d'une personne qui deviendra importante pour toi.",
      symbol: "♡",
      level: "BON PRÉSAGE"
    },
    {
      title: "LA FORCE INTÉRIEURE",
      text: "Tu possèdes plus de courage que tu ne le penses. Une difficulté te permettra de le découvrir.",
      symbol: "♛",
      level: "PUISSANCE"
    }
  ],

  amour: [
    {
      title: "UN CŒUR MYSTÉRIEUX",
      text: "Quelqu'un pourrait éprouver des sentiments pour toi sans oser te les avouer.",
      symbol: "♥",
      level: "SECRET AMOUREUX"
    },
    {
      title: "UN RETOUR INATTENDU",
      text: "Une personne de ton passé pourrait revenir dans tes pensées... ou dans ta vie.",
      symbol: "🥀",
      level: "PASSÉ"
    },
    {
      title: "UNE RENCONTRE",
      text: "Une nouvelle personne pourrait bientôt attirer ton attention.",
      symbol: "♡",
      level: "ROMANCE"
    },
    {
      title: "LE CŒUR BRISÉ",
      text: "Ne donne pas toute ton attention à quelqu'un qui ne sait pas reconnaître ta valeur.",
      symbol: "💔",
      level: "AVERTISSEMENT"
    },
    {
      title: "AMOUR INATTENDU",
      text: "L'amour pourrait se trouver beaucoup plus près que tu ne l'imagines.",
      symbol: "♥",
      level: "BON PRÉSAGE"
    }
  ],

  richesse: [
    {
      title: "LA FORTUNE APPROCHE",
      text: "Une occasion intéressante pourrait améliorer ta situation financière.",
      symbol: "♛",
      level: "ABONDANCE"
    },
    {
      title: "PATIENCE ET RÉUSSITE",
      text: "Tes efforts pourraient bientôt porter leurs fruits. Continue d'avancer.",
      symbol: "✦",
      level: "RÉUSSITE"
    },
    {
      title: "UNE DÉPENSE INATTENDUE",
      text: "Réfléchis avant de dépenser. Toutes les occasions ne méritent pas ton argent.",
      symbol: "⚠",
      level: "PRUDENCE"
    },
    {
      title: "UNE OPPORTUNITÉ",
      text: "Une nouvelle possibilité pourrait t'aider à réaliser un projet important.",
      symbol: "💰",
      level: "CHANCE"
    }
  ],

  avenir: [
    {
      title: "UN CHEMIN INCONNU",
      text: "Ton avenir prendra peut-être une direction que tu n'avais jamais imaginée.",
      symbol: "☾",
      level: "DESTIN"
    },
    {
      title: "LA GRANDE RÉUSSITE",
      text: "Une période favorable pourrait t'aider à atteindre un objectif longtemps attendu.",
      symbol: "✧",
      level: "BON PRÉSAGE"
    },
    {
      title: "UN CHOIX IMPORTANT",
      text: "Une décision pourrait changer la suite de ton parcours. Prends le temps de réfléchir.",
      symbol: "♜",
      level: "AVERTISSEMENT"
    },
    {
      title: "UNE NOUVELLE PAGE",
      text: "Tu pourrais bientôt laisser derrière toi une situation qui ne te convient plus.",
      symbol: "✦",
      level: "RENOUVEAU"
    }
  ],

  chance: [
    {
      title: "CHANCE EXCEPTIONNELLE",
      text: "Aujourd'hui, tout semble conspirer en ta faveur. Profite de cette bonne humeur.",
      symbol: "🍀",
      level: "TRÈS FAVORABLE"
    },
    {
      title: "LA CHANCE PATIENTE",
      text: "Une bonne occasion pourrait se présenter lorsque tu t'y attendras le moins.",
      symbol: "✧",
      level: "FAVORABLE"
    },
    {
      title: "JOUR DE PRUDENCE",
      text: "Évite de prendre des décisions précipitées. La patience sera ton meilleur allié.",
      symbol: "☾",
      level: "NEUTRE"
    },
    {
      title: "LE HASARD SOURIT",
      text: "Une petite surprise pourrait rendre ta journée beaucoup plus agréable.",
      symbol: "🍀",
      level: "BON PRÉSAGE"
    }
  ],

  secret: [
    {
      title: "UNE PERSONNE T'OBSERVE",
      text: "Quelqu'un remarque tes actions en silence. Mais ses intentions restent inconnues.",
      symbol: "👁",
      level: "MYSTÈRE"
    },
    {
      title: "UN SECRET BIEN GARDÉ",
      text: "Une personne proche de toi ne raconte peut-être pas toute l'histoire.",
      symbol: "🔒",
      level: "SECRET"
    },
    {
      title: "UNE VÉRITÉ CACHÉE",
      text: "Quelque chose que tu cherches depuis longtemps pourrait être juste devant toi.",
      symbol: "♜",
      level: "RÉVÉLATION"
    },
    {
      title: "LE SILENCE PARLE",
      text: "Parfois, l'absence de réponse révèle davantage que mille paroles.",
      symbol: "☾",
      level: "MYSTÈRE"
    }
  ]
};

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function chargerAvatar(url) {
  try {
    if (!url) return null;

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 12000,
      maxContentLength: 5 * 1024 * 1024
    });

    return await loadImage(Buffer.from(response.data));
  } catch (error) {
    console.error("Erreur avatar voyance :", error.message);
    return null;
  }
}

function texteCentre(ctx, texte, x, y, largeur, taille) {
  let fontSize = taille;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  do {
    ctx.font = `bold ${fontSize}px Arial`;
    if (ctx.measureText(texte).width <= largeur) break;
    fontSize -= 2;
  } while (fontSize > 15);

  ctx.fillText(texte, x, y);
}

function texteMultiligne(ctx, texte, x, y, largeur, hauteurLigne) {
  const mots = texte.split(" ");
  let ligne = "";
  let positionY = y;

  ctx.textAlign = "center";

  for (const mot of mots) {
    const test = ligne ? `${ligne} ${mot}` : mot;

    if (ctx.measureText(test).width > largeur && ligne) {
      ctx.fillText(ligne, x, positionY);
      ligne = mot;
      positionY += hauteurLigne;
    } else {
      ligne = test;
    }
  }

  if (ligne) {
    ctx.fillText(ligne, x, positionY);
  }
}

function dessinerAvatar(ctx, avatar, nom, theme) {
  const x = 600;
  const y = 265;
  const rayon = 105;

  ctx.save();

  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 35;

  ctx.beginPath();
  ctx.arc(x, y, rayon + 17, 0, Math.PI * 2);
  ctx.fillStyle = theme.primary;
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(x, y, rayon + 9, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, rayon, 0, Math.PI * 2);
  ctx.clip();

  if (avatar) {
    const ratio = Math.max(
      (rayon * 2) / avatar.width,
      (rayon * 2) / avatar.height
    );

    const w = avatar.width * ratio;
    const h = avatar.height * ratio;

    ctx.drawImage(
      avatar,
      x - w / 2,
      y - h / 2,
      w,
      h
    );
  } else {
    ctx.fillStyle = theme.bg[1];
    ctx.fillRect(x - rayon, y - rayon, rayon * 2, rayon * 2);

    ctx.fillStyle = theme.text;
    ctx.font = "bold 90px Arial";
    ctx.textAlign = "center";
    ctx.fillText(nom.charAt(0).toUpperCase(), x, y + 25);
  }

  ctx.restore();

  ctx.fillStyle = theme.text;
  ctx.font = "bold 32px Arial";
  texteCentre(ctx, nom, x, 405, 850, 32);
}

function dessinerDecor(ctx, theme) {
  for (let i = 0; i < 90; i++) {
    const x = random(20, 1180);
    const y = random(20, 880);

    ctx.globalAlpha = random(25, 70) / 100;
    ctx.fillStyle = theme.particle;
    ctx.font = `${random(12, 27)}px Arial`;
    ctx.textAlign = "center";

    const symboles = ["✦", "✧", "·", "☾", "✴"];
    ctx.fillText(
      symboles[random(0, symboles.length - 1)],
      x,
      y
    );
  }

  ctx.globalAlpha = 1;
}

async function creerCarte(nom, avatarURL, prediction, theme, categorie) {
  const largeur = 1200;
  const hauteur = 900;

  const canvas = createCanvas(largeur, hauteur);
  const ctx = canvas.getContext("2d");

  // Fond magique
  const gradient = ctx.createLinearGradient(0, 0, largeur, hauteur);

  gradient.addColorStop(0, theme.bg[0]);
  gradient.addColorStop(0.5, theme.bg[1]);
  gradient.addColorStop(1, theme.bg[2]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, largeur, hauteur);

  // Décorations
  dessinerDecor(ctx, theme);

  // Bordure
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 12]);
  ctx.strokeRect(17, 17, largeur - 34, hauteur - 34);
  ctx.setLineDash([]);

  // Titre
  ctx.textAlign = "center";
  ctx.fillStyle = theme.text;
  ctx.font = "bold 49px Arial";
  ctx.fillText("𓆩 DARK VOYANCE 𓆪", largeur / 2, 75);

  ctx.font = "bold 25px Arial";
  ctx.fillStyle = theme.primary;
  ctx.fillText("✦ THE MYSTIC ORACLE ✦", largeur / 2, 125);

  // Avatar du joueur
  const avatar = await chargerAvatar(avatarURL);
  dessinerAvatar(ctx, avatar, nom, theme);

  // Cristal décoratif
  ctx.fillStyle = theme.primary;
  ctx.font = "bold 65px Arial";
  ctx.fillText("🔮", largeur / 2, 495);

  // Catégorie
  ctx.fillStyle = theme.text;
  ctx.font = "bold 24px Arial";
  ctx.fillText(`PRÉDICTION : ${categorie.toUpperCase()}`, largeur / 2, 555);

  // Cadre de prédiction
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(105, 585, 990, 190);

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2;
  ctx.strokeRect(105, 585, 990, 190);

  // Niveau
  ctx.fillStyle = theme.primary;
  ctx.font = "bold 23px Arial";
  ctx.fillText(`✦ ${prediction.level} ✦`, largeur / 2, 620);

  // Titre de la prédiction
  ctx.fillStyle = theme.text;
  ctx.font = "bold 31px Arial";
  texteCentre(
    ctx,
    prediction.title,
    largeur / 2,
    665,
    920,
    31
  );

  // Description
  ctx.fillStyle = theme.text;
  ctx.font = "24px Arial";

  texteMultiligne(
    ctx,
    prediction.text,
    largeur / 2,
    720,
    900,
    36
  );

  // Signature
  ctx.fillStyle = theme.primary;
  ctx.font = "bold 25px Arial";
  ctx.fillText(theme.footer, largeur / 2, 830);

  ctx.fillStyle = theme.text;
  ctx.font = "18px Arial";
  ctx.fillText(
    "Prédiction fictive • DARK SYSTEM",
    largeur / 2,
    870
  );

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "voyance",
    aliases: ["avenir", "oracle", "prediction"],
    version: "1.0",
    author: "Dark",
    countDown: 5,
    role: 0,
    shortDescription: {
      fr: "Découvrir sa prédiction mystique"
    },
    longDescription: {
      fr: "Un oracle mystérieux révèle des prédictions amusantes."
    },
    category: "fun",
    guide: {
      fr:
        "{pn}\n" +
        "{pn} amour\n" +
        "{pn} richesse\n" +
        "{pn} avenir\n" +
        "{pn} chance\n" +
        "{pn} secret"
    }
  },

  onStart: async function ({ event, message, args, usersData }) {
    try {
      const userID = String(event.senderID);

      const categories = {
        amour: "amour",
        richesse: "richesse",
        avenir: "avenir",
        chance: "chance",
        secret: "secret"
      };

      const choix = String(args[0] || "general").toLowerCase();
      const categorie = categories[choix] || "general";

      const nom = await usersData.getName(userID);
      const avatar = await usersData.getAvatarUrl(userID);

      const liste = PREDICTIONS[categorie];
      const prediction = liste[random(0, liste.length - 1)];

      const theme = THEMES[random(0, THEMES.length - 1)];

      const image = await creerCarte(
        nom || "Voyageur",
        avatar,
        prediction,
        theme,
        categorie === "general" ? "Générale" : categorie
      );

      return message.send({
        body:
          `𓆩 🔮 𓆪 DARK VOYANCE\n\n` +
          `👤 ${nom || "Voyageur"}\n` +
          `✦ ${prediction.title}\n` +
          `🎭 Thème : ${theme.name}\n\n` +
          "Les prédictions sont fictives et destinées au divertissement.",
        attachment: Readable.from(image),
        mentions: [
          {
            id: userID,
            tag: nom || "Voyageur"
          }
        ]
      });

    } catch (error) {
      console.error("Erreur DARK VOYANCE :", error);

      return message.send(
        "𓆩 ⚠️ 𓆪 L'oracle n'a pas réussi à révéler ta prédiction."
      );
    }
  }
};
    
