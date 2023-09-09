const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require("fs");

const rankScore = require("./score.json");

const reportList = require("./report.json");

console.log(rankScore);

// replace the value below with the Telegram token you receive from @BotFather
const token = "6400705715:AAG2y9oUyfQeFVvUQIDx4yo0bvHKBEk_NIU";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.

let currentTaskList = [];
let doneTaskList = [];
let isWork = false;
let whiteList = [];

let done = require("./done.json");
done.forEach((item) => doneTaskList.push(item));

let currentId = uuidv4();

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  console.log(msg.from.id, msg.text);
  //   console.log(msg);
  if (
    (msg.from.username == "xfinancevn" || msg.from.id == 1087968824) &&
    msg.text.indexOf("/add") !== -1
  ) {
    whiteList.push(msg.text.split(" ")[1]);
    console.log("Add white list thanh cong: ", whiteList);
  }
  if (
    isWork &&
    msg.reply_to_message &&
    msg.reply_to_message.text.indexOf(currentId) !== -1 &&
    (msg.text.split(" ")[0].indexOf("x.com") !== -1 ||
      msg.text.split(" ")[0].indexOf("twitter.com") !== -1) &&
    currentTaskList.map((item) => item.id).indexOf(msg.from.id) === -1 &&
    currentTaskList
      .map((item) => item.twitterName)
      .indexOf(msg.text.split(" ")[0].split("/")[3]) === -1
  ) {
    console.log("go here");
    if (containsLink(msg.text)) {
      // Nếu có liên kết, bạn có thể thực hiện một số hành động ở đây, ví dụ:
      // Gửi tin nhắn cảnh báo hoặc xóa tin nhắn.
      let currentAccount = rankScore.find((item) => item.id == msg.from.id);
      let listIds = rankScore.map((item) => item.id);
      console.log(currentAccount);
      console.log(listIds.indexOf(msg.from.id) === -1);
      if (
        !currentAccount ||
        listIds.indexOf(msg.from.id) === -1 ||
        currentAccount.score < 5
      ) {
        bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
        bot.sendMessage(
          chatId,
          msg.from.first_name +
            " không đủ điểm tối thiểu để gửi liên kết trong nhóm này, vui lòng tương tác các bài ghim trước khi gửi link."
        );
      }
    }
    currentTaskList.push({
      username: msg.from.username,
      link: msg.text.split(" ")[0].split("?")[0],
      id: msg.from.id,
      twitterName: msg.text.split(" ")[0].split("/")[3],
    });
  } else {
    console.log("go hereeeeee: ", containsLink(msg.text));
    // console.log(msg)
    if (containsLink(msg.text)) {
      // Nếu có liên kết, bạn có thể thực hiện một số hành động ở đây, ví dụ:
      // Gửi tin nhắn cảnh báo hoặc xóa tin nhắn.
      let currentAccount = rankScore.find((item) => item.id == msg.from.id);
      let listIds = rankScore.map((item) => item.id);
      console.log(currentAccount);
      console.log(listIds.indexOf(msg.from.id) === -1);
      if (
        !currentAccount ||
        listIds.indexOf(msg.from.id) === -1 ||
        currentAccount.score < 5
      ) {
        bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
        bot.sendMessage(
          chatId,
          msg.from.first_name +
            " không đủ điểm tối thiểu để gửi liên kết trong nhóm này, vui lòng tương tác các bài ghim trước khi gửi link."
        );
      } else {
        console.log("aaaaa");
        currentAccount.score -= 3;
      }
    }
  }
  if (
    msg.text.toLowerCase().indexOf("done") !== -1 &&
    containsLink(msg.reply_to_message.text)
  ) {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    if (currentAccount) {
      currentAccount.score += 1;
      console.log(
        "User " +
          msg.from.id +
          "score updated. Current score: " +
          currentAccount.score
      );
    } else {
      let currentAccountUsername = rankScore.find(
        (item) => item.username == msg.from.username
      );
      if (currentAccountUsername) {
        currentAccountUsername.score = currentAccountUsername.score += 1;
        currentAccountUsername.id = msg.from.id;
        console.log(
          "User " +
            msg.from.id +
            "score updated. Current score: " +
            currentAccountUsername.score
        );
      } else {
        rankScore.push({
          username: msg.from.username ?? uuidv4(),
          score: 1,
          id: msg.from.id,
        });
      }
    }
  }
  if (
    msg.text.toLowerCase().indexOf("done2follow") !== -1 ||
    (msg.text.toLowerCase().indexOf("done all") !== -1 &&
      containsLink(msg.reply_to_message.text))
  ) {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    if (currentAccount) {
      currentAccount.score += 5;
      console.log(
        "User " +
          msg.from.id +
          "score updated. Current score: " +
          currentAccount.score
      );
    }
    if (msg.text.toLowerCase().indexOf("done2follow") !== -1) {
      currentAccount.score += 5;
      console.log(
        "User " +
          msg.from.id +
          "score updated. Current score: " +
          currentAccount.score
      );
    }
  }
  if (msg.text.toLowerCase() === "/rank") {
    let sortedRankScore = rankScore.sort((a, b) => b.score - a.score);
    let currentAccountIndex = sortedRankScore.findIndex(
      (item) => item.id == msg.from.id
    );

    if (currentAccountIndex !== -1) {
      currentAccountIndex++;
      bot.sendMessage(
        -1001851061739,
        "Thứ hạng hiện tại của bạn " +
          msg.from.first_name +
          " là: " +
          currentAccountIndex +
          "/" +
          sortedRankScore.length
      );
    } else {
      bot.sendMessage(
        -1001851061739,
        msg.from.first_name + " đã làm gì có rank mà check =)))) "
      );
    }
  }
  if (msg.text.toLowerCase().split(" ")[0] === "/report") {
    let reportUserId = msg.reply_to_message.from.id;
    let reportUserName = msg.reply_to_message.from.username;

    let reportAccount = reportList.find(
      (item) => item.reportUserId == reportUserId
    );
    if (reportAccount) {
      reportAccount.count += 1;
    } else {
      reportList.push({
        reportUserId,
        reportUserName,
        count: 1,
      });
    }
  }

  let reportAccount = reportList.find(
    (item) => item.reportUserId == msg.from.id
  );
  let listIds = reportList.map((item) => item.reportUserId);
  console.log(listIds.indexOf(msg.from.id) === -1);
  if (
    reportAccount.count >= 3 &&
    reportAccount.count <= 5 &&
    msg.from.id != 1906477815
  ) {
    console.log("report account" + reportAccount);
    bot.sendMessage(
      chatId,
      msg.from.first_name +
        " đã bị report " +
        reportAccount.count +
        " lần, vui lòng chứng minh mình không done mõm bằng cách liên hệ @xfinancesupport."
    );
    // bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
  }
  if (reportAccount.count > 5 && msg.from.id != 1906477815) {
    bot.sendMessage(
      chatId,
      msg.from.first_name +
        " đã bị report quá nhiều lần, vui lòng liên hệ @xfinancesupport để chứng minh mình có tương tác. Tin nhắn của bạn đã bị xoá!"
    );
    bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
  }
});

