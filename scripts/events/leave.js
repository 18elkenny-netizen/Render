
const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "1.7",
    author: "Dark",
    category: "events"
  },

  langs: {
    fr: {
      session1: "🌅 𝗠𝗔𝗧𝗜𝗡",
      session2: "☀️ 𝗠𝗜𝗗𝗜",
      session3: "🌇 𝗔𝗣𝗥𝗘̀𝗦-𝗠𝗜𝗗𝗜",
      session4: "🌙 𝗦𝗢𝗜𝗥",

      leaveType1: "ᴀ ǫᴜɪᴛᴛᴇ́ ʟᴇ ɢʀᴏᴜᴘᴇ",
      leaveType2: "ᴀ ᴇ́ᴛᴇ́ ᴇxᴄʟᴜ ᴅᴜ ɢʀᴏᴜᴘᴇ",

      defaultLeaveMessage:
        "╔═══━━━─── 🥀 ───━━━═══╗\n" +
        "       𓆩 🖤 𝗗𝗘́𝗣𝗔𝗥𝗧 𝗗𝗨 𝗚𝗥𝗢𝗨𝗣𝗘 🖤 𓆪\n" +
        "╚═══━━━─── 🥀 ───━━━═══╝\n\n" +
        "   👤 𝗠𝗲𝗺𝗯𝗿𝗲 : {userName}\n" +
        "   🥀 𝗦𝘁𝗮𝘁𝘂𝘁 : {type}\n" +
        "   🏰 𝗚𝗿𝗼𝘂𝗽𝗲 : {threadName}\n" +
        "   ⏰ 𝗛𝗲𝘂𝗿𝗲 : {time}\n" +
        "   🌙 𝗣𝗲́𝗿𝗶𝗼𝗱𝗲 : {session}\n\n" +
        "╭───────〔 🦇 〕───────╮\n" +
        "   𝗨𝗡𝗘 𝗣𝗥𝗘́𝗦𝗘𝗡𝗖𝗘 𝗗𝗘 𝗠𝗢𝗜𝗡𝗦...\n" +
        "╰─────────────────────╯"
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType == "log:unsubscribe")
      return async function () {
        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        if (!threadData.settings.sendLeaveMessage) return;

        const { leftParticipantFbId } = event.logMessageData;
        if (leftParticipantFbId == api.getCurrentUserID()) return;

        const hours = getTime("HH");
        const fullTime = getTime("DD/MM/YYYY HH:mm");

        const threadName = threadData.threadName;
        const userName = await usersData.getName(leftParticipantFbId);

        let { leaveMessage = getLang("defaultLeaveMessage") } =
          threadData.data;

        const type =
          event.author === leftParticipantFbId
            ? getLang("leaveType1")
            : getLang("leaveType2");

        leaveMessage = leaveMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName)
          .replace(/\{type\}/g, type)
          .replace(/\{threadName\}|\{boxName\}/g, threadName)
          .replace(/\{time\}/g, fullTime)
          .replace(
            /\{session\}/g,
            hours <= 10
              ? getLang("session1")
              : hours <= 12
              ? getLang("session2")
              : hours <= 18
              ? getLang("session3")
              : getLang("session4")
          );

        const form = {
          body: leaveMessage
        };

        if (leaveMessage.includes("{userNameTag}")) {
          form.mentions = [
            {
              id: leftParticipantFbId,
              tag: userName
            }
          ];
        }

        if (threadData.data.leaveAttachment) {
          const files = threadData.data.leaveAttachment;
          const attachments = files.map(file =>
            drive.getFile(file, "stream")
          );
          form.attachment = (await Promise.allSettled(attachments))
            .filter(({ status }) => status == "fulfilled")
            .map(({ value }) => value);
        }

        message.send(form);
      };
  }
};
