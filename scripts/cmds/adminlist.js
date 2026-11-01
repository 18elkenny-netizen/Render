const Canvas = require("canvas");
const { createCanvas, loadImage } = Canvas;

function dessinerRectangle(ctx, x, y, largeur, hauteur, rayon) {
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

  while (taille > 14) {
    ctx.font = `bold ${taille}px Arial`;

    if (ctx.measureText(texte).width <= largeurMax)
      break;

    taille -= 2;
  }

  return taille;
}

async function creerCarteAdministrateurs(administrateurs) {
  const largeur = 1000;
  const hauteurEntete = 300;
  const hauteurLigne = 180;
  const hauteurPied = 100;

  const nombreLignes = Math.ceil(administrateurs.length / 2);
  const hauteur = hauteurEntete + nombreLignes * hauteurLigne + hauteurPied;

  const canvas = createCanvas(largeur, hauteur);
  const ctx = canvas.getContext("2d");

  // Arrière-plan
  const fond = ctx.createLinearGradient(0, 0, largeur, hauteur);
  fond.addColorStop(0, "#08060d");
  fond.addColorStop(0.5, "#21102f");
  fond.addColorStop(1, "#07050b");

  ctx.fillStyle = fond;
  ctx.fillRect(0, 0, largeur, hauteur);

  // Halo violet
  const halo = ctx.createRadialGradient(
    500, 150, 10,
    500, 150, 600
  );

  halo.addColorStop(0, "rgba(147, 51, 234, 0.25)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, largeur, hauteur);

  // Cadre extérieur
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 5;

  dessinerRectangle(ctx, 20, 20, largeur - 40, hauteur - 40, 25);
  ctx.stroke();

  // Cadre intérieur
  ctx.strokeStyle = "rgba(216, 180, 254, 0.4)";
  ctx.lineWidth = 2;

  dessinerRectangle(ctx, 38, 38, largeur - 76, hauteur - 76, 20);
  ctx.stroke();

  // Titre
  ctx.textAlign = "center";
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 38px Arial";
  ctx.fillText("𓆩 ⚜️ 𓆪", 500, 95);

  ctx.fillStyle = "#e9d5ff";
  ctx.font = "bold 48px Arial";
  ctx.fillText("LISTE DES ADMINISTRATEURS", 500, 155);

  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(150, 185);
  ctx.lineTo(850, 185);
  ctx.stroke();

  // Nombre d'administrateurs
  ctx.fillStyle = "#c4b5fd";
  ctx.font = "bold 30px Arial";
  ctx.fillText(
    `TOTAL : ${administrateurs.length} ADMINISTRATEUR(S)`,
    500,
    245
  );

  // Cartes des administrateurs
  for (let i = 0; i < administrateurs.length; i++) {
    const admin = administrateurs[i];

    const colonne = i % 2;
    const ligne = Math.floor(i / 2);

    const x = colonne === 0 ? 65 : 515;
    const y = 300 + ligne * hauteurLigne;

    // Fond de la carte
    ctx.fillStyle = "rgba(35, 17, 52, 0.9)";
    dessinerRectangle(ctx, x, y, 420, 145, 20);
    ctx.fill();

    ctx.strokeStyle = "rgba(192, 132, 252, 0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Photo de profil
    const centreX = x + 78;
    const centreY = y + 72;
    const rayon = 48;

    ctx.save();

    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(centreX, centreY, rayon + 5, 0, Math.PI * 2);
    ctx.fillStyle = "#a855f7";
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(centreX, centreY, rayon, 0, Math.PI * 2);
    ctx.clip();

    try {
      if (!admin.photo)
        throw new Error("Photo indisponible");

      const avatar = await loadImage(admin.photo);

      const echelle = Math.max(
        (rayon * 2) / avatar.width,
        (rayon * 2) / avatar.height
      );

      const largeurPhoto = avatar.width * echelle;
      const hauteurPhoto = avatar.height * echelle;

      ctx.drawImage(
        avatar,
        centreX - largeurPhoto / 2,
        centreY - hauteurPhoto / 2,
        largeurPhoto,
        hauteurPhoto
      );

    } catch (erreur) {
      ctx.fillStyle = "#21102f";
      ctx.fill();

      ctx.fillStyle = "#e9d5ff";
      ctx.font = "bold 42px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        String(admin.nom || "?").charAt(0).toUpperCase(),
        centreX,
        centreY
      );

      ctx.textBaseline = "alphabetic";
    }

    ctx.restore();

    // Numéro de l'administrateur
    ctx.textAlign = "left";
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 20px Arial";

    ctx.fillText(`ADMINISTRATEUR N° ${i + 1}`, x + 145, y + 48);

    // Nom de l'administrateur
    const nom = String(admin.nom || "Nom inconnu");
    const tailleNom = ajusterTexte(ctx, nom, 245, 27);

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${tailleNom}px Arial`;

    ctx.fillText(nom, x + 145, y + 90);

    // Statut
    ctx.fillStyle = "#c4b5fd";
    ctx.font = "bold 19px Arial";

    ctx.fillText("♛ Administrateur", x + 145, y + 122);
  }

  // Signature
  ctx.textAlign = "center";
  ctx.fillStyle = "#a78bfa";
  ctx.font = "bold 25px Arial";

  ctx.fillText(
    "𖤐 DARK NETWORK 𖤐",
    500,
    hauteur - 55
  );

  const flux = canvas.createPNGStream();
  flux.path = "dark-network-adminlist.png";

  return flux;
}

module.exports = {
  config: {
    name: "adminlist",
    aliases: ["admins", "admin"],
    version: "1.0",
    author: "Dark",
    countDown: 5,
    role: 0,
    shortDescription: {
      fr: "Afficher la liste des administrateurs du groupe"
    },
    longDescription: {
      fr: "Affiche les photos, les noms et le nombre des administrateurs du groupe."
    },
    category: "groupe",
    guide: {
      fr: "{pn}"
    }
  },

  onStart: async ({ api, event, message, usersData }) => {
    try {
      const threadID = event.threadID;

      // Récupération des informations du groupe
      const informations = await api.getThreadInfo(threadID);

      const listeAdmins = informations.adminIDs || [];

      if (!listeAdmins.length) {
        return message.send(
          "𓆩 🦇 𓆪 Aucun administrateur n'a été trouvé dans ce groupe."
        );
      }

      // Récupération des noms et des photos
      const administrateurs = [];

      for (const admin of listeAdmins) {
        const identifiant = admin.id || admin.userFbId;

        if (!identifiant)
          continue;

        let nom = admin.name || "Administrateur";
        let photo = null;

        try {
          if (usersData && usersData.getName) {
            nom = await usersData.getName(identifiant) || nom;
          }
        } catch (erreur) {
          console.error("Erreur de récupération du nom :", erreur.message);
        }

        try {
          if (usersData && usersData.getAvatarUrl) {
            photo = await usersData.getAvatarUrl(identifiant);
          }
        } catch (erreur) {
          console.error("Erreur de récupération de la photo :", erreur.message);
        }

        administrateurs.push({
          id: identifiant,
          nom,
          photo
        });
      }

      if (!administrateurs.length) {
        return message.send(
          "Impossible de récupérer les administrateurs de ce groupe."
        );
      }

      // Création et envoi de la carte
      const carte = await creerCarteAdministrateurs(administrateurs);

      await message.send({
        attachment: carte
      });

    } catch (erreur) {
      console.error("Erreur dans adminlist.js :", erreur);

      message.send(
        "Une erreur est survenue lors de la création de la liste des administrateurs."
      );
    }
  }
};
    