function containsLink(text) {
  // Bạn có thể tùy chỉnh biểu thức chính quy (regex) để kiểm tra liên kết
  const linkRegex = /(http|https|www\.)/;
  return linkRegex.test(text);
}

const filterLink = (doneList, currentList) => {
  let result = [];
  let backupList = [];
  currentList.forEach((item) => {
    if (
      item.id &&
      doneList.indexOf(item.id) === -1 &&
      done.indexOf(item.id) === -1 // remove later
    ) {
      let currentAccount = rankScore.find((item1) => item.id == item1.id);
      result.push({
        id: item.id,
        link: item.link,
        score: currentAccount ? currentAccount.score : 0,
      });
    } else {
      let currentAccount = rankScore.find((item1) => item.id == item1.id);
      backupList.push({
        id: item.id,
        link: item.link,
        score: currentAccount ? currentAccount.score : 0,
      });
    }
  });
  console.log("result: " + result);

  //   if (whiteList.length > 0) {
  //     let finalResult = result.sort((a, b) => b.score - a.score).slice(0, 10);
  //     whiteList.forEach((item) =>
  //       finalResult.unshift({
  //         id: uuidv4(),
  //         link: item,
  //         score: 999999,
  //       })
  //     );
  //     whiteList.length = 0;
  //   }

  // if (result.length < 10 && backupList.length > 0) {
  //   let sortedBackupList = backupList.sort((a, b) => b.score - a.score);
  //   for (let i = 0; sortedBackupList.length; i++) {
  //     result.push(sortedBackupList[i]);
  //   }
  //   let finalResult = result.slice(0, 10);
  //   if (whiteList.length > 0) {
  //     whiteList.forEach((item) =>
  //       finalResult.unshift({
  //         id: uuidv4(),
  //         link: item,
  //         score: 999999,
  //       })
  //     );
  //     whiteList.length = 0;
  //     finalResult = finalResult.slice(0, 10);
  //   }
  //   finalResult.forEach((item) => doneList.push(item.id));
  //   console.log(doneList);
  //   finalResult.forEach((item) => {
  //     let currentAccount = rankScore.find((item1) => item1.id == item.id);
  //     if (currentAccount) {
  //       currentAccount.score = currentAccount.score / 3;
  //     }
  //   });
  //   return finalResult.map((item) => item.link);
  // }

  let finalResult = result.sort((a, b) => b.score - a.score).slice(0, 10);
  if (whiteList.length > 0) {
    whiteList.forEach((item) =>
      finalResult.unshift({
        id: uuidv4(),
        link: item,
        score: 999999,
      })
    );
    whiteList.length = 0;
    finalResult = finalResult.slice(0, 10);
  }
  finalResult.forEach((item) => doneList.push(item.id));
  console.log(doneList);
  finalResult.forEach((item) => {
    let currentAccount = rankScore.find((item1) => item1.id == item.id);
    if (currentAccount) {
      currentAccount.score = currentAccount.score / 3;
    }
  });
  console.log("Final result: ", finalResult);
  return finalResult.map((item) => item.link);
};

