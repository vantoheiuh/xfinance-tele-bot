const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require("fs");

const rankScore = require("./score.json");

const reportList = require("./report.json");

let snapshotList = require("./snapshot.json");

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

  let crAccount = rankScore.find((item) => item.id == msg.from.id);
  if (crAccount && !crAccount.firstName) {
    crAccount.firstName = msg.from.first_name
    crAccount.lastName = msg.from.last_name
  }
  if (
    (msg.from.username == "xfinancevn" || msg.from.id == 1087968824 || msg.from.id == 5873879220) &&
    msg.text.indexOf("/add") !== -1
  ) {
    if (containsLink(whiteList.push(msg.text.split(" ")[1])) && whiteList.indexOf(msg.text.split(" ")[1]) !== -1)
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
    if (containsLink(msg.text) && msg.from.id != 777000) {
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
    // console.log(msg)
    if (containsLink(msg.text) && msg.from.id != 777000) {
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
        currentAccount.score -= 3;
      }
    }
  }
  if (
    msg.text.toLowerCase().indexOf("done") !== -1 &&
    msg.text.toLowerCase().indexOf("done all") === -1 &&
    msg.text.toLowerCase().indexOf("done2follow") === -1 &&
    msg.text.toLowerCase().indexOf("done2gr") === -1 &&
    containsLink(msg.reply_to_message.text)
  ) {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    if (currentAccount) {
      currentAccount.score += 1;
      console.log(
        "User " +
        msg.from.id +
        " score updated. Current score: " +
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
          " score updated. Current score: " +
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
      containsLink(msg.reply_to_message.text)) ||
    (msg.text.toLowerCase().indexOf("done2gr") !== -1 && containsLink(msg.reply_to_message.text))
  ) {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    if (currentAccount && msg.text.toLowerCase().indexOf("done all") !== -1 && msg.reply_to_message.text.indexOf(`Nếu xong 1 link thì reply "done".`) !== -1) {
      currentAccount.score += 10;
      console.log(
        "User " +
        msg.from.id +
        "score updated. Current score: " +
        currentAccount.score
      );
    } else if (msg.text.toLowerCase().indexOf("done2follow") !== -1 && !currentAccount.isFollow) {
      currentAccount.score += 15;
      currentAccount.isFollow = true;
      console.log(
        "User " +
        msg.from.id +
        "score updated. Current score: " +
        currentAccount.score
      );
    } else if (msg.text.toLowerCase().indexOf("done2gr") !== -1 && !currentAccount.isJoin) {
      currentAccount.score += 20;
      currentAccount.isJoin = true;
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

  if (msg.text.toLowerCase().indexOf("/top") !== -1) {
    let index = parseInt(msg.text.toLowerCase().split(" ")[1].trim());
    let accountIndex = snapshotList.sort((a, b) => b.score - a.score)[index - 1];
    bot.sendMessage(
      -1001851061739,
      `Vị trí số ${index} thuộc về: ${accountIndex.firstName} ${accountIndex.lastName ? accountIndex.lastName : ""}, username: @${accountIndex.username.length < 36 ? accountIndex.username : ""}`
    );
  }

  if (msg.text.toLowerCase() === "/giveaway") {
    if (snapshotList.length == 0) {
      bot.sendMessage(
        -1001851061739,
        "Chưa đến giờ snapshot, vui lòng kiểm tra lại sau."
      );
    }
    else {
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
          " vào lúc snapshot, bạn đủ điều kiện tham gia daily giveaway của X FINANCE."
        );
      } else {
        currentAccountIndex++;
        bot.sendMessage(
          -1001851061739,
          msg.from.first_name +
          " đạt thứ hạng: " +
          currentAccountIndex +
          " vào lúc snapshot, bạn KHÔNG đủ điều kiện tham gia daily giveaway của X FINANCE."
        );
      }
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
    whiteList.forEach((item) => {
      if (finalResult.indexOf(item) === -1) {
        finalResult.unshift({
          id: uuidv4(),
          link: item,
          score: 999999,
        })
      }
    }
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
    `Hello anh em. Anh em có bài post nào thì bỏ dưới cmt nhé, lưu ý là bài mới, bài cũ không có tác dụng. 15p sau mình sẽ post lên cho mọi người cùng tương tác.

- Cơ chế ghim link:
  1. Gom tất cả link của anh em lại thành 1 danh sách
  2. Loại ra tất cả link của anh em đã lên trong ngày được danh sách mới
  3. Từ danh sách mới lấy ra 10 link của anh em theo thứ tự rank cao -> thấp
=> Anh em không nằm trong top vẫn hoàn toàn có thể được ghim nên đừng ngại post link nhé, vì sẽ có những lúc có ít link được gửi thì ae dễ được ghim hơn.

Thank anh em <3.
Msg id:  ${currentId} 
`
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

const writeFileFunc = () => {
  fs.writeFileSync("./score.json", JSON.stringify(rankScore));
};

const writeSnapshotFunc = () => {
  snapshotList = JSON.parse(JSON.stringify(rankScore));
  fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotList));
};

const writeSnapshotClearFunc = () => {
  snapshotList.length = 0 
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
+ Mỗi người mỗi ngày được lên ghim tối đa 1 lần. 60 post 1 ngày là 60 người. Rank top 60 sẽ được gim trong ngày. Ưu tiên từ cao xuống thấp
+ Gửi link trong nhóm chat sẽ trừ điểm. Cần phải tương tác lại link khác để có điểm

- X FINANCE: https://x.com/xfinancevn
- X FINANCE NEWS: https://x.com/xfinancevn_news
Ngoài ra, ae follow 2 tài khoản này và reply trong nhóm done2follow sẽ được nâng điểm và ưu tiên post bài
`;
  bot.sendMessage(-1001851061739, message);
};

const adAlert = () => {
  let message = `
HÃY JOIN ỦNG HỘ 2 KÊNH MỚI CỦA XFINANCE NHÉ AE: 

https://t.me/hiddengemsx
  
Nhóm cày Airdrop free nhận air đổi đời của nhà X FINANCE anh em vào sớm nhé❤️‍🩹
  
https://t.me/shitcoinxfinance
  
Nhóm shitcoin lowcap và meme của X FINANCE chuẩn bị sẵn cho siêu sóng sắp tới

NGOÀI RA, ANH EM SAU KHI JOIN 2 KÊNH NÀY VÀ REPLY LẠI MESSAGE NÀY SẼ ĐƯỢC CỘNG ĐIỂM RANK: done2gr
`;
  bot.sendMessage(-1001957652310, message);
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
cron.schedule("0 12 * * *", writeSnapshotFunc);
cron.schedule("0 23 * * *", writeSnapshotClearFunc);
cron.schedule("30 6,9,12,15,18,21 * * *", adAlert);
cron.schedule("*/10 7-23 * * *", writeReportFunc);
cron.schedule("*/30 7-23 * * *", ruleAlert);
cron.schedule("*/10 7-23 * * *", reportAlert);
cron.schedule("0 7,10,13,16,19,22 * * *", async () => {
  console.log("Cron job started.");
  await myTask();
  console.log("Cron job finished.");
});


// Khởi động ứng dụng
console.log("Ứng dụng đã khởi động.");
