
const { createCanvas } = require("canvas");
const { Readable } = require("stream");

const GAMES = global.devinerGames || (global.devinerGames = new Map());
const SCORES = global.devinerScores || (global.devinerScores = new Map());

const CHARACTERS = [
	{
		name: "Gojo Satoru",
		aliases: ["gojo", "satoru gojo", "gojo satoru"],
		universe: "Jujutsu Kaisen",
		category: "Anime",
		hints: [
			"Il est considéré comme l'un des plus puissants de son univers.",
			"Il porte souvent un bandeau ou des lunettes.",
			"Sa technique est liée à l'infini."
		]
	},
	{
		name: "Toji Fushiguro",
		aliases: ["toji", "toji fushiguro", "fushiguro toji"],
		universe: "Jujutsu Kaisen",
		category: "Anime",
		hints: [
			"Il est connu pour ses capacités physiques extraordinaires.",
			"Il appartient à une famille célèbre.",
			"On le surnomme le Tueur d'exorcistes."
		]
	},
	{
		name: "Mikey",
		aliases: ["mikey", "manjiro sano", "sano manjiro"],
		universe: "Tokyo Revengers",
		category: "Anime",
		hints: [
			"Il est petit, mais extrêmement redoutable.",
			"Il dirige un célèbre gang.",
			"Son surnom est associé à la légende de Tokyo."
		]
	},
	{
		name: "Naruto Uzumaki",
		aliases: ["naruto", "naruto uzumaki"],
		universe: "Naruto",
		category: "Anime",
		hints: [
			"Il rêve de devenir le chef de son village.",
			"Il possède une grande réserve d'énergie.",
			"Il est lié au démon renard à neuf queues."
		]
	},
	{
		name: "Sasuke Uchiha",
		aliases: ["sasuke", "sasuke uchiha"],
		universe: "Naruto",
		category: "Anime",
		hints: [
			"Il est le rival d'un célèbre ninja blond.",
			"Son clan a été presque entièrement exterminé.",
			"Il possède le Sharingan."
		]
	},
	{
		name: "Luffy",
		aliases: ["luffy", "monkey d luffy", "monkey d. luffy"],
		universe: "One Piece",
		category: "Anime",
		hints: [
			"Il rêve de trouver un trésor légendaire.",
			"Il porte un chapeau très reconnaissable.",
			"Son corps possède des propriétés élastiques."
		]
	},
	{
		name: "Roronoa Zoro",
		aliases: ["zoro", "roronoa zoro"],
		universe: "One Piece",
		category: "Anime",
		hints: [
			"Il a tendance à se perdre.",
			"Il utilise un style de combat inhabituel.",
			"Il manie trois sabres."
		]
	},
	{
		name: "Levi Ackerman",
		aliases: ["levi", "levi ackerman", "caporal levi"],
		universe: "L'Attaque des Titans",
		category: "Anime",
		hints: [
			"Il est réputé pour sa discipline.",
			"Il est particulièrement exigeant sur la propreté.",
			"Il est considéré comme le soldat le plus fort de l'humanité."
		]
	},
	{
		name: "Eren Yeager",
		aliases: ["eren", "eren yeager", "eren jaeger"],
		universe: "L'Attaque des Titans",
		category: "Anime",
		hints: [
			"Il est animé par un désir de liberté.",
			"Son histoire est liée à des créatures gigantesques.",
			"Il peut se transformer en titan."
		]
	},
	{
		name: "Light Yagami",
		aliases: ["light", "light yagami", "kira"],
		universe: "Death Note",
		category: "Anime",
		hints: [
			"Il est un étudiant très intelligent.",
			"Il veut créer un monde selon sa propre vision de la justice.",
			"Il utilise un carnet qui peut tuer."
		]
	},
	{
		name: "L",
		aliases: ["l", "lawliet", "ryuzaki"],
		universe: "Death Note",
		category: "Anime",
		hints: [
			"Il est extrêmement intelligent.",
			"Il a des habitudes très particulières.",
			"Il cherche à démasquer Kira."
		]
	},
	{
		name: "Tanjiro Kamado",
		aliases: ["tanjiro", "tanjiro kamado"],
		universe: "Demon Slayer",
		category: "Anime",
		hints: [
			"Il est connu pour son odorat exceptionnel.",
			"Il cherche à sauver un membre de sa famille.",
			"Il utilise notamment la respiration de l'eau."
		]
	},
	{
		name: "Nezuko Kamado",
		aliases: ["nezuko", "nezuko kamado"],
		universe: "Demon Slayer",
		category: "Anime",
		hints: [
			"Elle accompagne souvent son frère.",
			"Elle porte un objet en bambou.",
			"Elle est devenue un démon."
		]
	},
	{
		name: "Sung Jin-Woo",
		aliases: ["jinwoo", "sung jinwoo", "sung jin-woo"],
		universe: "Solo Leveling",
		category: "Anime",
		hints: [
			"Il commence son aventure comme un chasseur très faible.",
			"Il reçoit un mystérieux système.",
			"Il peut commander une armée d'ombres."
		]
	},
	{
		name: "Kirito",
		aliases: ["kirito", "kazuto kirigaya"],
		universe: "Sword Art Online",
		category: "Anime",
		hints: [
			"Il est connu comme un joueur solitaire.",
			"Son aventure se déroule dans un monde virtuel.",
			"Son vrai prénom est Kazuto."
		]
	},
	{
		name: "Batman",
		aliases: ["batman", "bruce wayne"],
		universe: "DC Comics",
		category: "Super-héros",
		hints: [
			"Il agit principalement la nuit.",
			"Il n'a aucun super-pouvoir naturel.",
			"Il protège Gotham City."
		]
	},
	{
		name: "Superman",
		aliases: ["superman", "clark kent", "kal el"],
		universe: "DC Comics",
		category: "Super-héros",
		hints: [
			"Il vient d'une autre planète.",
			"Il possède une force extraordinaire.",
			"Il est associé à la planète Krypton."
		]
	},
	{
		name: "Joker",
		aliases: ["joker"],
		universe: "DC Comics",
		category: "Super-vilain",
		hints: [
			"Il est connu pour son rire inquiétant.",
			"Il est l'ennemi juré d'un héros de Gotham.",
			"Son apparence est souvent marquée par un maquillage de clown."
		]
	},
	{
		name: "Spider-Man",
		aliases: ["spiderman", "spider-man", "peter parker"],
		universe: "Marvel",
		category: "Super-héros",
		hints: [
			"Il possède une agilité exceptionnelle.",
			"Il se déplace souvent entre les immeubles.",
			"Il est connu pour ses pouvoirs d'araignée."
		]
	},
	{
		name: "Iron Man",
		aliases: ["iron man", "tony stark"],
		universe: "Marvel",
		category: "Super-héros",
		hints: [
			"Il est un inventeur milliardaire.",
			"Il porte une armure technologique.",
			"Son identité civile est Tony Stark."
		]
	},
	{
		name: "Deadpool",
		aliases: ["deadpool", "wade wilson"],
		universe: "Marvel",
		category: "Anti-héros",
		hints: [
			"Il parle énormément.",
			"Il possède un pouvoir de régénération.",
			"Il porte un costume rouge et noir."
		]
	},
	{
		name: "Harry Potter",
		aliases: ["harry potter"],
		universe: "Harry Potter",
		category: "Film",
		hints: [
			"Il a grandi chez des membres de sa famille qui le traitaient mal.",
			"Il étudie dans une école de magie.",
			"Il porte une cicatrice en forme d'éclair."
		]
	},
	{
		name: "Voldemort",
		aliases: ["voldemort", "tom jedusor", "tom riddle"],
		universe: "Harry Potter",
		category: "Film",
		hints: [
			"Il est obsédé par l'immortalité.",
			"Son nom inspire la peur.",
			"Il est le principal ennemi de Harry Potter."
		]
	},
	{
		name: "Jack Sparrow",
		aliases: ["jack sparrow", "capitaine jack sparrow"],
		universe: "Pirates des Caraïbes",
		category: "Film",
		hints: [
			"Il est connu pour ses plans imprévisibles.",
			"Il est souvent accompagné d'un équipage.",
			"Il est un célèbre capitaine pirate."
		]
	},
	{
		name: "Darth Vader",
		aliases: ["darth vader", "dark vador", "vador"],
		universe: "Star Wars",
		category: "Film",
		hints: [
			"Sa respiration est immédiatement reconnaissable.",
			"Il porte une armure noire.",
			"Il est le père de Luke Skywalker."
		]
	},
	{
		name: "Wednesday Addams",
		aliases: ["wednesday", "mercredi addams", "wednesday addams"],
		universe: "La Famille Addams",
		category: "Série",
		hints: [
			"Elle a un humour particulièrement sombre.",
			"Elle porte souvent des vêtements noirs.",
			"Son prénom français est Mercredi."
		]
	},
	{
		name: "Geralt de Riv",
		aliases: ["geralt", "geralt de riv", "geralt of rivia"],
		universe: "The Witcher",
		category: "Jeu vidéo",
		hints: [
			"Il chasse des créatures dangereuses.",
			"Il possède des cheveux blancs.",
			"On le surnomme le Loup Blanc."
		]
	},
	{
		name: "Kratos",
		aliases: ["kratos"],
		universe: "God of War",
		category: "Jeu vidéo",
		hints: [
			"Il possède une force colossale.",
			"Son histoire est liée à la mythologie.",
			"Il est le père d'Atreus."
		]
	},
	{
		name: "Lara Croft",
		aliases: ["lara croft", "lara"],
		universe: "Tomb Raider",
		category: "Jeu vidéo",
		hints: [
			"Elle explore des tombeaux anciens.",
			"Elle est une aventurière expérimentée.",
			"Elle est l'héroïne de Tomb Raider."
		]
	},
	{
		name: "Sonic",
		aliases: ["sonic", "sonic the hedgehog"],
		universe: "Sonic",
		category: "Jeu vidéo",
		hints: [
			"Il est extrêmement rapide.",
			"Il adore les anneaux.",
			"C'est un hérisson bleu."
		]
	},
	{
		name: "Mario",
		aliases: ["mario", "super mario"],
		universe: "Nintendo",
		category: "Jeu vidéo",
		hints: [
			"Il est plombier.",
			"Il porte une casquette rouge.",
			"Il part souvent sauver la princesse Peach."
		]
	},
	{
		name: "Pikachu",
		aliases: ["pikachu"],
		universe: "Pokémon",
		category: "Dessin animé",
		hints: [
			"Il est petit et jaune.",
			"Il possède des pouvoirs électriques.",
			"Il accompagne souvent Sacha."
		]
	},
	{
		name: "Shrek",
		aliases: ["shrek"],
		universe: "Shrek",
		category: "Dessin animé",
		hints: [
			"Il aime vivre loin des autres.",
			"Il est accompagné d'un âne bavard.",
			"C'est un ogre vert."
		]
	},
	{
		name: "Bob l'éponge",
		aliases: ["bob", "bob l eponge", "bob l'éponge", "spongebob"],
		universe: "Bob l'éponge",
		category: "Dessin animé",
		hints: [
			"Il travaille dans un restaurant.",
			"Il vit sous la mer.",
			"C'est une éponge jaune."
		]
	},
	{
		name: "Tom",
		aliases: ["tom", "tom le chat"],
		universe: "Tom et Jerry",
		category: "Dessin animé",
		hints: [
			"Il poursuit constamment un autre personnage.",
			"Ses plans échouent souvent.",
			"C'est un chat gris."
		]
	},
	{
		name: "Jerry",
		aliases: ["jerry", "jerry la souris"],
		universe: "Tom et Jerry",
		category: "Dessin animé",
		hints: [
			"Il est petit et très malin.",
			"Il échappe souvent à un chat.",
			"C'est une souris."
		]
	}
];

