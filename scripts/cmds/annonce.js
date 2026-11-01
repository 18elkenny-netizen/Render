
module.exports = {
  config: {
    name: "annonce",
    aliases: ["broadcast", "diffusion"],
    version: "1.0",
    author: "Dark",
    countDown: 30,
    role: 2,
    shortDescription: {
      fr: "Envoyer une annonce dans tous les groupes"
    },
    longDescription: {
      fr: "Permet à l'administrateur du bot de diffuser une annonce dans tous les groupes."
    },
    category: "administration",
    guide: {
      fr: "{pn} Votre message à diffuser dans tous les groupes"
    }
  },

  onStart: async ({ api, event, args, message, threadsData }) => {
    try {
      const identifiantAdmin = String(event.senderID);

      // Vérification de l'administrateur du bot
      const administrateursBot =
        global.GoatBot?.config?.adminBot || [];

      const listeAdmins = Array.isArray(administrateursBot)
        ? administrateursBot.map(String)
        : [String(administrateursBot)];

      if (!listeAdmins.includes(identifiantAdmin)) {
        return message.send(
          "𓆩 🔒 𓆪 ACCÈS REFUSÉ\n\nSeul l'administrateur de DARK SYSTEM peut utiliser cette commande."
        );
      }

      // Récupération du message à diffuser
      const annonce = args.join(" ").trim();

      if (!annonce) {
        return message.send(
          `𓆩 ⚜️ 𓆪 UTILISATION DE LA COMMANDE

Pour envoyer une annonce dans tous les groupes :

- annonce Votre message

Exemple :
- annonce Le bot sera bientôt en maintenance. 🦇`
        );
      }

      // Récupération de tous les groupes
      const groupes = await threadsData.getAll();

      if (!Array.isArray(groupes) || groupes.length === 0) {
        return message.send(
          "𓆩 ⚠️ 𓆪 Aucun groupe n'a été trouvé."
        );
      }

      let envoisReussis = 0;
      let envoisEchoues = 0;

      // Préparation de l'annonce
      const messageAnnonce =
`𓆩 ⚜️ 𓆪 𝗔𝗡𝗡𝗢𝗡𝗖𝗘 𝗢𝗙𝗙𝗜𝗖𝗜𝗘𝗟𝗟𝗘

${annonce}

━━━━━━━━━━━━━━━━━━

𖤐 DARK SYSTEM 𖤐
Message officiel de l'administration.`;

      // Diffusion dans tous les groupes
      for (const groupe of groupes) {
        const identifiantGroupe = groupe.threadID;

        if (!identifiantGroupe)
          continue;

        try {
          const informations = await api.getThreadInfo(
            identifiantGroupe
          );

          if (!informations || !informations.isGroup)
            continue;

          await api.sendMessage(
            messageAnnonce,
            identifiantGroupe
          );

          envoisReussis++;

          // Pause entre les envois
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (erreur) {
          envoisEchoues++;

          console.error(
            `Erreur d'envoi dans le groupe ${identifiantGroupe} :`,
            erreur.message
          );
        }
      }

      // Bilan de la diffusion
      await message.send(
`𓆩 ⚜️ 𓆪 𝗗𝗜𝗙𝗙𝗨𝗦𝗜𝗢𝗡 𝗧𝗘𝗥𝗠𝗜𝗡𝗘́𝗘

♛ Messages envoyés : ${envoisReussis}
♛ Échecs : ${envoisEchoues}
♛ Groupes répertoriés : ${groupes.length}

𖤐 DARK SYSTEM 𖤐`
      );

    } catch (erreur) {
      console.error("Erreur dans annonce.js :", erreur);

      message.send(
        "𓆩 ⚠️ 𓆪 Une erreur est survenue pendant la diffusion de l'annonce."
      );
    }
  }
};
