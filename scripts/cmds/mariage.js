module.exports = {
  config: {
    name: "mariage",
    version: "1.0.0",
    author: "Dark",
    countDown: 5,
    role: 0,
    shortDescription: "Système de mariage",
    longDescription: "Se marier avec un autre membre",
    category: "social",
    guide: {
      en: "{pn} @mention | accepter | divorce"
    }
  },

  onStart: async function ({ message, event, usersData, args }) {
    try {
      const uid = event.senderID;
      const mentions = event.mentions || {};
      const action = (args[0] || "").toLowerCase();

      const getData = async (id) => {
        const user = await usersData.get(id);
        return {
          user,
          data: { ...(user.data || {}) }
        };
      };

      const saveData = async (id, user, data) => {
        await usersData.set(id, {
          ...user,
          data
        });
      };

      const { user: me, data: myData } = await getData(uid);

      // ACCEPTER UNE DEMANDE
      if (action === "accepter" || action === "accept") {
        const proposal = myData.marriageProposal;

        if (!proposal) {
          return message.reply("💔 Tu n'as aucune demande en mariage.");
        }

        const partnerID = proposal.from;
        const { user: partner, data: partnerData } =
          await getData(partnerID);

        if (myData.spouse || partnerData.spouse) {
          return message.reply("❌ L'un de vous est déjà marié.");
        }

        myData.spouse = partnerID;
        partnerData.spouse = uid;
        delete myData.marriageProposal;

        await saveData(uid, me, myData);
        await saveData(partnerID, partner, partnerData);

        return message.reply(
          "💍✨ FÉLICITATIONS ! ✨💍\n\n" +
          "Deux âmes viennent de s'unir !\n" +
          "Votre mariage est officiellement célébré. 🖤"
        );
      }

      // DIVORCE
      if (action === "divorce") {
        if (!myData.spouse) {
          return message.reply("💔 Tu n'es pas marié.");
        }

        const partnerID = myData.spouse;
        const { user: partner, data: partnerData } =
          await getData(partnerID);

        delete myData.spouse;

        if (partnerData.spouse === uid) {
          delete partnerData.spouse;
        }

        await saveData(uid, me, myData);
        await saveData(partnerID, partner, partnerData);

        return message.reply(
          "💔 Le divorce est prononcé...\n\n" +
          "Votre mariage appartient désormais au passé."
        );
      }

      // FAIRE UNE DEMANDE
      const targetID = Object.keys(mentions)[0];

      if (targetID) {
        if (targetID === uid) {
          return message.reply("😂 Tu ne peux pas te marier avec toi-même !");
        }

        const { user: target, data: targetData } =
          await getData(targetID);

        if (myData.spouse) {
          return message.reply("💍 Tu es déjà marié !");
        }

        if (targetData.spouse) {
          return message.reply("💔 Cette personne est déjà mariée.");
        }

        if (targetData.marriageProposal) {
          return message.reply("💌 Cette personne a déjà une demande en attente.");
        }

        targetData.marriageProposal = {
          from: uid,
          threadID: event.threadID
        };

        await saveData(targetID, target, targetData);

        return message.reply(
          "💍━━━━━━━━━━━━━━━━━━💍\n" +
          "       DEMANDE EN MARIAGE\n" +
          "💍━━━━━━━━━━━━━━━━━━💍\n\n" +
          "Une personne souhaite unir son destin au tien ! 🖤\n\n" +
          "Pour accepter, écris : mariage accepter\n" +
          "Pour refuser, ignore simplement la demande.\n\n" +
          "💐 L'amour est entre tes mains..."
        );
      }

      // AFFICHER LE STATUT
      if (myData.spouse) {
        return message.reply(
          "💍━━━━━━━━━━━━━━━━━━💍\n" +
          "       STATUT MATRIMONIAL\n" +
          "💍━━━━━━━━━━━━━━━━━━💍\n\n" +
          "❤️ Tu es officiellement marié(e) !\n" +
          "ID de ton partenaire : " + myData.spouse
        );
      }

      return message.reply(
        "💔 Tu es actuellement célibataire.\n\n" +
        "💍 Pour te marier : mariage @mention\n" +
        "💌 Pour accepter : mariage accepter\n" +
        "💔 Pour divorcer : mariage divorce"
      );

    } catch (error) {
      console.error("Erreur mariage :", error);
      return message.reply("❌ Une erreur est survenue.");
    }
  }
};