function normalize(text) {
	return String(text || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9 ]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function getScoreKey(threadID, userID) {
	return `${threadID}_${userID}`;
}

function getScore(threadID, userID) {
	return SCORES.get(getScoreKey(threadID, userID)) || 0;
}

function addScore(threadID, userID, points) {
	const key = getScoreKey(threadID, userID);
	SCORES.set(key, getScore(threadID, userID) + points);
}

function createMysteryCard(round) {
	const canvas = createCanvas(1200, 750);
	const ctx = canvas.getContext("2d");

	const gradient = ctx.createLinearGradient(0, 0, 1200, 750);
	gradient.addColorStop(0, "#08070d");
	gradient.addColorStop(0.5, "#171025");
	gradient.addColorStop(1, "#08070d");

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 1200, 750);

	ctx.strokeStyle = "#8b5cf6";
	ctx.lineWidth = 4;
	ctx.strokeRect(25, 25, 1150, 700);

	ctx.strokeStyle = "rgba(180, 130, 255, 0.25)";
	ctx.lineWidth = 2;
	ctx.strokeRect(42, 42, 1116, 666);

	ctx.textAlign = "center";
	ctx.fillStyle = "#c4a5ff";
	ctx.font = "bold 48px Arial";
	ctx.fillText("DARK SYSTEM", 600, 105);

	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 64px Arial";
	ctx.fillText("PERSONNAGE MYSTÈRE", 600, 190);

	ctx.fillStyle = "#a78bfa";
	ctx.font = "bold 28px Arial";
	ctx.fillText(`MANCHE N° ${round}`, 600, 245);

	ctx.save();
	ctx.shadowColor = "#a855f7";
	ctx.shadowBlur = 35;
	ctx.fillStyle = "#030207";

	ctx.beginPath();
	ctx.arc(600, 390, 105, 0, Math.PI * 2);
	ctx.fill();

	ctx.beginPath();
	ctx.ellipse(600, 620, 185, 170, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();

	ctx.fillStyle = "#d8b4fe";
	ctx.font = "bold 32px Arial";
	ctx.fillText("QUI SUIS-JE ?", 600, 690);

	return canvas.toBuffer("image/png");
}

function getRandomCharacter() {
	return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

function isCorrectAnswer(answer, character) {
	const cleanAnswer = normalize(answer);

	return character.aliases.some(
		alias => normalize(alias) === cleanAnswer
	);
}

function getRanking(threadID) {
	const entries = [];

	for (const [key, points] of SCORES.entries()) {
		const prefix = `${threadID}_`;

		if (!key.startsWith(prefix)) continue;

		entries.push({
			userID: key.slice(prefix.length),
			points
		});
	}

	return entries
		.sort((a, b) => b.points - a.points)
		.slice(0, 10);
}

function isBotAdmin(userID) {
	return (global.GoatBot.config.adminBot || []).some(
		id => String(id) === String(userID)
	);
}

module.exports = {
	config: {
		name: "deviner",
		version: "1.0.1",
		author: "OpenAI",
		countDown: 5,
		role: 0,
		shortDescription: "Jeu de devinettes de personnages",
		longDescription: "Devine des personnages de différents univers et gagne des points.",
		category: "Jeux",
		guide: {
			fr: "{pn} : lancer une partie\n{pn} indice : obtenir un indice\n{pn} points : voir ses points\n{pn} classement : voir le classement\n{pn} stop : arrêter la partie"
		}
	},

	onStart: async function ({ api, event, message, args, usersData }) {
		const threadID = event.threadID;
		const senderID = event.senderID;
		const option = normalize(args[0] || "");

		// CONSULTER SES POINTS
		if (option === "points") {
			const points = getScore(threadID, senderID);

			return message.reply(
				`🖤 𝗗𝗔𝗥𝗞 𝗦𝗬𝗦𝗧𝗘𝗠\n\nTu possèdes actuellement ${points} point(s) dans ce groupe.`
			);
		}

		// OBTENIR UN INDICE
		if (option === "indice") {
			const game = GAMES.get(threadID);

			if (!game) {
				return message.reply("Aucune partie n'est en cours.");
			}

			if (game.hintIndex >= game.character.hints.length) {
				return message.reply("🔍 Tous les indices ont déjà été révélés !");
			}

			const hint = game.character.hints[game.hintIndex];
			game.hintIndex++;

			return message.reply(
				`🔍 𝗜𝗡𝗗𝗜𝗖𝗘 ${game.hintIndex}/${game.character.hints.length}\n\n${hint}`
			);
		}

		// CLASSEMENT DU GROUPE
		if (option === "classement" || option === "rank") {
			const ranking = getRanking(threadID);

			if (!ranking.length) {
				return message.reply(
					"🏆 Aucun score enregistré dans ce groupe pour le moment."
				);
			}

			let text = "🏆 𝗖𝗟𝗔𝗦𝗦𝗘𝗠𝗘𝗡𝗧 𝗗𝗔𝗥𝗞 𝗦𝗬𝗦𝗧𝗘𝗠\n\n";

			for (let i = 0; i < ranking.length; i++) {
				const player = ranking[i];
				let name = player.userID;

				try {
					name = await usersData.getName(player.userID);
				} catch (err) {}

				const medal = ["🥇", "🥈", "🥉"][i] || "🏅";

				text += `${medal} ${name} : ${player.points} point(s)\n`;
			}

			return message.reply(text);
		}

		// ARRÊTER LA PARTIE
		if (option === "stop") {
			const info = await api.getThreadInfo(threadID);

			const isThreadAdmin = (info.adminIDs || []).some(
				admin => String(admin.id || admin) === String(senderID)
			);

			if (!isBotAdmin(senderID) && !isThreadAdmin) {
				return message.reply(
					"⛔ Seuls les administrateurs du groupe peuvent arrêter la partie."
				);
			}

			if (!GAMES.has(threadID)) {
				return message.reply("Aucune partie n'est actuellement en cours.");
			}

			GAMES.delete(threadID);

			return message.reply("🛑 La partie a été arrêtée.");
		}

		// LANCER UNE PARTIE
		if (GAMES.has(threadID)) {
			return message.reply(
				"🎮 Une partie est déjà en cours dans ce groupe. Trouvez le personnage mystère !"
			);
		}

		const character = getRandomCharacter();

		const game = {
			character,
			round: 1,
			hintIndex: 0,
			createdAt: Date.now(),
			answered: false
		};

		GAMES.set(threadID, game);

		const image = createMysteryCard(game.round);

		await message.send({
			body:
				"𖤐 𝗗𝗔𝗥𝗞 𝗦𝗬𝗦𝗧𝗘𝗠 𖤐\n\n" +
				"🕯️ Un personnage mystérieux apparaît...\n" +
				`🌌 Univers : ${character.universe}\n` +
				`🎭 Catégorie : ${character.category}\n\n` +
				"💡 Utilisez -deviner indice pour obtenir un indice.\n" +
				"⚔️ Le premier à trouver gagne 10 points.\n\n" +
				"✦ Écrivez votre réponse directement dans le groupe.",
			attachment: Readable.from(image)
		});
	},

	// DÉTECTER LES RÉPONSES DES JOUEURS
	onChat: async function ({ event, message, usersData }) {
		const threadID = event.threadID;
		const senderID = event.senderID;
		const answer = normalize(event.body || "");

		if (!answer || answer.startsWith("-")) return;

		const game = GAMES.get(threadID);

		if (!game || game.answered) return;

		if (!isCorrectAnswer(answer, game.character)) return;

		game.answered = true;
		GAMES.delete(threadID);

		addScore(threadID, senderID, 10);

		let winnerName = senderID;

		try {
			winnerName = await usersData.getName(senderID);
		} catch (err) {}

		const points = getScore(threadID, senderID);

		return message.reply(
			"🎉 𝗕𝗥𝗔𝗩𝗢 ! 𝗕𝗢𝗡𝗡𝗘 𝗥𝗘́𝗣𝗢𝗡𝗦𝗘 !\n\n" +
			`👑 Gagnant : ${winnerName}\n` +
			`🖤 Personnage : ${game.character.name}\n` +
			`🌌 Univers : ${game.character.universe}\n` +
			"💰 Récompense : +10 points\n" +
			`🏆 Total : ${points} points\n\n` +
			"𖤐 DARK SYSTEM 𖤐"
		);
	}
};
    
  
