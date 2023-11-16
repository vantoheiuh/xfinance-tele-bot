const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require("fs");

let groupId = -1001957652310; // channelId

let rankScore = require("./score.json");

const full5LinksList = require("./full5links.json");
let linksObject = require("./linksObject.json");
let done25Object = require("./done25Object.json");

const waitingList = [];

const reportList = require("./report.json");

let snapshotList = require("./snapshot.json");

let infoMembers = require("./members.json");

let currentLinks = [];
let nextLinks = [];
let message5link = "";
let markup5link;

let RANDOM_GHIM_LIST = [];

// console.log(rankScore);

// replace the value below with the Telegram token you receive from @BotFather
const token = "6400705715:AAGvNZBpcTOFkeplzWjZD3Ftkb7qEjgLkcg";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.

let currentTaskList = [];
let doneTaskList = [];
let isWork = false;
let whiteList = [];
let pushList = [];
let isReverse = false;
let clonedLinks = [];
let backupLinks = require("./backupLinks.json");
let firstRun = true;
let ids = require("./ids.json");
let idLink;

let done = require("./done.json");
done.forEach((item) => doneTaskList.push(item));

let currentId = uuidv4();

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const currentDate = new Date();
  // Get the current hour (0-23)
  const currentHour = currentDate.getHours();
  console.log(
    `${msg.from.id ?? ""} : ${msg.from.first_name ?? ""} ${
      msg.from.last_name ?? ""
    }: ${msg.text}`
  );
  console.log(msg);

  let crAccount = rankScore.find((item) => item.id == msg.from.id);

  if(!crAccount){
    rankScore.push({
      username: msg.from.username ?? uuidv4(),
      score: 1,
      id: msg.from.id,
    });
  }
  if (crAccount && crAccount.banned) {
    bot.sendMessage(
      chatId,
      `Bạn ${crAccount.firstName} ${
        crAccount.lastName ? crAccount.lastName : ""
      } đã bị khoá tài khoản vì sử dụng nhiều telegram chung 1 twitter!`,
      {
        disable_web_page_preview: true,
        reply_to_message_id: msg.message_id,
      }
    );
    return;
  }
  if (crAccount && !crAccount.firstName) {
    crAccount.firstName = msg.from.first_name;
    crAccount.lastName = msg.from.last_name;
  }
  if (crAccount && !crAccount.doneList) {
    crAccount.doneList = [];
  }
  if (crAccount && !crAccount.done5List) {
    crAccount.done5List = [];
  }
  if (crAccount && !crAccount.done25List) {
    crAccount.done25List = [];
  }
  if (crAccount && !crAccount.idsLink) {
    crAccount.idsLink = [];
  }
  if (crAccount && !crAccount.isShit) {
    crAccount.isShit = false;
  }
  if (crAccount && !crAccount.is2Follow) {
    crAccount.is2Follow = false;
  }

  // if(msg.text.toLowerCase().indexOf("done5") !== -1 || msg.text.toLowerCase().indexOf("/link") !== -1){
  //   return;
  // }

  if(msg.text.toLowerCase().indexOf("done25") !== -1 && !containsLink(msg.text) ){
    bot.sendMessage(
      chatId,
      `Sai cú pháp! Bạn ${crAccount.firstName} ${
        crAccount.lastName ? crAccount.lastName : ""
      } hãy reply done25 kèm link bài viết. Cú pháp: done25 + link`,
      {
        disable_web_page_preview: true,
        reply_to_message_id: msg.message_id,
      }
    );
    return;
  }

  // if (
  //   msg.text.toLowerCase().indexOf("done all") !== -1 ||
  //   msg.text.toLowerCase().indexOf("done5") !== -1
  // ) {
  //   const now = new Date();
  //   const hour = now.getHours();
  //   const minute = now.getMinutes();
  //   const second = now.getSeconds();

  //   if (
  //     (hour === 6 ||
  //       hour === 9 ||
  //       hour === 12 ||
  //       hour === 15 ||
  //       hour === 18 ||
  //       hour === 21) &&
  //     minute >= 58
  //   ) {
  //     // Thực hiện công việc và sleep 60 giây
  //     console.log("Sleep 60s");
  //     return;
  //   }
  // }

  //CHECK VAR DONE ALL

  // CHECK TWITTER
  if (
    msg.text.toLowerCase() === "/twitter" ||
    msg.text.split("@")[0].toLowerCase() === "/twitter"
  ) {
    if (crAccount.twitter) {
      bot.sendMessage(
        chatId,
        `Twitter của bạn là: ${crAccount.twitter.split("/status")[0]}`,
        { reply_to_message_id: msg.message_id }
      );
    } else {
      bot.sendMessage(
        chatId,
        `Không tìm thấy twitter, vui lòng gõ /settwitter <your_twitter_url> để hệ thống lưu vào phục vụ việc cộng điểm rank!
Ví dụ: /settwitter https://twitter.com/xfinancevn_news
        `,
        { disable_web_page_preview: true, reply_to_message_id: msg.message_id }
      );
    }
  }

  // UPDATE TWITTER
  if (
    msg.text.indexOf("/settwitter") !== -1 &&
    (msg.text.indexOf("https://twitter.com") !== -1 ||
      msg.text.indexOf("https://x.com") !== -1)
  ) {
    // let twitterNameList = rankScore
    //   .filter((item) => item.twitter)
    //   .map((item) => item.twitter?.split("/")[3].toLowerCase());
    // let currentTwitterName = msg.text
    //   .toLowerCase()
    //   .split(" ")[1]
    //   .split("/")[3]
    //   .toLowerCase();
    // if (crAccount.twitter) {
    if (false) {
      bot.sendMessage(
        chatId,
        `Cập nhật không thành công, bạn đã có twitter rồi, gõ /twitter để check!`,
        { reply_to_message_id: msg.message_id }
      );
    } else {
      crAccount.twitter = msg.text.toLowerCase().split(" ")[1];
      crAccount.isTwitterUpdated = true;
      crAccount.twitterIdStr = null;
      bot.sendMessage(
        chatId,
        `Cập nhật thành công, Twitter của bạn là: ${crAccount.twitter}`,
        { reply_to_message_id: msg.message_id }
      );
    }
    return;
  }

  //ADD, ADDTOP & REMOVE WHITELIST
  if (
    (msg.from.username == "xfinancevn" ||
      msg.from.id == 1087968824 ||
      msg.from.id == 1906477815 ||
      msg.from.id == 878380005 ||
      msg.from.id == 5873879220 ||
      msg.from.id == 1087968824 ||
      msg.from.id == 1212092150) &&
    msg.text.indexOf("/add") !== -1 &&
    msg.text.indexOf("/addtop") === -1
  ) {
    if (
      containsLink(msg.text.split(" ")[1]) &&
      whiteList.indexOf(msg.text.split(" ")[1].split("?")[0]) === -1
    )
      whiteList.push(msg.text.split(" ")[1].split("?")[0]);
    console.log("Add white list thanh cong: ", whiteList);
  }

  if (
    (msg.from.username == "xfinancevn" ||
      msg.from.id == 1087968824 ||
      msg.from.id == 5873879220 ||
      msg.from.id == 878380005 ||
      msg.from.id == 1906477815 ||
      msg.from.id == 1087968824 ||
      msg.from.id == 1212092150) &&
    msg.text.indexOf("/push") !== -1
  ) {
    if (
      containsLink(msg.text.split(" ")[1]) &&
      pushList.indexOf(msg.text.split(" ")[1].split("?")[0]) === -1
    )
      pushList.push(msg.text.split(" ")[1].split("?")[0]);
    console.log("Add push list thanh cong: ", pushList);
  }

  if (
    (msg.from.username == "xfinancevn" ||
      msg.from.id == 1087968824 ||
      msg.from.id == 5873879220 ||
      msg.from.id == 878380005 ||
      msg.from.id == 1906477815 ||
      msg.from.id == 1212092150) &&
    msg.text.toLowerCase() === "/clear"
  ) {
    whiteList.length = 0;
    pushList.length = 0;
    isReverse = false;
    console.log("Remove white list thanh cong: ", whiteList, pushList);
  }

  if (msg.text.toLowerCase() === "/addtop") {
    isReverse = true;
  }

  if (
    msg.text.indexOf("/removeX") !== -1 &&
    msg.from.id == 1906477815 &&
    msg.reply_to_message
  ) {
    let removeAccount = rankScore.find(
      (item) => item.id == msg.reply_to_message.from.id
    );
    removeAccount.twitter = null;
    removeAccount.twitterIdStr = null;
    removeAccount.isTwitterUpdated = false;
    removeAccount.banned =false;
    bot.sendMessage(
      chatId,
      `Đã reset twitter của bạn ${removeAccount.firstName} ${
        removeAccount.lastName ? removeAccount.lastName : ""
      }. Vui lòng cập nhật lại link X để tương tác trong group!`,
      {
        disable_web_page_preview: true,
        reply_to_message_id: msg.message_id,
      }
    );
  }

  if (
    crAccount &&
    crAccount.twitter &&
    containsLink(msg.text) &&
    crAccount.twitter.split("?")[0].split("/")[3].toLowerCase() !=
      extractUrls(msg.text)[0].split("?")[0].split("/")[3].toLowerCase() &&
    !(
      msg.from.username == "xfinancevn" ||
      msg.from.id == 1087968824 ||
      msg.from.id == 5873879220 ||
      msg.from.id == 878380005 ||
      msg.from.id == 1906477815 ||
      msg.from.id == 1212092150
    )
  ) {
    bot
      .sendMessage(
        chatId,
        `Link X định danh với tele của bạn ${crAccount.firstName} ${
          crAccount.lastName ? crAccount.lastName : ""
        } là ${
          crAccount.twitter.split("?")[0].split("/status")[0]
        }. Vui lòng gửi đúng link X để được lên ghim tương tác!`,
        {
          disable_web_page_preview: true,
          reply_to_message_id: msg.message_id,
        }
      )
      .then((sentMessage) => {
        setTimeout(() => {
          bot.deleteMessage(chatId, msg.message_id);
        }, 10000); // 15 phút
      });
    return;
  }

  // COLLECT LINKS
  if (
    isWork &&
    msg.reply_to_message &&
    msg.reply_to_message.text.indexOf(currentId) !== -1 &&
    extractUrls(msg.text).length > 0 &&
    extractUrls(msg.text)[0].indexOf("/status/") !== -1 &&
    currentTaskList.map((item) => item.id).indexOf(msg.from.id) === -1 &&
    currentTaskList
      .map((item) => item.twitterName)
      .indexOf(extractUrls(msg.text)[0].split("?")[0].split("/")[3]) === -1
  ) {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    if (
      containsLink(msg.text) &&
      msg.from.id != 777000 &&
      msg.from.username !== "xfinancevn"
    ) {
      // Nếu có liên kết, bạn có thể thực hiện một số hành động ở đây, ví dụ:
      // Gửi tin nhắn cảnh báo hoặc xóa tin nhắn.

      let listIds = rankScore.map((item) => item.id);
      // console.log(currentAccount);
      // console.log(listIds.indexOf(msg.from.id) === -1);
      // if (currentAccount) {
      //   currentAccount.twitter = msg.text.split(" ")[0].split("?")[0];
      // }
      if (
        !currentAccount ||
        listIds.indexOf(msg.from.id) === -1 ||
        currentAccount.score < 20 ||
        msg.forward_from
      ) {
        bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
        bot.sendMessage(
          chatId,
          msg.from.first_name +
            " không đủ điểm tối thiểu để gửi liên kết trong nhóm này, vui lòng tương tác các bài ghim trước khi gửi link.\nHướng dẫn: https://t.me/xfinancevietnam/593",
          { disable_web_page_preview: true }
        );
        return;
      }
    }
    if (isWork) {
      currentTaskList.push({
        username: msg.from.username,
        link: extractUrls(msg.text)[0].split("?")[0],
        id: msg.from.id,
        twitterName: extractUrls(msg.text)[0].split("?")[0].split("/")[3],
        random: msg.text.indexOf("/random") !== -1 ? true : false,
      });

      console.log(currentTaskList.length);

      if (msg.text.indexOf("/random") !== -1) {
        currentAccount.score -= 20;
      }
    }
  } else {
    // console.log(msg)
    if (
      containsLink(msg.text) &&
      msg.from.id != 777000 &&
      msg.from.username !== "xfinancevn"
    ) {
      // Nếu có liên kết, bạn có thể thực hiện một số hành động ở đây, ví dụ:
      // Gửi tin nhắn cảnh báo hoặc xóa tin nhắn.
      let currentAccount = rankScore.find((item) => item.id == msg.from.id);
      let listIds = rankScore.map((item) => item.id);
      // console.log(currentAccount);
      // console.log(listIds.indexOf(msg.from.id) === -1);
      // if (
      //   !currentAccount ||
      //   listIds.indexOf(msg.from.id) === -1 ||
      //   currentAccount.score < 20 ||
      //   msg.forward_from
      // ) {
      //   bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
      //   bot.sendMessage(
      //     chatId,
      //     msg.from.first_name +
      //       " không đủ điểm tối thiểu để gửi liên kết trong nhóm này, vui lòng tương tác các bài ghim trước khi gửi link.\nHướng dẫn: https://t.me/xfinancevietnam/593",
      //     { disable_web_page_preview: true }
      //   );
      // } else {
      //   currentAccount.score -= 20;
      // }
    }
  }

  // DONE 1 LINK
  // if (
  //   msg.text.toLowerCase().indexOf("done") !== -1 &&
  //   containsLink(msg.reply_to_message.text)
  // ) {
  //   let currentAccount = rankScore.find((item) => item.id == msg.from.id);
  //   if (currentAccount) {
  //     if (
  //       currentAccount.doneList.indexOf(msg.reply_to_message.message_id) ===
  //         -1 &&
  //       // msg.text.toLowerCase().indexOf("done all") === -1 &&
  //       msg.text.toLowerCase().indexOf("done2fl") === -1 &&
  //       msg.text.toLowerCase().indexOf("done2gr") === -1
  //     ) {
  //       currentAccount.score += 1;
  //       console.log(
  //         "User " +
  //           msg.from.id +
  //           " score updated. Current score: " +
  //           currentAccount.score
  //       );
  //       if (
  //         msg.reply_to_message.text.indexOf(
  //           `ae tương tác ủng hộ các bạn, xong hết nhớ reply "done all"`
  //         ) === -1
  //       )
  //         currentAccount.doneList.push(msg.reply_to_message.message_id);
  //       if (
  //         (currentHour <= 7 || currentHour >= 19) &&
  //         msg.reply_to_message.text.indexOf(`[BOOST]`) !== -1
  //       ) {
  //         currentAccount.score += 0.2;
  //       }
  //     }
  //   } else {
  //     let currentAccountUsername = rankScore.find(
  //       (item) => item.username == msg.from.username
  //     );
  //     if (currentAccountUsername) {
  //       if (
  //         msg.text.toLowerCase().indexOf("done all") === -1 &&
  //         msg.text.toLowerCase().indexOf("done5") === -1 &&
  //         msg.text.toLowerCase().indexOf("done2fl") === -1 &&
  //         msg.text.toLowerCase().indexOf("done1follow") === -1 &&
  //         msg.text.toLowerCase().indexOf("done2gr") === -1
  //       ) {
  //         currentAccountUsername.score = currentAccountUsername.score += 1;

  //         currentAccountUsername.id = msg.from.id;
  //         console.log(
  //           "User " +
  //             msg.from.id +
  //             " score updated. Current score: " +
  //             currentAccountUsername.score
  //         );
  //       }
  //     } else {
  //       rankScore.push({
  //         username: msg.from.username ?? uuidv4(),
  //         score: 1,
  //         id: msg.from.id,
  //       });
  //     }
  //   }
  // }

  // ADD SCORE RANK

  if (msg.text.toLowerCase() === "/start") {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    let currentAccountUsername = rankScore.find(
      (item) => item.username == msg.from.username
    );
    if (!currentAccount && !currentAccountUsername) {
      rankScore.push({
        username: msg.from.username ?? uuidv4(),
        score: 1,
        id: msg.from.id,
      });
    }
  }

  // DONE CAC LOAI
  if (
    msg.text.toLowerCase().indexOf("done2fl") !== -1 ||
    (msg.text.toLowerCase().indexOf("done25") !== -1 &&
      containsLink(msg.reply_to_message.text)) ||
    (msg.text.toLowerCase().indexOf("done2gr") !== -1 &&
      containsLink(msg.reply_to_message.text)) ||
    (msg.text.toLowerCase().indexOf("done1follow") !== -1 &&
      containsLink(msg.reply_to_message.text)) ||
    msg.text.toLowerCase().indexOf("done5") !== -1
  ) {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    if (
      false &&
      currentAccount &&
      msg.text.toLowerCase().indexOf("done all") !== -1 &&
      msg.reply_to_message.text.indexOf(
        `ae tương tác ủng hộ các bạn, xong hết nhớ reply "done all"`
      ) !== -1
    ) {
      if (
        currentAccount.doneList.indexOf(msg.reply_to_message.message_id) !== -1
      ) {
        bot.sendMessage(
          chatId,
          `Bạn ${currentAccount.firstName} ${
            currentAccount.lastName ? currentAccount.lastName : ""
          } đã done all bài này rồi, vui lòng tương tác bài khác!`,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
        return;
      }
      if (!currentAccount.twitter) {
        bot.sendMessage(
          chatId,
          `Không tìm thấy twitter của bạn ${currentAccount.firstName} ${
            currentAccount.lastName ? currentAccount.lastName : ""
          }, vui lòng gõ /settwitter <your_twitter_url> để hệ thống lưu vào phục vụ việc cộng điểm rank!
  Ví dụ: /settwitter https://twitter.com/xfinancevn_news
          `,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
      } else {
        let twitterUsername = currentAccount.twitter
          .split("?")[0]
          .split("/")[3];
        let URLs = extractUrls(msg.reply_to_message.text)
          // .slice(0, 12)
          .filter((item) => item.indexOf("status") !== -1);
        console.log("URL IS: ", URLs);

        let userURLs = extractUrls(
          msg.reply_to_message.text.split(
            "Slot link của ban admin X FINANCE( có thể không tương tác). Mỗi link 10 point"
          )[0]
        ).filter((item) => item.indexOf("status") !== -1);

        console.log("userURLs", userURLs);

        let adminURLs =
          msg.reply_to_message.text.split(
            "Slot link của ban admin X FINANCE( có thể không tương tác). Mỗi link 10 point"
          ).length > 1
            ? extractUrls(
                msg.reply_to_message.text.split(
                  "Slot link của ban admin X FINANCE( có thể không tương tác). Mỗi link 10 point"
                )[1]
              ).filter((item) => item.indexOf("status") !== -1)
            : [];
        console.log("adminURLs", adminURLs);

        if (!currentAccount.twitterIdStr) {
          const id = checkId(twitterUsername);
          currentAccount.twitterIdStr = id;
          console.log("Cập nhật id thành công!");
        }

        const checkVarResult = checkVar(
          URLs,
          twitterUsername,
          currentAccount.twitterIdStr
        );
        if (!checkVarResult) {
          bot.sendMessage(
            chatId,
            `Kết quả check var của bạn ${msg.from.first_name} ${
              msg.from.last_name ? msg.from.last_name : ""
            } là: KHÔNG KIỂM TRA ĐƯỢC, VUI LÒNG TẮT CHẾ ĐỘ CHỈ TÍCH XANH COMMENTS`,
            {
              disable_web_page_preview: true,
              reply_to_message_id: msg.message_id,
            }
          );
          return;
        }
        const varCount = checkVarResult.count;
        const missingPosts = checkVarResult.missingPosts;

        let userMissingPosts = missingPosts.filter(
          (item) => userURLs.indexOf(item) !== -1
        );
        let adminMissingPosts = missingPosts.filter(
          (item) => adminURLs.indexOf(item) !== -1
        );

        let usersDonePostsCount = userURLs.length - userMissingPosts.length;
        let adminsDonePostsCount = adminURLs.length - adminMissingPosts.length;

        console.log(userMissingPosts, adminMissingPosts);
        console.log(usersDonePostsCount, adminsDonePostsCount);

        const messageMissingPost =
          userMissingPosts.length > 0
            ? "\nLinks chưa tương tác: \n" +
              userMissingPosts
                .map((item, index) => index + 1 + ". " + item)
                .join("\n")
            : "";

        let usersPointClaim =
          userURLs.length <= 12
            ? (60 * usersDonePostsCount) / userURLs.length
            : usersDonePostsCount * 5;
        let adminsPointClaim = adminsDonePostsCount * 10;
        let pointClaim = usersPointClaim + adminsPointClaim;

        console.log("Total point: ", pointClaim);
        currentAccount.score += pointClaim;

        bot.sendMessage(
          chatId,
          `Kết quả check var của bạn ${msg.from.first_name} ${
            msg.from.last_name ? msg.from.last_name : ""
          } là: ${usersDonePostsCount}/${
            userURLs.length
          }, bạn được cộng ${parseInt(
            usersPointClaim
          )} điểm. ${adminsDonePostsCount}/${
            adminURLs.length
          } link của admin (không bắt buộc) ${adminsPointClaim} điểm.\nTổng ${usersPointClaim}+${adminsPointClaim} = ${pointClaim} điểm.\nCheck rank hiện tại: /rank.\nNgoài ra, bạn có thể click vào đây /link để làm nhiệm vụ 5 link cải thiện rank.${messageMissingPost}`,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
        console.log(
          "User " +
            msg.from.id +
            " score updated. Current score: " +
            currentAccount.score
        );

        currentAccount.doneList.push(msg.reply_to_message.message_id);
      }

      // if ((currentHour <= 7 || currentHour >= 19) && msg.reply_to_message.text.indexOf(`[BOOST]`) !== -1) {
      //   currentAccount.score += 1;
      // }
    } else if (
      msg.text.toLowerCase().indexOf("done2fl") !== -1 &&
      !currentAccount.is2Follow
    ) {
      if (currentAccount.isFollow) {
        currentAccount.score += 15;
        currentAccount.is2Follow = true;
        currentAccount.isFollow = true;
        console.log(
          "User " +
            msg.from.id +
            "score updated. Current score: " +
            currentAccount.score
        );
      } else {
        currentAccount.score += 30;
        currentAccount.is2Follow = true;
        currentAccount.isFollow = true;
        console.log(
          "User " +
            msg.from.id +
            "score updated. Current score: " +
            currentAccount.score
        );
      }
    } else if (
      msg.text.toLowerCase().indexOf("done2gr") !== -1 &&
      !currentAccount.isJoin
    ) {
      currentAccount.score += 30;
      currentAccount.isJoin = true;
      console.log(
        "User " +
          msg.from.id +
          "score updated. Current score: " +
          currentAccount.score
      );
    } else if (msg.text.toLowerCase().indexOf("done5") !== -1) {
      if (currentAccount.done5List.indexOf(linksObject.id) !== -1) {
        bot.sendMessage(
          chatId,
          `Bạn ${currentAccount.firstName} ${
            currentAccount.lastName ? currentAccount.lastName : ""
          } đã done5 bài này rồi, vui lòng chờ 5 link mới để tương tác!
          `,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
        return;
      }
      let currentId = linksObject.id;
      if (!currentAccount.twitter) {
        bot.sendMessage(
          chatId,
          `Không tìm thấy twitter của bạn ${currentAccount.firstName} ${
            currentAccount.lastName ? currentAccount.lastName : ""
          }, vui lòng gõ /settwitter <your_twitter_url> để hệ thống lưu vào phục vụ việc cộng điểm rank!
  Ví dụ: /settwitter https://twitter.com/xfinancevn_news
          `,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
      } else {
        let twitterUsername = currentAccount.twitter
          .split("?")[0]
          .split("/")[3];
        let URLs = extractUrls(linksObject.currentList.join(" "));
        console.log("URL IS: ", URLs);

        if (!currentAccount.twitterIdStr) {
          const id = checkId(twitterUsername);
          currentAccount.twitterIdStr = id;
          console.log("Cập nhật id thành công!");
        }

        const checkVarResult = checkVar(
          URLs,
          twitterUsername,
          currentAccount.twitterIdStr
        );
        if (!checkVarResult) {
          bot.sendMessage(
            chatId,
            `Kết quả check var của bạn ${msg.from.first_name} ${
              msg.from.last_name ? msg.from.last_name : ""
            } là: KHÔNG KIỂM TRA ĐƯỢC, VUI LÒNG TẮT CHẾ ĐỘ CHỈ TÍCH XANH COMMENTS`,
            {
              disable_web_page_preview: true,
              reply_to_message_id: msg.message_id,
            }
          );
          return;
        }
        const varCount = checkVarResult.count;
        const missingPosts = checkVarResult.missingPosts;
        let sortedRankScore = rankScore.sort((a, b) => b.score - a.score);

        const messageMissingPost =
          missingPosts.length > 0
            ? "\nLinks chưa tương tác: \n" +
              missingPosts
                .map((item, index) => index + 1 + ". " + item)
                .join("\n")
            : "";

        console.log(varCount);

        const pointClaim = (20 * varCount) / URLs.length;
        console.log("point: ", pointClaim);
        currentAccount.score += pointClaim;
        //${accountIndex.firstName} ${accountIndex.lastName ? accountIndex.lastName : ""}
        //(60 *varCount)/URLs.length
        let currentAccountIndex = sortedRankScore.findIndex(
          (item) => item.id == msg.from.id
        );

        bot.sendMessage(
          chatId,
          `Kết quả check var của bạn ${msg.from.first_name} ${
            msg.from.last_name ? msg.from.last_name : ""
          } là: ${varCount}/${URLs.length}, bạn được cộng ${parseInt(
            pointClaim
          )} điểm. Check rank hiện tại: /rank. ${messageMissingPost}`,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
        console.log(
          "User " +
            msg.from.id +
            " score updated. Current score: " +
            currentAccount.score
        );

        currentAccount.done5List.push(currentId);
        if (varCount >= 4) {
          if (linksObject.waitingList.indexOf(currentAccount.id) === -1) {
            linksObject.waitingList.push(currentAccount.id);
          }
          bot.sendMessage(
            chatId,
            `BONUS: Bạn ${msg.from.first_name} ${
              msg.from.last_name ? msg.from.last_name : ""
            } đủ điều kiện tham gia hàng chờ random 5 link được ghim tiếp theo!\nHIỆN TẠI ĐANG CÓ ${
              linksObject.waitingList.length
            } BẠN TRONG HÀNG CHỜ!`,
            {
              disable_web_page_preview: true,
              reply_to_message_id: msg.message_id,
            }
          );
          if (linksObject.waitingList.length >= 10) {
            let newId = uuidv4();
            let newLinks = [];
            let pickedList = getRandomElementsFromArray(
              linksObject.waitingList,
              5
            );
            pickedList.forEach((userId) => {
              let currentAccount = rankScore.find((item) => item.id == userId);
              let url = getUrlById(
                currentAccount.twitter
                  .split("?")[0]
                  .split("/")[3]
                  .toLowerCase(),
                currentAccount.twitterIdStr
              );
              if (url) {
                console.log(url);
                newLinks.push(url);
              }
            });
            linksObject = null;
            linksObject = {
              id: newId,
              currentList: newLinks,
              waitingList: [],
            };
            bot
              .sendMessage(
                chatId,
                `LIST 5 LINK VỪA ĐƯỢC CẬP NHẬT
ANH EM CÓ THỂ CLICK VÀO ĐÂY /link ĐỂ TƯƠNG TÁC NHẬN 20 POINT ĐỒNG THỜI ĐƯỢC VÀO HÀNG CHỜ NGẪU NHIÊN CHỌN 5/10 BẠN GHIM 5 LINK TIẾP THEO
NGOÀI RA, TRONG MỖI BÀI GOM LINK 15 PHÚT THEO KHUNG GIỜ BẠN SẼ ĐƯỢC SỬ DỤNG LỆNH /RANDOM + <LINK POST> KHÔNG MẤT ĐIỂM KHI ĐÃ DONE5 TRƯỚC ĐÓ`,
                {
                  disable_web_page_preview: true,
                }
              )
              .then((message) => {
                // Use the message object to get the message ID and other details
                console.log("Message sent:", message);

                // Use the 'message_id' from the response to pin the message
                // bot.pinChatMessage(chatId, message.message_id);
              })
              .catch((error) => {
                console.error("Error sending message:", error);
              });
          }
        }
      }
    } else if ((msg.text.toLowerCase().indexOf("done25") !== -1 || msg.text.toLowerCase().indexOf("done 25") !== -1) && msg.text.indexOf("/status") !== -1 && containsLink(msg.text)) {
      if (!currentAccount.twitter) {
        bot.sendMessage(
          chatId,
          `Không tìm thấy twitter của bạn ${currentAccount.firstName} ${
            currentAccount.lastName ? currentAccount.lastName : ""
          }, vui lòng gõ /settwitter <your_twitter_url> để hệ thống lưu vào phục vụ việc cộng điểm rank!
  Ví dụ: /settwitter https://twitter.com/xfinancevn_news
          `,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
      }
      
      if (done25Object.waitingList.map(item => item.id).indexOf(currentAccount.id) !== -1) {
        
        bot.sendMessage(
          chatId,
          `Bạn ${currentAccount.firstName} ${
            currentAccount.lastName ? currentAccount.lastName : ""
          } đã có trong hàng chờ rồi, vui lòng chờ bài mới để tương tác!
          `,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
        return;
      }
      let currentId = msg.text.toLowerCase().split("MSG-ID: ")[1] ? msg.text.toLowerCase().split("MSG-ID: ")[1]:  done25Object.id;

      if(currentAccount.done25List.indexOf(currentId) !== -1){
        bot.sendMessage(
          chatId,
          `Bạn ${currentAccount.firstName} ${
            currentAccount.lastName ? currentAccount.lastName : ""
          } đã done25 bài này rồi, vui lòng chờ link mới để tương tác!
          `,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
        return;
      }


      if (false) {
        bot.sendMessage(
          chatId,
          `Không tìm thấy twitter của bạn ${currentAccount.firstName} ${
            currentAccount.lastName ? currentAccount.lastName : ""
          }, vui lòng gõ /settwitter <your_twitter_url> để hệ thống lưu vào phục vụ việc cộng điểm rank!
  Ví dụ: /settwitter https://twitter.com/xfinancevn_news
          `,
          {
            disable_web_page_preview: true,
            reply_to_message_id: msg.message_id,
          }
        );
      } else {
        let twitterUsername = currentAccount.twitter
          .split("?")[0]
          .split("/")[3];
        let URLs = extractUrls(msg.reply_to_message.text)
          // .slice(0, 12)
          .filter((item) => item.indexOf("status") !== -1);
        console.log("URL IS: ", URLs);

        if (!currentAccount.twitterIdStr) {
          const id = checkId(twitterUsername);
          currentAccount.twitterIdStr = id;
          console.log("Cập nhật id thành công!");
        }

        const checkVarResult = checkVar(
          URLs,
          twitterUsername,
          currentAccount.twitterIdStr
        );

        if (!checkVarResult) {
          bot.sendMessage(
            chatId,
            `Kết quả check var của bạn ${msg.from.first_name} ${
              msg.from.last_name ? msg.from.last_name : ""
            } là: KHÔNG KIỂM TRA ĐƯỢC, VUI LÒNG TẮT CHẾ ĐỘ CHỈ TÍCH XANH COMMENTS`,
            {
              disable_web_page_preview: true,
              reply_to_message_id: msg.message_id,
            }
          );
          return;
        }
        const varCount = checkVarResult.count;
        const missingPosts = checkVarResult.missingPosts;
        // let sortedRankScore = rankScore.sort((a, b) => b.score - a.score);

        const messageMissingPost =
          missingPosts.length > 0
            ? "\nLinks chưa tương tác: \n" +
              missingPosts
                .map((item, index) => index + 1 + ". " + item)
                .join("\n")
            : "";

        console.log(varCount);

        // const pointClaim = (20 * varCount) / URLs.length;
        // console.log("point: ", pointClaim);
        // currentAccount.score += pointClaim;
        //${accountIndex.firstName} ${accountIndex.lastName ? accountIndex.lastName : ""}
        //(60 *varCount)/URLs.length
        // let currentAccountIndex = sortedRankScore.findIndex(
        //   (item) => item.id == msg.from.id
        // );
        if(varCount >= 20 || varCount/extractUrls(msg.reply_to_message.text).length >= 0.8){
          currentAccount.done25List.push(currentId);
          bot.sendMessage(
            chatId,
            `Kết quả check var của bạn ${msg.from.first_name} ${
              msg.from.last_name ? msg.from.last_name : ""
            } là: ${varCount}/${URLs.length}.\nBạn đủ điều kiện tham gia hàng chờ random 25/50 link tiếp theo. Hiện tại có ${done25Object.waitingList.length +1} / 50 bạn đang chờ!`,
            {
              disable_web_page_preview: true,
              reply_to_message_id: msg.message_id,
            }
          );
        }else{
          bot.sendMessage(
            chatId,
            `Kết quả check var của bạn ${msg.from.first_name} ${
              msg.from.last_name ? msg.from.last_name : ""
            } là: ${varCount}/${URLs.length}.\nBạn KHÔNG ĐỦ điều kiện tham gia hàng chờ random 25/50 link tiếp theo. Bạn được quyền done25 lại khi tương tác xong. Hiện tại có ${done25Object.waitingList.length} / 50 bạn đang chờ!`,
            {
              disable_web_page_preview: true,
              reply_to_message_id: msg.message_id,
            }
          );
        }
        
        console.log(
          "User " +
            msg.from.id +
            " score updated. Current score: " +
            currentAccount.score
        );


        if (varCount >= 20 || varCount/extractUrls(msg.reply_to_message.text).length >= 0.8) {
          if (
            done25Object.waitingList
              .map((item) => item.id)
              .indexOf(currentAccount.id) === -1
          ) {
            done25Object.waitingList.push({
              id: currentAccount.id,
              link: extractUrls(msg.text)[0],
            });
          }

          if (done25Object.waitingList.length >= 50 && Date.now() - done25Object.time >= 3600000) {
            let newId = uuidv4();
            let newLinks = [];
            let pickedList = getRandomElementsFromArray(
              done25Object.waitingList,
              25
            );
            let finalList = whiteList.concat(pickedList.map((item) => item.link)).slice(0,25);
            whiteList.length = 0;

            done25Object = null;
            done25Object = {
              id: newId,
              waitingList: [],
              time: Date.now()
            };

            let ghimLinkFinal =
              `THỜI GIAN CẬP NHẬT: ${currentHour}H ${new Date().toLocaleDateString()}.\n
ĐÂY LÀ 25 LINK MỚI NHẤT ĐỂ TƯƠNG TÁC, TƯƠNG TÁC XONG REPLY "DONE25 + LINK CẦN SEEDING", 50 BẠN DONE25 SỚM NHẤT SẼ ĐƯỢC CHỌN NGẪU NHIÊN ĐỂ LẤY 25 LINK TIẾP THEO\n` +
              finalList
                .map(
                  (item, index) => index + 1 + ". " + item.split("/photo")[0]
                )
                .join("\n")
                .concat(`\n\n
Cơ chế ghim link mới:

- reply "done25 + link" khi tương tác xong
- 50 bạn hoàn thành 25 link này  nhanh nhất sẽ được vào HÀNG CHỜ NGẪU NHIÊN
- 25 link này sẽ đổi NGAY LẬP TỨC khi đủ 50 bạn done25
-KHÔNG GIỚI HẠN SỐ LẦN LÊN GHIM CỦA MỖI NGƯỜI, MIỄN LÀ BẠN TRONG TOP 50 NGƯỜI NHANH NHẤT MỖI BÀI GHIM SẼ ĐƯỢC CHỌN

MSG-ID: ${newId}`)

            console.log("ghimLink: " + ghimLinkFinal);
            bot
              .sendMessage(-1001957652310, ghimLinkFinal, {
                disable_web_page_preview: true,
              })
              .then((res) => {
                console.log(res)
              })
              .catch((err) => {
                console.log(err);
                bot.sendMessage(-1001957652310, ghimLinkFinal, {
                  disable_web_page_preview: true,
                });
              });
          }
        }
      }
    }
  }

  // CHECK RANK
  if (msg.text.toLowerCase() === "/check") {
    let checkedAccount = rankScore.find(
      (item) => item.id == msg.reply_to_message.from.id
    );
    if (checkedAccount && checkedAccount.twitter) {
      bot.sendMessage(
        -1001851061739,
        `Twitter của bạn ${checkedAccount.firstName ?? ""} ${
          checkedAccount.lastName ?? ""
        } là: ${
          checkedAccount.twitter.split("/status")[0] ?? "Không tìm thấy"
        }`,
        { reply_to_message_id: msg.message_id }
      );
    } else {
      bot.sendMessage(-1001851061739, `Không tìm thấy twitter`, {
        reply_to_message_id: msg.message_id,
      });
    }
  }

  // /input Văn Bạch | 1998 | Coder | https://twitter.com/xfinancevn_news
  // if (msg.text.toLowerCase().indexOf("/input") !== -1) {
  //   let currentMember = msg.text.slice(7).trim().split("|")
  //   console.log(currentMember)
  //   let idsList = infoMembers.map(item => item.id);
  //   if (idsList.indexOf(msg.from.id) === -1) {
  //     infoMembers.push({
  //       name: currentMember[0].trim(),
  //       age: currentMember[1].trim(),
  //       info: currentMember[2].trim(),
  //       twitter: currentMember[3].trim(),
  //       id: msg.from.id,
  //       username: msg.from.username,
  //       firstName: msg.from.first_name,
  //       lastName: msg.from.last_name
  //     })
  //     console.log(infoMembers);
  //     fs.writeFileSync("./members.json", JSON.stringify(infoMembers));
  //   }
  // }

  // if (msg.text.toLowerCase() === "/check" &&){

  // }

  //check 5 link ver2
  if (
    msg.text.toLowerCase() === "/link" ||
    msg.text.toLowerCase().split("@")[0] === "/link"
  ) {
    // check 5 link moi nhat chua done theo id
    // if (crAccount.done5List.indexOf(linksObject.id) !== -1) {
    //   bot.sendMessage(
    //     -1001851061739,
    //     `Bạn đã done 5 link mới nhất rồi, vui lòng chờ 5 link mới reset!\nHiện tại đang có ${linksObject.waitingList.length} bạn trong hàng chờ!`,
    //     { reply_to_message_id: msg.message_id }
    //   );
    //   return;
    // }

    if (linksObject) {
      let currentLinks = linksObject.currentList;
      let idLink = linksObject.id;
      let linkMarkUp = currentLinks.map((item) => {
        return [
          { text: "@" + item.split(".com/")[1].split("/status")[0], url: item },
        ];
      });

      let finalLinkMarkup = {
        inline_keyboard: linkMarkUp,
      };

      // Tin nhắn với inline keyboard
      const messageOptions = {
        reply_markup: finalLinkMarkup,
        reply_to_message_id: msg.message_id,
      };

      message5link = `MSG id: ${idLink}
Done5 = 20 điểm
DONE ALL bài ghim = 60 điểm!
Dưới đây là ${currentLinks.length} link gần nhất được gửi trong nhóm chat để tương tác, sau khi tương tác xong hãy reply lại message này với từ khóa: done5 để bot cộng điểm.`;

      markup5link = JSON.parse(JSON.stringify(messageOptions));

      bot.sendMessage(
        -1001851061739,
        `MSG id: ${idLink}
ĐÂY LÀ 5 LINK MỚI NHẤT ĐỂ BẠN TƯƠNG TÁC:.
- reply "done5" khi tương tác xong + 20 điểm
- đảm bảo bạn đã hoàn thành bài ghim channel "done all" gần nhất
- 10 bạn hoàn thành 5 link này và bài ghim gần nhất sẽ được vào HÀNG CHỜ NGẪU NHIÊN
- 5 link này sẽ đổi khi đủ 10 bạn done5
Check rank hiện tại: /rank, check 5 link: /link
HIỆN TẠI ĐANG CÓ: ${linksObject.waitingList.length} BẠN TRONG HÀNG CHỜ`,
        messageOptions
      );
      // crAccount.done5List.push(idLink);
    }
  }

  //POINT ALERT
  if (
    msg.text.toLowerCase() === "/point" ||
    msg.text.toLowerCase().split("@")[0] === "/point"
  ) {
    bot.sendMessage(
      -1001851061739,
      `CƠ CHẾ TÍNH POINT CÀY RANK X FINANCE:
- Tương tác bài ghim link (done all): 60 điểm
- Tương tác lẻ 1 link trong group chat (done): 1 điểm
- Tương tác 5 link gần nhất từ lệnh /link (done5): 20 điểm
- done2gr và done2fl ( hiệu lực 1 lần mỗi account): 30 điểm - 1 lần duy nhất
- Mỗi lần post link trong group chat trừ 3 điểm
- Mỗi lần được chọn lên bài ghim channel "được" chia 3 điểm
Giờ vàng: từ 19h tối tới 7h sáng hàng ngày
    `,
      { reply_to_message_id: msg.message_id }
    );
  }

  // ADD POINT
  if (msg.text.toLowerCase() === "/add100point") {
    crAccount.score += 100;
    console.log(
      "User " + msg.from.id + "score updated. Current score: " + crAccount.score
    );
  }

  if (msg.text.indexOf("/addpoint") !== -1 && msg.from.id == 1906477815) {
    let addAccount = rankScore.find(
      (item) => item.id == msg.reply_to_message?.from?.id
    );

    if (addAccount) {
      addAccount.score += parseInt(msg.text.split(" ")[1]);
      bot.sendMessage(
        chatId,
        `Đã cộng ${parseInt(msg.text.split(" ")[1])} điểm cho bạn ${
          msg.reply_to_message.from.first_name ?? ""
        } ${msg.reply_to_message.from.last_name ?? ""}`
      );
    }
  }

  //CHECK RANK
  if (
    msg.text.toLowerCase() === "/rank" ||
    msg.text.toLowerCase().split("@")[0] === "/rank"
  ) {
    let sortedRankScore = rankScore.sort((a, b) => b.score - a.score);
    let currentAccountIndex = sortedRankScore.findIndex(
      (item) => item.id == msg.from.id
    );

    if (currentAccountIndex !== -1) {
      currentAccountIndex++;
      bot.sendMessage(
        -1001851061739,
        `Thứ hạng hiện tại của bạn ${msg.from.first_name ?? ""} ${
          msg.from.last_name ?? ""
        } là: ${currentAccountIndex}/${
          sortedRankScore.length
        }\nNgoài ra, bạn có thể click vào đây /link để làm nhiệm vụ 5 link cải thiện rank.`,
        { reply_to_message_id: msg.message_id }
      );
    } else {
      rankScore.push({
        username: msg.from.username ?? uuidv4(),
        score: 1,
        id: msg.from.id,
      });

      bot.sendMessage(
        -1001851061739,
        `Thứ hạng hiện tại của bạn ${msg.from.first_name ?? ""} ${
          msg.from.last_name ?? ""
        } là: ${sortedRankScore.length}/${sortedRankScore.length}`,
        { reply_to_message_id: msg.message_id }
      );
    }
  }

  //BOT COMMAND

  if (
    msg.text.toLowerCase() === "/bot" ||
    msg.text.toLowerCase().split("@")[0] === "/bot"
  ) {
    let message = `
DANH SÁCH CÂU LỆNH HỢP LỆ CỦA X FINANCE BOT:
- /rank: xem thứ hạng hiện tại
- /link: hiển thị 5 link gần nhất được gửi trong group chat
- /point: hiển thị chi tiết cơ chế tính điểm cày rank
- /check: kiểm tra twitter của member 
- /giveaway: kiểm tra thứ hạng rank khi snapshot
- /bot: kiểm tra các câu lệnh hợp lệ
  `;
    bot.sendMessage(-1001851061739, message, {
      reply_to_message_id: msg.message_id,
    });
  }

  if (msg.text.toLowerCase().indexOf("/top") !== -1) {
    let index = parseInt(msg.text.toLowerCase().split(" ")[1].trim());
    let accountIndex = snapshotList.sort((a, b) => b.score - a.score)[
      index - 1
    ];
    bot.sendMessage(
      -1001851061739,
      `Vị trí số ${index} thuộc về: ${accountIndex.firstName} ${
        accountIndex.lastName ? accountIndex.lastName : ""
      }, username: @${
        accountIndex.username.length < 36 ? accountIndex.username : ""
      }, twitter: ${
        accountIndex.twitter ? accountIndex.twitter.split("/status")[0] : ""
      }`,
      { reply_to_message_id: msg.message_id }
    );
  }

  // GIVEAWAY
  if (
    msg.text.toLowerCase() === "/giveaway" ||
    msg.text.toLowerCase().split("@")[0] === "/giveaway"
  ) {
    if (snapshotList.length == 0) {
      bot.sendMessage(
        -1001851061739,
        "Chưa đến giờ snapshot đâu cha, 12h00 hàng ngày mới snapshot =))))",
        { reply_to_message_id: msg.message_id }
      );
    } else {
      let sortedSnapshotList = snapshotList.sort((a, b) => b.score - a.score);
      let currentAccountIndex = sortedSnapshotList.findIndex(
        (item) => item.id == msg.from.id
      );

      if (currentAccountIndex !== -1 && currentAccountIndex < 99) {
        currentAccountIndex++;
        bot.sendMessage(
          -1001851061739,
          msg.from.first_name +
            " đạt thứ hạng: " +
            currentAccountIndex +
            " vào lúc snapshot, bạn đủ điều kiện tham gia daily giveaway của X FINANCE.",
          { reply_to_message_id: msg.message_id }
        );
      } else {
        currentAccountIndex++;
        bot.sendMessage(
          -1001851061739,
          msg.from.first_name +
            " đạt thứ hạng: " +
            currentAccountIndex +
            " vào lúc snapshot, bạn KHÔNG đủ điều kiện tham gia daily giveaway của X FINANCE.",
          { reply_to_message_id: msg.message_id }
        );
      }
    }
  }

  //REPORT
  // if (msg.text.toLowerCase().split(" ")[0] === "/report") {
  //   let reportUserId = msg.reply_to_message.from.id;
  //   let reportUserName = msg.reply_to_message.from.username;

  //   let reportAccount = reportList.find(
  //     (item) => item.reportUserId == reportUserId
  //   );
  //   if (reportAccount) {
  //     reportAccount.count += 1;
  //   } else {
  //     reportList.push({
  //       reportUserId,
  //       reportUserName,
  //       count: 1,
  //     });
  //   }
  // }

  //REPORT ALERT
  // let reportAccount = reportList.find(
  //   (item) => item.reportUserId == msg.from.id
  // );
  // let listIds = reportList.map((item) => item.reportUserId);
  // // console.log(listIds.indexOf(msg.from.id) === -1);
  // if (
  //   reportAccount.count >= 3 &&
  //   reportAccount.count <= 5 &&
  //   msg.from.id != 1906477815
  // ) {
  //   // console.log("report account" + reportAccount);
  //   bot.sendMessage(
  //     chatId,
  //     msg.from.first_name +
  //     " đã bị report " +
  //     reportAccount.count +
  //     " lần, vui lòng chứng minh mình không done mõm bằng cách liên hệ @xfinancesupport."
  //   );
  //   // bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
  // }

  // if (reportAccount.count > 5 && msg.from.id != 1906477815) {
  //   bot.sendMessage(
  //     chatId,
  //     msg.from.first_name +
  //     " đã bị report quá nhiều lần, vui lòng liên hệ @xfinancesupport để chứng minh mình có tương tác. Tin nhắn của bạn đã bị xoá!"
  //   );
  //   bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
  // }
});

function containsLink(text) {
  // Bạn có thể tùy chỉnh biểu thức chính quy (regex) để kiểm tra liên kết
  const linkRegex = /(http|t.me|https|www\.)/;
  return linkRegex.test(text);
}

const filterLink = (doneList, currentList) => {
  let result = [];
  let backupList = [];
  currentList.forEach((item) => {
    if (
      item.id &&
      doneList.indexOf(item.id) === -1 &&
      doneList.indexOf(item.link.split("/status")[0].split("com/")[1]) === -1 &&
      done.indexOf(item.id) === -1 // remove later
    ) {
      let currentAccount = rankScore.find((item1) => item.id == item1.id);
      result.push({
        id: item.id,
        link: item.link,
        score: currentAccount ? currentAccount.score : 0,
        random: item.random,
      });
    } else {
      let currentAccount = rankScore.find((item1) => item.id == item1.id);
      backupList.push({
        id: item.id,
        link: item.link,
        score: currentAccount ? currentAccount.score : 0,
        random: item.random,
      });
    }
  });
  console.log("result: " + result);

  let finalResult = result.sort((a, b) => b.score - a.score).slice(0, 15);
  RANDOM_GHIM_LIST = null;
  RANDOM_GHIM_LIST = getRandomElementsFromArray(
    result
      .sort((a, b) => b.score - a.score)
      .slice(15)
      .filter((item) => item.random),
    3
  );

  if (whiteList.length > 0) {
    let finalLink = result.map((item) => item.link);
    whiteList.forEach((item) => {
      if (finalLink.indexOf(item) === -1) {
        finalResult.unshift({
          id: uuidv4(),
          link: item,
          score: 999999,
        });
      }
    });
    whiteList.length = 0;
    finalResult = finalResult.slice(0, 15);
  }
  finalResult.forEach((item) => {
    doneList.push(item.id);
    if (item.score != 999999) {
      doneList.push(item.link.split("/status")[0].split("com/")[1]);
    }
  });
  RANDOM_GHIM_LIST.forEach((item) => {
    doneList.push(item.id);
    if (item.score != 999999) {
      doneList.push(item.link.split("/status")[0].split("com/")[1]);
    }
  });
  console.log(doneList);
  finalResult.forEach((item) => {
    let currentAccount = rankScore.find((item1) => item1.id == item.id);
    if (currentAccount) {
      currentAccount.score = currentAccount.score / 3;
    }
  });
  RANDOM_GHIM_LIST.forEach((item) => {
    let currentAccount = rankScore.find((item1) => item1.id == item.id);
    if (currentAccount) {
      currentAccount.score = currentAccount.score / 3;
    }
  });
  RANDOM_GHIM_LIST = RANDOM_GHIM_LIST.map((item) => item.link);
  console.log("RANDOM_GHIM_LIST ", RANDOM_GHIM_LIST);
  console.log("Final result: ", finalResult);
  return finalResult.map((item) => item.link);
};

async function myTask() {
  const currentTime = moment().format("DD/MM/YYYY HH:mm:ss");
  const currentDate = new Date();

  // Get the current hour (0-23)
  const currentHour = currentDate.getHours();
  currentId = uuidv4();
  isWork = true;
  console.log("Message Id: " + currentId);
  console.log("Thời gian hiện tại:", currentTime);
  //Gửi tin nhắn thông báo post link
  //-1001957652310 seeding channel
  //-1001917262259 test channel
  bot
    .sendMessage(
      -1001957652310,
      `KHUNG ${currentHour}H - ĐÂY LÀ BÀI GOM LINK TRONG 15 PHÚT.

LƯU Ý: TELE PC ĐANG LỖI, GỬI LINK BẰNG TELE TRÊN ĐIỆN THOẠI, KHÔNG GỬI LINK QUA PC, GỬI LINK QUA PC BOT KHÔNG GOM ĐƯỢC

- Cơ chế ghim link:
  1. Gom tất cả link của anh em lại thành 1 danh sách
  2. Loại ra tất cả link của anh em đã lên trong ngày được danh sách mới
  3. Từ danh sách mới lấy ra 12 link của anh em theo thứ tự rank cao -> thấp

BONUS: Có thể gửi link bằng cú pháp: /random + link để thêm cơ hội được ghim với phí 20 điểm hoặc free nếu đã done5 trước đó!

Msg id:  ${currentId} 
`
    )
    .then((sentMessage) => {
      const messageId = sentMessage.message_id;

      // Thiết lập hẹn giờ để xoá tin nhắn sau 30 phút (1800000 milliseconds)
      // setTimeout(() => {
      //   bot.deleteMessage(groupId, messageId);
      // }, 900000); // 15 phút
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });

  console.log("Chờ user gửi link trong 15p!");
  await sleep(60000 * 15);

  console.log("Current hour:", currentHour);
  let ghimLink;
  if (isReverse) {
    ghimLink = filterLink(doneTaskList, currentTaskList);
  } else {
    ghimLink = filterLink(doneTaskList, currentTaskList).reverse();
  }

  let pushListMessage = "";
  if (pushList.length > 0) {
    pushListMessage = `\n\n👉 Slot link của ban admin X FINANCE( có thể không tương tác). Mỗi link 10 point:
${pushList
  .map((item, index) => index + 1 + ". " + item.split("/photo")[0])
  .join("\n")}`;
  }

  let RANDOM_GHIM_LIST_MESSAGE = "";

  if (RANDOM_GHIM_LIST.length > 0) {
    RANDOM_GHIM_LIST_MESSAGE = `\n👉 Slot /random + link:
${RANDOM_GHIM_LIST.map(
  (item, index) => index + 1 + ". " + item.split("/photo")[0]
).join("\n")}`;
  }

  let ghimLinkFinal =
    `Khung giờ: ${currentHour}H ${new Date().toLocaleDateString()}.\n
Hiện tại Tele PC đang update, anh em làm task xong thì nhớ DONE ALL bằng điện thoại, còn tương tác bằng PC hay điện thoại cũng được\n` +
    ghimLink
      .map((item, index) => index + 1 + ". " + item.split("/photo")[0])
      .join("\n")
      .concat(RANDOM_GHIM_LIST_MESSAGE)
      .concat(pushListMessage)
      .concat(` \n\nHi ae, đây là các post của lượt này, ae tương tác ủng hộ các bạn, xong hết nhớ reply "done all" ( rất quan trọng), có thể kèm link xuống cho ae trả nhé.
Tối đa 60 điểm cho 1 bài ghim nhé anh em!

>>>>> Các kênh chính thức của #XFINANCE:
- X FINANCE: https://x.com/xfinancevn
- X FINANCE NEWS: https://twitter.com/HiddenGems_X
Anh em follow 2 tài khoản này và reply trong nhóm done2fl sẽ được 30 điểm.
Thank you all`);
  console.log("ghimLink: " + ghimLinkFinal);
  bot
    .sendMessage(-1001957652310, ghimLinkFinal, {
      disable_web_page_preview: true,
    })
    .then((res) => console.log(res))
    .catch((err) => {
      console.log(err);
      bot.sendMessage(-1001957652310, ghimLinkFinal, {
        disable_web_page_preview: true,
      });
    });

  isWork = false;
  isReverse = false;
  currentTaskList.length = 0;
  pushList.length = 0;

  if (currentHour >= 22) {
    doneTaskList.length = 0;
  }
  fs.writeFileSync("./done.json", JSON.stringify(doneTaskList));
  console.log(doneTaskList);
}

// const main = async () => {
//   await myTask();
// };

// main();

function extractUrls(text) {
  // Biểu thức chính quy để tìm kiếm các URL
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*/g;

  // Sử dụng biểu thức chính quy để tìm và trích xuất các URL từ đoạn văn bản
  const urls = text.match(urlRegex);

  return urls || [];
}

// Lên lịch cho các thời điểm cụ thể trong ngày

const writeScoreFunc = () => {
  let newRankScore = markDuplicatesAsBanned(rankScore);
  rankScore = JSON.parse(JSON.stringify(newRankScore));
  fs.writeFileSync("./score.json", JSON.stringify(rankScore));
  fs.writeFileSync("./linksObject.json", JSON.stringify(linksObject));
  fs.writeFileSync("./done25Object.json", JSON.stringify(done25Object));
};

const write5linkFunc = () => {
  fs.writeFileSync("./full5links.json", JSON.stringify(full5LinksList));
};

const writeSnapshotFunc = () => {
  snapshotList = JSON.parse(JSON.stringify(rankScore));
  fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotList));
};

const writeSnapshotClearFunc = () => {
  snapshotList.length = 0;
  fs.writeFileSync("./snapshot.json", JSON.stringify([]));
};

const writeReportFunc = () => {
  fs.writeFileSync("./report.json", JSON.stringify(reportList));
};

const ruleAlert = () => {
  let message = `
>>> Rule nhóm - Rule lên bài ghim:

+ Khung giờ ghim link: 7h 10h 13h 16h 19h 22h.
+ Đúng 15 phút sau khi lấy link bot sẽ lên bài 10 link ghim cho ae tương tác, tương tác xong nhớ reply lại "done"
+ Cơ chế ghim link HOÀN TOÀN TỰ ĐỘNG, ưu tiên rank từ cao xuống thấp
+ Điểm = tương tác trong nhóm + reply done tương tác những link khác và done all tương tác link channel
+ Mỗi người mỗi ngày được lên ghim tối đa 1 lần. 12 link x 6 lần ghim post 1 ngày là 72 người. Rank top 72 sẽ được gim trong ngày (tương đối vì rank biến động liên tục). Ưu tiên từ cao xuống thấp
+ Gửi link trong nhóm chat sẽ trừ điểm. Cần phải tương tác lại link khác để có điểm

- X FINANCE: https://x.com/xfinancevn
- X FINANCE NEWS: https://twitter.com/HiddenGems_X
Ngoài ra, ae follow 2 tài khoản này và reply trong nhóm done2fl sẽ được nâng điểm và ưu tiên post bài
`;
  bot.sendMessage(-1001851061739, message, { disable_web_page_preview: true });
};

const adAlert = () => {
  const currentDate = new Date();
  // Get the current hour (0-23)
  const currentHour = currentDate.getHours();
  const currentMin = currentDate.getMinutes();
  if(currentHour >= 23 || currentHour <= 6){
    return;
  }
  if (Date.now() - done25Object.time >= 10800000) {
    let newId = uuidv4();
    let newLinks = [];
    let pickedList = getRandomElementsFromArray(done25Object.waitingList, 25);
    let finalList = whiteList.concat(pickedList.map((item) => item.link)).slice(0,25);
    whiteList.length = 0;

    done25Object = null;
    done25Object = {
      id: newId,
      waitingList: [],
      time: Date.now(),
    };

    let ghimLinkFinal =
      `THỜI GIAN CẬP NHẬT: ${currentHour}H${currentMin}P ${new Date().toLocaleDateString()}.\n
ĐÂY LÀ 25 LINK MỚI NHẤT ĐỂ TƯƠNG TÁC, TƯƠNG TÁC XONG REPLY "DONE25 + LINK CẦN SEEDING", 50 BẠN DONE25 SỚM NHẤT SẼ ĐƯỢC CHỌN NGẪU NHIÊN ĐỂ LẤY 25 LINK TIẾP THEO\n` +
      finalList
        .map((item, index) => index + 1 + ". " + item.split("/photo")[0])
        .join("\n").concat(`\n\n
Cơ chế ghim link mới:
- Bài ghim sẽ giữ tối thiểu 1 tiếng để mọi người tương tác, max 3 tiếng bot sẽ xoay link mới
- Reply "done25 + link" khi tương tác xong
- 50 bạn hoàn thành 25 link này  nhanh nhất sẽ được vào HÀNG CHỜ NGẪU NHIÊN
- 25 link này sẽ đổi NGAY LẬP TỨC khi đủ 50 bạn done25

=> KHÔNG GIỚI HẠN SỐ LẦN LÊN GHIM CỦA MỖI NGƯỜI, MIỄN LÀ BẠN TRONG TOP 50 NGƯỜI NHANH NHẤT MỖI BÀI GHIM SẼ ĐƯỢC CHỌN

MSG-ID: ${newId}`);

    console.log("ghimLink: " + ghimLinkFinal);
    bot
      .sendMessage(-1001957652310, ghimLinkFinal, {
        disable_web_page_preview: true,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        bot.sendMessage(-1001957652310, ghimLinkFinal, {
          disable_web_page_preview: true,
        });
      });
  }
};

const pointUpdateAlert = () => {
  let message = `
THÔNG BÁO QUAN TRỌNG - ĐỌC KĨ TRƯỚC KHI TƯƠNG TÁC TRONG GROUP ĐỂ TRÁNH MẤT ĐIỂM OAN!

Bước 1: kiểm tra xem mình đã được lưu đúng acc X trên hệ thống chưa.
  Gõ lệnh: /twitter

Bước 2: (bỏ qua bước nay nếu bước 1 đã đúng) cập nhật lại twitter theo cú pháp dưới đây.
  Gõ lệnh: /settwitter link_twitter_của_bạn
  Sau khi cập nhật xong ae có thể bắt đầu seeding

Bước 3: Tìm các bài ghim gần nhất ở channel, tương tác bài ghim link (12 link) theo khung giờ.
  Khi tương tác xong hãy vào reply "done all" ở bài đó. Bot sẽ check var và cộng điểm cho bạn.

Bước 4: Nếu ae muốn kiếm thêm điểm 
  hãy vào group chat gõ lệnh:   /link
 -> 5 link gần nhất để tương tác sẽ hiện ra, khi tương tác xong hãy reply lại 5 link đó "done5" để bot check var và cộng điểm

LƯU Ý: hãy đảm bảo COMMENTS trên TWITTER của bạn ở trạng thái (ĐÃ GỬI) TRƯỚC khi reply DONE ALL hoặc DONE5 nhé!
Nếu REPLY trước khi COMMENTS được gửi thì xin CHÚC MỪNG BẠN ĐÃ MẤT ĐIỂM OAN!
`;
  bot
    .sendMessage(groupId, message)
    .then((sentMessage) => {
      const messageId = sentMessage.message_id;

      // Thiết lập hẹn giờ để xoá tin nhắn sau 30 phút (1800000 milliseconds)
      setTimeout(() => {
        bot.deleteMessage(groupId, messageId);
      }, 500000); // 30 phút
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};

const reportAlert = () => {
  let message = `
>>> Hướng dẫn report done mõm: 
- Khi ae thấy có người reply lại link là done nhưng thực tế người đó không tương tác, ae có thể reply lại message done đó theo cú pháp:
/report <nội dung report>
Ví dụ: /report mõm
Bot sẽ lưu lại và có hướng xử lí những ae bị report nhiều lần.
  `;
  bot.sendMessage(-1001851061739, message);
};

const checkId = (username) => {
  const userInfoRaw = require("child_process")
    .execSync(`twscrape user_by_login ${username}`)
    .toString();
  const userInfo = JSON.parse(userInfoRaw);
  return userInfo.id_str;
};

const checkBlue = (username) => {
  const userInfoRaw = require("child_process")
    .execSync(`twscrape user_by_login ${username}`)
    .toString();
  const userInfo = JSON.parse(userInfoRaw);
  return userInfo.blue;
};

const check5link = (idsLink, currentMessage) => {
  let idFromMessage = currentMessage.split("\n")[0].split(" ")[1].trim();
  console.log(idFromMessage);
  return idsLink.indexOf(idFromMessage) === -1;
};

function getRandomElementsFromArray(array, x) {
  const randomElements = [];

  // Check if x is greater than the length of the array
  if (x >= array.length) {
    return array;
  }

  // Use a loop to generate x random indices
  while (randomElements.length < x) {
    const randomIndex = Math.floor(Math.random() * array.length);

    // Check if the random index is not already in the randomElements array
    if (randomElements.indexOf(randomIndex) === -1) {
      randomElements.push(randomIndex);
    }
  }

  // Get the elements at the random indices
  const result = randomElements.map((index) => array[index]);
  return result;
}

function markDuplicatesAsBanned(objects) {
  // Tạo một đối tượng dùng để theo dõi các twitterIdStr đã xuất hiện
  const twitterIdStrMap = {};

  for (let i = 0; i < objects.length; i++) {
    const currentObject = objects[i];
    const { twitterIdStr } = currentObject;

    // Kiểm tra xem twitterIdStr đã xuất hiện trước đó hay chưa
    if (twitterIdStr && twitterIdStr in twitterIdStrMap) {
      // Nếu đã xuất hiện trước đó, đánh dấu cả hai object là banned: true
      currentObject.banned = true;
      twitterIdStrMap[twitterIdStr].banned = true;
    } else {
      // Nếu chưa xuất hiện, thêm twitterIdStr vào bản đồ và đặt giá trị là đối tượng hiện tại
      twitterIdStrMap[twitterIdStr] = currentObject;
    }
  }

  return objects;
}

const checkVar = (urls, username, twitterIdStr) => {
  try {
    console.log("Đang check var: " + username);
    const missingPosts = [];
    let path = `./users/${username}${urls.length}.txt`;
    const idURLs = urls.map((item) => item.split("status/")[1].split("?")[0]);

    // const result = require("child_process")
    //   .execSync(
    //     `twscrape user_tweets_and_replies ${twitterIdStr} --limit=${
    //       urls.length === 5 ? 1 : 1
    //     } > ${path}`
    //   )
    //   .toString();
    const result = require("child_process")
      .execSync(
        `python3 scrape.py ${twitterIdStr} ${username} ${path} ${
          urls.length === 5 ? 20 : 120
        }`
      )
      .toString();

    const dataRaw = fs.readFileSync(path, { encoding: "utf-8" });
    const finalData = dataRaw
      .split("\n")
      .filter((item) => item)
      .map((item) => JSON.parse(item).id_str);
    let count = 0;
    idURLs.forEach((id) => {
      if (finalData.indexOf(id) !== -1) {
        count += 1;
      } else {
        missingPosts.push(urls.find((item) => item.indexOf(id) !== -1));
      }
    });
    console.log(`Tổng tương tác của ${username}: ${count}/${idURLs.length}`);
    return { count, missingPosts };
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

const getUrlById = (username, twitterIdStr) => {
  try {
    console.log("Getting lastest post for: " + username);

    const missingPosts = [];

    let path = `./users1/${username}.txt`;
    const result = require("child_process")
      .execSync(`python3 scrape1.py ${twitterIdStr} ${username} ${path} 20`)
      .toString();

    const dataRaw = fs.readFileSync(path, { encoding: "utf-8" });
    const finalData = dataRaw
      .split("\n")
      .filter((item) => item)
      .map((item) => JSON.parse(item))
      .sort((a, b) => b.id - a.id)
      .filter(
        (item) =>
          !item.retweetedTweet &&
          item.rawContent.indexOf("RT @") === -1 &&
          item.url.toLowerCase().indexOf(username.toLowerCase()) !== -1
      )
      .map((item) => item.url);
    return finalData[0];
  } catch (error) {
    return null;
  }
};

const done5Alert = () => {
  if (message5link && markup5link)
    bot.sendMessage(-1001851061739, message5link, markup5link);
};

const commandAlert = () => {
  let message = `
DANH SÁCH CÂU LỆNH HỢP LỆ CỦA X FINANCE BOT:
- /rank: xem thứ hạng hiện tại
- /link: hiển thị 5 link gần nhất được gửi trong group chat
- /point: hiển thị chi tiết cơ chế tính điểm cày rank
- /check: kiểm tra twitter của member 
- /giveaway: kiểm tra thứ hạng rank khi snapshot
  `;
  bot.sendMessage(-1001851061739, message);
};
cron.schedule("*/1 * * * *", writeScoreFunc);
cron.schedule("*/1 * * * *", write5linkFunc);
cron.schedule("0 12 * * *", writeSnapshotFunc);
cron.schedule("0 23 * * *", writeSnapshotClearFunc);
cron.schedule("*/1 * * * *", adAlert);
// cron.schedule("50 6,9,12,15,18,21 * * *", pointUpdateAlert);
// cron.schedule("*/18 7-23 * * *", writeReportFunc);
// cron.schedule("*/10 7-23 * * *", done5Alert);
// cron.schedule("32 7-23 * * *", ruleAlert);
// cron.schedule("12 7-23 * * *", commandAlert);
// cron.schedule("42 7-23 * * *", reportAlert);

// cron.schedule("0 7,10,13,16,19,22 * * *", async () => {
//   console.log("Cron job started.");
//   await myTask();
//   console.log("Cron job finished.");
// });

async function checkAndSleep() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  if (
    (hour === 6 ||
      hour === 9 ||
      hour === 12 ||
      hour === 15 ||
      hour === 18 ||
      hour === 21) &&
    minute >= 58
  ) {
    // Thực hiện công việc và sleep 60 giây
    console.log("Sleep 60s");
    return;
  }
}

// Khởi động ứng dụng
console.log("Ứng dụng đã khởi động.");

// backup score

const backupFolder = "./backup";
const jsonFile = "./score.json";

// Tạo thư mục sao lưu nếu nó chưa tồn tại
if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder);
}

// Tạo một công việc cron để sao lưu tệp JSON mỗi 5 phút
cron.schedule("*/1 * * * *", () => {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const backupFileName = `${backupFolder}/backup_${timestamp}.json`;

  // Sao lưu tệp JSON
  fs.copyFile(jsonFile, backupFileName, (err) => {
    if (err) {
      console.error("Lỗi khi sao lưu tệp JSON:", err);
    } else {
      // console.log(`Đã sao lưu tệp JSON thành công vào ${backupFileName}`);
    }
  });

  // Giới hạn số lượng tệp sao lưu tối đa là 10
  fs.readdir(backupFolder, (err, files) => {
    if (err) {
      console.error("Lỗi khi đọc thư mục sao lưu:", err);
    } else {
      if (files.length > 60) {
        // Sắp xếp các tệp theo thời gian và xóa tệp cũ nhất
        files.sort();
        fs.unlink(`${backupFolder}/${files[0]}`, (err) => {
          if (err) {
            console.error("Lỗi khi xóa tệp sao lưu cũ:", err);
          } else {
            // console.log('Đã xóa tệp sao lưu cũ nhất.');
          }
        });
      }
    }
  });
});
