
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "3.0.0",
    author: "Dark",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Afficher toutes les commandes"
    },
    longDescription: {
      en: "Afficher la liste complète et les informations des commandes"
    },
    category: "info",
    guide: {
      en: "{pn} | {pn} nomCommande"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const botName = global.GoatBot.config.nickNameBot || "DARK";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //         MENU PRINCIPAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (args.length === 0) {
      const categories = {};

      for (const [name, command] of commands) {
        const config = command.config || {};
        const commandRole = config.role ?? 0;

        // Afficher uniquement les commandes accessibles
        if (commandRole > role) continue;

        const category = config.category || "OTHER";

        if (!categories[category]) {
          categories[category] = [];
        }

        categories[category].push(name);
      }

      const categoryNames = Object.keys(categories).sort(
        (a, b) => a.localeCompare(b)
      );

      let msg = "";

      msg += "╔════════════════════════════════╗\n";
      msg += "       ♛  𝑫𝑨𝑹𝑲 𝑪𝑨𝑺𝑰𝑵𝑶  ♛\n";
      msg += "╚════════════════════════════════╝\n\n";
      msg += "       ✦ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗖𝗘𝗡𝗧𝗘𝗥 ✦\n";
      msg += "   🖤━━━━━━━━━━━━━━━━━━━━━━💜\n";
      msg += "   Bienvenue dans l'univers de " + botName + "\n";
      msg += "   Voici toutes les commandes disponibles.\n";

      const icons = {
        box: "🏰",
        "box chat": "🏰",
        economy: "💰",
        wallet: "💎",
        game: "🎮",
        games: "🎮",
        "fun & game": "🎲",
        fun: "🎭",
        social: "💞",
        admin: "👑",
        owner: "♛",
        info: "📜",
        information: "📜",
        utility: "🛠️",
        tools: "⚙️",
        image: "🎨",
        media: "🎬",
        anime: "🌸",
        chat: "💬",
        system: "🔮",
        music: "🎵",
        ai: "🤖",
        other: "✨"
      };

      for (const category of categoryNames) {
        const names = categories[category].sort((a, b) =>
          a.localeCompare(b)
        );

        const icon =
          icons[category.toLowerCase()] || "✦";

        msg += "\n\n";
        msg += `╭─────⭔『 ${icon} ${category.toUpperCase()} 』\n`;

        for (let i = 0; i < names.length; i += 2) {
          const first = names[i];
          const second = names[i + 1];

          let line = `│✧${first}`;

          if (second) {
            line += ` ✧${second}`;
          }

          msg += line + "\n";
        }

        msg += "╰────────────⭓";
      }

      const totalCommands = [...commands.entries()].filter(
        ([name, command]) => {
          const config = command.config || {};
          return (config.role ?? 0) <= role;
        }
      ).length;

      msg += "\n\n";
      msg += "╔════════════════════════════════╗\n";
      msg += "       👑 𝗗𝗔𝗥𝗞 𝗖𝗔𝗦𝗜𝗡𝗢 👑\n";
      msg += "╠════════════════════════════════╣\n";
      msg += `│ 💎 TOTAL COMMANDES : ${totalCommands}\n`;
      msg += `│ ⚜️ PRÉFIXE : ${prefix}\n`;
      msg += `│ 📖 AIDE : ${prefix}help nomCommande\n`;
      msg += `│ 🎮 EXEMPLE : ${prefix}help bal\n`;
      msg += "╠════════════════════════════════╣\n";
      msg += `│ 🖤 BOT : ${botName}\n`;
      msg += "│ ✨ POWERED BY DARK SYSTEM\n";
      msg += "╚════════════════════════════════╝";

      return message.reply({ body: msg });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //       INFORMATIONS COMMANDE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const commandName = args[0].toLowerCase();
    const aliasName = aliases.get(commandName);

    const command =
      commands.get(commandName) ||
      (aliasName ? commands.get(aliasName) : null);

    if (!command) {
      return message.reply(
        "╭─────⭔『 ❌ NOT FOUND 』\n" +
        "│ Cette commande n'existe pas.\n" +
        "│ Vérifie son nom et réessaie.\n" +
        "╰────────────⭓"
      );
    }

    const config = command.config || {};

    if ((config.role ?? 0) > role) {
      return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
    }

    const description =
      typeof config.longDescription === "string"
        ? config.longDescription
        : config.longDescription?.fr ||
          config.longDescription?.en ||
          "Aucune description";

    const guide =
      typeof config.guide === "string"
        ? config.guide
        : config.guide?.fr ||
          config.guide?.en ||
          "Aucune utilisation disponible";

    const usage = guide
      .replace(/{pn}/g, prefix + config.name)
      .replace(/{p}/g, prefix)
      .replace(/{n}/g, config.name);

    const aliasesText =
      config.aliases?.join(", ") || "Aucun";

    const response =
      "╔════════════════════════════════╗\n" +
      "       ♛  𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢  ♛\n" +
      "╚════════════════════════════════╝\n\n" +
      "╭─────⭔『 💎 IDENTITÉ 』\n" +
      `│ ✧ Nom : ${config.name}\n` +
      `│ ✧ Alias : ${aliasesText}\n` +
      `│ ✧ Version : ${config.version || "1.0"}\n` +
      "╰────────────⭓\n\n" +
      "╭─────⭔『 📜 INFORMATIONS 』\n" +
      `│ ✧ Description : ${description}\n` +
      `│ ✧ Auteur : ${config.author || "Inconnu"}\n` +
      `│ ✧ Permission : ${roleTextToString(config.role ?? 0)}\n` +
      `│ ✧ Cooldown : ${config.countDown || 1}s\n` +
      "╰────────────⭓\n\n" +
      "╭─────⭔『 ⚜️ UTILISATION 』\n" +
      `│ ${usage}\n` +
      "╰────────────⭓\n\n" +
      "       🖤 𝗗𝗔𝗥𝗞 𝗖𝗔𝗦𝗜𝗡𝗢 🖤";

    return message.reply(response);
  }
};

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
