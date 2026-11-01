const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "5.0.0",
    author: "Dark",
    countDown: 3,
    role: 0,

    shortDescription: {
      fr: "Menu des commandes DARK SYSTEM"
    },

    longDescription: {
      fr: "Afficher toutes les commandes disponibles"
    },

    category: "menu",

    guide: {
      fr: "{pn} | {pn} nomCommande"
    },

    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const botName = global.GoatBot.config.nickNameBot || "DARK SYSTEM";

    // FILTRAGE DES COMMANDES SELON LES PERMISSIONS
    const visibleCommands = [...commands.entries()]
      .filter(([name, command]) => {
        const config = command.config || {};
        return (config.role ?? 0) <= role;
      });

    // TRADUCTION DES CATÉGORIES
    const categoryTranslations = {
      ADMIN: "ADMINISTRATION",
      ADMINISTRATION: "ADMINISTRATION",
      OWNER: "PROPRIÉTAIRE",

      ANIME: "UNIVERS ANIME",
      ANIMES: "UNIVERS ANIME",

      GAME: "JEUX",
      GAMES: "JEUX",
      FUN: "DIVERTISSEMENT",
      ENTERTAINMENT: "DIVERTISSEMENT",

      INFO: "INFORMATIONS",
      INFORMATION: "INFORMATIONS",
      GENERAL: "GÉNÉRAL",

      GROUP: "ESPACE GROUPE",
      GROUPE: "ESPACE GROUPE",
      CHAT: "ESPACE GROUPE",

      AI: "INTELLIGENCE ARTIFICIELLE",
      IA: "INTELLIGENCE ARTIFICIELLE",

      IMAGE: "MÉDIAS",
      MEDIA: "MÉDIAS",
      MEDIAS: "MÉDIAS",
      MUSIC: "MÉDIAS",

      MENU: "COMMANDES",
      TOOLS: "OUTILS",
      TOOL: "OUTILS",
      UTILITY: "OUTILS",
      UTILITIES: "OUTILS",

      ECONOMY: "ÉCONOMIE",
      WALLET: "ÉCONOMIE",

      DOWNLOAD: "TÉLÉCHARGEMENT",
      EDUCATION: "ÉDUCATION",
      SOCIAL: "SOCIAL",
      OTHER: "AUTRES"
    };

    // ICÔNES DES CATÉGORIES
    const categoryIcons = {
      ADMIN: "♛",
      ADMINISTRATION: "♛",
      OWNER: "♛",

      ANIME: "⛩️",
      ANIMES: "⛩️",

      GAME: "🎮",
      GAMES: "🎮",
      FUN: "🎮",
      ENTERTAINMENT: "🎮",

      INFO: "✧",
      INFORMATION: "✧",
      GENERAL: "✧",

      GROUP: "♟️",
      GROUPE: "♟️",
      CHAT: "♟️",

      AI: "☽",
      IA: "☽",

      IMAGE: "▧",
      MEDIA: "▧",
      MEDIAS: "▧",
      MUSIC: "▧",

      MENU: "⌘",
      TOOLS: "⚙️",
      TOOL: "⚙️",
      UTILITY: "⚙️",
      UTILITIES: "⚙️",

      ECONOMY: "◈",
      WALLET: "◈",

      DOWNLOAD: "⇩",
      EDUCATION: "📚",
      SOCIAL: "♡",
      OTHER: "✦"
    };

    // RÉCUPÉRATION DES TEXTES FRANÇAIS
    const getText = (value, fallback) => {
      if (typeof value === "string")
        return value;

      if (value && typeof value === "object")
        return value.fr || value.en || value.vi || fallback;

      return fallback;
    };

    // MENU PRINCIPAL
    if (args.length === 0) {
      const categories = {};

      for (const [name, command] of visibleCommands) {
        const category = (
          command.config?.category || "OTHER"
        ).toUpperCase();

        if (!categories[category])
          categories[category] = [];

        categories[category].push(name);
      }

      const categoryNames = Object.keys(categories).sort(
        (a, b) => {
          const nameA = categoryTranslations[a] || a;
          const nameB = categoryTranslations[b] || b;

          return nameA.localeCompare(nameB, "fr");
        }
      );

      let msg = "";

      // EN-TÊTE
      msg += "╭━━━『 🕷️ 𝗗𝗔𝗥𝗞 𝗦𝗬𝗦𝗧𝗘𝗠 』━━━╮\n";
      msg += `│ ◈ Préfixe : ${prefix}\n`;
      msg += `│ ◈ Commandes : ${visibleCommands.length}\n`;
      msg += `│ ◈ Catégories : ${categoryNames.length}\n`;
      msg += "╰━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

      // LISTE DES CATÉGORIES
      for (const category of categoryNames) {
        const names = categories[category].sort(
          (a, b) => a.localeCompare(b, "fr")
        );

        const icon = categoryIcons[category] || "✦";
        const title = categoryTranslations[category] || category;

        msg += `${icon} ${title} ${names.length}\n`;
        msg += `╰─ ${names.join(" • ")}\n`;
      }

      // PIED DU MENU
      msg += "✦ Pour découvrir une commande :\n";
      msg += `${prefix}help [nom de la commande]\n`;
      msg += "╰━━━『 𖤐 DARK NETWORK 𖤐 』━━━╯";

      return message.reply({ body: msg });
    }

    // RECHERCHE D'UNE COMMANDE
    const commandName = args[0].toLowerCase();
    const aliasName = aliases.get(commandName);

    const command =
      commands.get(commandName) ||
      (aliasName ? commands.get(aliasName) : null);

    if (!command) {
      return message.reply(
        "╭━━━〔 🕷️ ERREUR 〕━━━╮\n" +
        "│ ✖ Commande introuvable.\n" +
        "│ Vérifie le nom et réessaie.\n" +
        "╰━━━━━━━━━━━━━━━━━━━━╯"
      );
    }

    const config = command.config || {};

    // VÉRIFICATION DES PERMISSIONS
    if ((config.role ?? 0) > role) {
      return message.reply(
        "⛔ ACCÈS REFUSÉ\n\n" +
        "Tu n'as pas la permission d'utiliser cette commande."
      );
    }

    // DESCRIPTION ET GUIDE
    const description = getText(
      config.longDescription || config.shortDescription,
      "Aucune description disponible."
    );

    const guide = getText(
      config.guide,
      "Aucune utilisation disponible."
    );

    const usage = guide
      .replace(/{pn}/g, prefix + config.name)
      .replace(/{p}/g, prefix)
      .replace(/{n}/g, config.name);

    const aliasesList = config.aliases
      ? Array.isArray(config.aliases)
        ? config.aliases.join(" • ")
        : config.aliases
      : "Aucun";

    const category = (
      config.category || "OTHER"
    ).toUpperCase();

    const translatedCategory =
      categoryTranslations[category] || category;

    // INFORMATIONS DE LA COMMANDE
    const response =
      "╭━━━『 🕷️ 𝗗𝗔𝗥𝗞 𝗦𝗬𝗦𝗧𝗘𝗠 』━━━╮\n" +
      `│ ◈ Commande : ${config.name}\n` +
      `│ ◈ Alias : ${aliasesList}\n` +
      `│ ◈ Version : ${config.version || "1.0"}\n` +
      `│ ◈ Catégorie : ${translatedCategory}\n` +
      "├──────────────────────────\n" +
      `│ ✧ Description : ${description}\n` +
      `│ ✧ Auteur : ${config.author || "Inconnu"}\n` +
      `│ ✧ Permission : ${roleTextToString(config.role ?? 0)}\n` +
      `│ ✧ Temps d'attente : ${config.countDown || 1}s\n` +
      "├──────────────────────────\n" +
      "│ ⚙️ UTILISATION\n" +
      `│ ${usage}\n` +
      "╰━━━『 𖤐 DARK NETWORK 𖤐 』━━━╯";

    return message.reply({ body: response });
  }
};

// TRADUCTION DES PERMISSIONS
function roleTextToString(role) {
  switch (role) {
    case 0:
      return "Tout le monde";

    case 1:
      return "Administrateurs du groupe";

    case 2:
      return "Administrateurs du bot";

    default:
      return "Permission " + role;
  }
}

