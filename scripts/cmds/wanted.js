
const Canvas = require("canvas");
const { createCanvas, loadImage } = Canvas;
const { Readable } = require("stream");

async function creerAfficheRecherche(nom, photo, prime) {
  const largeur = 900;
  const hauteur = 1100;

  const canvas = createCanvas(largeur, hauteur);
  const ctx = canvas.getContext("2d");

  // Arrière-plan sombre
  const fond = ctx.createLinearGradient(0, 0, largeur, hauteur);
  fond.addColorStop(0, "#160606");
  fond.addColorStop(0.5, "#3b0808");
  fond.addColorStop(1, "#080303");

  ctx.fillStyle = fond;
  ctx.fillRect(0, 0, largeur, hauteur);

  // Texture décorative
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.fillRect(
      Math.random() * largeur,
      Math.random() * hauteur,
      Math.random() * 4 + 1,
      Math.random() * 4 + 1
    );
  }

  // Cadre extérieur
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 9;
  ctx.strokeRect(25, 25, largeur - 50, hauteur - 50);

  ctx.strokeStyle = "#fca5a5";
  ctx.lineWidth = 2;
  ctx.strokeRect(45, 45, largeur - 90, hauteur - 90);

  // Titre
  ctx.textAlign = "center";
  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 38px Arial";
  ctx.fillText("⚠ AVIS DE RECHERCHE ⚠", 450, 115);

  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 105px Arial";
  ctx.fillText("RECHERCHÉ", 450, 225);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 35px Arial";
  ctx.fillText("PERSONNE À RETROUVER", 450, 285);

  // Séparation
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(160, 320);
  ctx.lineTo(740, 320);
  ctx.stroke();

  // Cadre de la photo
  const photoX = 450;
  const photoY = 590;
  const photoLargeur = 400;
  const photoHauteur = 470;

  ctx.fillStyle = "#450a0a";
  ctx.fillRect(
    photoX - photoLargeur / 2 - 10,
    photoY - photoHauteur / 2 - 10,
    photoLargeur + 20,
    photoHauteur + 20
  );

  ctx.fillStyle = "#000000";
  ctx.fillRect(
    photoX - photoLargeur / 2,
    photoY - photoHauteur / 2,
    photoLargeur,
    photoHauteur
  );

  // Chargement de la photo
  try {
    if (!photo)
      throw new Error("Photo indisponible");

    const avatar = await loadImage(photo);

    const echelle = Math.max(
      photoLargeur / avatar.width,
      photoHauteur / avatar.height
    );

    const largeurPhoto = avatar.width * echelle;
    const hauteurPhoto = avatar.height * echelle;

    ctx.save();

    ctx.beginPath();
    ctx.rect(
      photoX - photoLargeur / 2,
      photoY - photoHauteur / 2,
      photoLargeur,
      photoHauteur
    );

    ctx.clip();

    ctx.drawImage(
      avatar,
      photoX - largeurPhoto / 2,
      photoY - hauteurPhoto / 2,
      largeurPhoto,
      hauteurPhoto
    );

    ctx.restore();

  } catch (erreur) {
    ctx.fillStyle = "#7f1d1d";
    ctx.font = "bold 120px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", photoX, photoY);
    ctx.textBaseline = "alphabetic";
  }

  // Nom de la personne recherchée
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  let tailleNom = 48;

  while (tailleNom > 20) {
    ctx.font = `bold ${tailleNom}px Arial`;

    if (ctx.measureText(nom).width <= 740)
      break;

    tailleNom -= 2;
  }

  ctx.font = `bold ${tailleNom}px Arial`;
  ctx.fillText(nom, 450, 875);

  // Prime
  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 30px Arial";
  ctx.fillText("PRIME OFFERTE", 450, 945);

  ctx.fillStyle = "#facc15";
  ctx.font = "bold 55px Arial";
  ctx.fillText(prime, 450, 1010);

  // Signature
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 22px Arial";
  ctx.fillText("𓆩 ☠️ 𓆪 DARK NETWORK 𓆩 ☠️ 𓆪", 450, 1060);

  return canvas.toBuffer("image/png");
}

function creerFlux(image) {
  const flux = Readable.from(image);
  flux.path = "dark-network-wanted.png";
  return flux;
}