async function myTask() {
  const currentTime = moment().format("DD/MM/YYYY HH:mm:ss");
  currentId = uuidv4();
  isWork = true;
  console.log("Message Id: " + currentId);
  console.log("Thời gian hiện tại:", currentTime);
  //Gửi tin nhắn thông báo post link
  //-1001957652310 seeding channel
  //-1001917262259 test channel
  bot.sendMessage(
    -1001957652310,
    "Hello anh em. Anh em có bài post nào thì bỏ dưới cmt nhé, lưu ý là bài mới, bài cũ không có tác dụng. 15p sau mình sẽ post lên cho mọi người cùng chéo.\n" +
      "Msg id: " +
      currentId +
      "\n"
  );
  console.log("Chờ user gửi link trong 15p!");
  await sleep(60000 * 15);

  const ghimLink = filterLink(doneTaskList, currentTaskList)
    .map((item, index) => index + 1 + ". " + item)
    .join("\n")
    .concat(` \n\nHi ae, đây là 10 post của lượt này, ae tương tác ủng hộ các bạn, xong hết nhớ reply "done all" ( rất quan trọng), có thể kèm link xuống cho ae trả nhé.
Nếu xong 1 link thì reply "done".
\n>>>>> Các kênh chính thức của #XFINANCE:
- X FINANCE: https://x.com/xfinancevn
- X FINANCE NEWS: https://x.com/xfinancevn_news
Anh em follow 2 tài khoản này và reply trong nhóm done2follow sẽ được nâng điểm và ưu tiên post bài.
Thank you all`);
  console.log("ghimLink: " + ghimLink);
  bot.sendMessage(-1001957652310, ghimLink);

  isWork = false;
  currentTaskList.length = 0;
  const currentDate = new Date();

  // Get the current hour (0-23)
  const currentHour = currentDate.getHours();

  console.log("Current hour:", currentHour);
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

// Lên lịch cho các thời điểm cụ thể trong ngày
cron.schedule("0 7,10,13,16,19,22 * * *", async () => {
  console.log("Cron job started.");
  await myTask();
  console.log("Cron job finished.");
});

const writeFileFunc = () => {
  fs.writeFileSync("./score.json", JSON.stringify(rankScore));
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

+ Mỗi người mỗi ngày được lên ghim tối đa 1 lần. 60 post 1 ngày là 60 người. Rank top 60 sẽ được gim trong ngày. Ưu tiên từ cao xuống thấp

+ Gửi link trong nhóm chat sẽ trừ điểm. Cần phải tương tác lại link khác để có điểm

- X FINANCE: https://x.com/xfinancevn
- X FINANCE NEWS: https://x.com/xfinancevn_news

Follow 2 tài khoản này và reply trong nhóm done2follow sẽ được nâng điểm và ưu tiên post bài

Tele:
- Channel : https://t.me/xfinancevietnam
- Nhóm chat: https://t.me/xfinancevnn
`;
  bot.sendMessage(-1001851061739, message);
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
cron.schedule("*/1 * * * *", writeFileFunc);
cron.schedule("*/10 7-23 * * *", writeReportFunc);
cron.schedule("*/30 7-23 * * *", ruleAlert);
cron.schedule("*/10 7-23 * * *", reportAlert);

// Khởi động ứng dụng
console.log("Ứng dụng đã khởi động.");