module.exports = {
  config: {
    name: "wanted",
    aliases: ["recherche", "recherché"],
    version: "2.0",
    author: "Dark",
    countDown: 10,
    role: 0,
    shortDescription: {
      fr: "Créer une affiche de recherche"
    },
    longDescription: {
      fr: "Créer une affiche personnalisée et la diffuser dans un ou plusieurs groupes."
    },
    category: "divertissement",
    guide: {
      fr:
        "{pn} @membre : affiche dans le groupe actuel\n" +
        "{pn} @membre 10000000 : choisir la prime\n" +
        "{pn} @membre tous : diffuser dans tous les groupes\n" +
        "{pn} @membre 10000000 tous : prime personnalisée et diffusion générale"
    }
  },

  onStart: async ({
    event,
    message,
    usersData,
    threadsData,
    api,
    args
  }) => {
    try {
      const threadID = event.threadID;
      const senderID = event.senderID;

      // Déterminer la personne recherchée
      const mentions = Object.keys(event.mentions || {});

      let userID = mentions[0];

      if (!userID && event.messageReply) {
        userID = event.messageReply.senderID;
      }

      if (!userID) {
        userID = senderID;
      }

      // Déterminer le mode de diffusion
      const modeTous = args.some(
        arg => ["tous", "partout"].includes(String(arg).toLowerCase())
      );

      // Déterminer la prime
      const argumentPrime = args.find(arg => /^\d+$/.test(arg));

      const montantPrime = argumentPrime
        ? Number(argumentPrime)
        : 5000000;

      if (!Number.isSafeInteger(montantPrime) || montantPrime <= 0) {
        return message.send(
          "𓆩 ⚠️ 𓆪 Le montant de la prime est invalide."
        );
      }

      const prime = `${montantPrime.toLocaleString("fr-FR")} $`;

      // Vérification de l'autorisation de diffusion générale
      if (modeTous) {
        const administrateursBot =
          global.GoatBot?.config?.adminBot || [];

        const listeAutorisations = Array.isArray(administrateursBot)
          ? administrateursBot.map(String)
          : [String(administrateursBot)];

        if (!listeAutorisations.includes(String(senderID))) {
          return message.send(
            "𓆩 🔒 𓆪 Seuls les administrateurs du bot peuvent diffuser une affiche dans tous les groupes."
          );
        }
      }

      // Récupération du nom et de la photo
      const nom = await usersData.getName(userID) || "Inconnu";
      const photo = await usersData.getAvatarUrl(userID);

      // Création de l'affiche
      const image = await creerAfficheRecherche(
        nom,
        photo,
        prime
      );

      const texte =
`𓆩 ☠️ 𓆪 AVIS DE RECHERCHE 𓆩 ☠️ 𓆪

♛ Personne recherchée : ${nom}
♛ Prime offerte : ${prime}

𖤐 DARK NETWORK 𖤐`;

      // MODE 1 : Diffusion dans le groupe actuel
      if (!modeTous) {
        await message.send({
          body: texte,
          attachment: creerFlux(image)
        });

        return;
      }

      // MODE 2 : Diffusion dans tous les groupes
      if (!threadsData || typeof threadsData.getAll !== "function") {
        return message.send(
          "Impossible de récupérer la liste des groupes du bot."
        );
      }

      const listeGroupes = await threadsData.getAll();
      const groupesValides = [];

      // Vérifier les groupes auxquels le bot appartient
      for (const groupe of listeGroupes) {
        const identifiantGroupe = groupe.threadID;

        if (!identifiantGroupe)
          continue;

        try {
          const informations = await api.getThreadInfo(identifiantGroupe);

          if (informations && informations.isGroup) {
            groupesValides.push(identifiantGroupe);
          }
        } catch (erreur) {
          console.error(
            `Impossible de vérifier le groupe ${identifiantGroupe} :`,
            erreur.message
          );
        }
      }

      if (!groupesValides.length) {
        return message.send(
          "𓆩 ⚠️ 𓆪 Aucun groupe disponible pour la diffusion."
        );
      }

      let nombreEnvois = 0;
      let nombreErreurs = 0;

      // Envoyer l'affiche dans chaque groupe
      for (const identifiantGroupe of groupesValides) {
        try {
          await api.sendMessage(
            {
              body: texte,
              attachment: creerFlux(image)
            },
            identifiantGroupe
          );

          nombreEnvois++;

          // Petite pause pour limiter les envois trop rapides
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (erreur) {
          nombreErreurs++;

          console.error(
            `Erreur d'envoi dans le groupe ${identifiantGroupe} :`,
            erreur.message
          );
        }
      }

      // Résultat de la diffusion
      await message.send(
        `𓆩 ⚜️ 𓆪 DIFFUSION TERMINÉE

♛ Personne recherchée : ${nom}
♛ Prime offerte : ${prime}

♛ Groupes concernés : ${groupesValides.length}
♛ Envois réussis : ${nombreEnvois}
♛ Envois échoués : ${nombreErreurs}

𖤐 DARK NETWORK 𖤐`
      );

    } catch (erreur) {
      console.error("Erreur dans wanted.js :", erreur);

      message.send(
        "𓆩 ⚠️ 𓆪 Une erreur est survenue pendant la création ou la diffusion de l'affiche."
      );
    }
  }
};
