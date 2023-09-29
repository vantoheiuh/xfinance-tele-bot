const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require("fs");

const rankScore = require("./score.json");

const reportList = require("./report.json");

let snapshotList = require("./snapshot.json");

let infoMembers = require("./members.json");

let currentLinks = [];
let nextLinks = [];

// console.log(rankScore);


// replace the value below with the Telegram token you receive from @BotFather
const token = "6400705715:AAEIuGZkxkqhUcxTD4G45c2GPOOpPmwIKcM";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.

let currentTaskList = [];
let doneTaskList = [];
let isWork = false;
let whiteList = [];
let isReverse = false;
let clonedLinks = [];
let backupLinks = require("./backupLinks.json");
let firstRun = true;
let ids = require("./ids.json");
let idLink;


let done = require("./done.json");
done.forEach((item) => doneTaskList.push(item));

let currentId = uuidv4();

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const currentDate = new Date();
  // Get the current hour (0-23)
  const currentHour = currentDate.getHours();
  console.log(`${msg.from.id ?? ""} : ${msg.from.first_name ?? ""} ${msg.from.last_name ?? ""}: ${msg.text}`);
  // console.log(msg);

  let crAccount = rankScore.find((item) => item.id == msg.from.id);
  if (crAccount && !crAccount.firstName) {
    crAccount.firstName = msg.from.first_name
    crAccount.lastName = msg.from.last_name
  }
  if (crAccount && !crAccount.doneList) {
    crAccount.doneList = [];
  }
  if (crAccount && !crAccount.idsLink) {
    crAccount.idsLink = [];
  }
  if (crAccount && !crAccount.isShit) {
    crAccount.isShit = false;
  }

  if (
    (msg.from.username == "xfinancevn" || msg.from.id == 1087968824 || msg.from.id == 5873879220) &&
    msg.text.indexOf("/add") !== -1 && msg.text.indexOf("/addtop") === -1
  ) {
    if (containsLink(whiteList.push(msg.text.split(" ")[1])) && whiteList.indexOf(msg.text.split(" ")[1]) !== -1)
      whiteList.push(msg.text.split(" ")[1].split("?")[0]);
    console.log("Add white list thanh cong: ", whiteList);
  }

  if (
    (msg.from.username == "xfinancevn" || msg.from.id == 1087968824 || msg.from.id == 5873879220) &&
    msg.text.toLowerCase() === "/clear"
  ) {
    whiteList.length = 0;
    isReverse = false;
    console.log("Remove white list thanh cong: ", whiteList);
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
    if (containsLink(msg.text) && msg.from.id != 777000 && msg.from.username !== "xfinancevn") {
      // Nếu có liên kết, bạn có thể thực hiện một số hành động ở đây, ví dụ:
      // Gửi tin nhắn cảnh báo hoặc xóa tin nhắn.
      let currentAccount = rankScore.find((item) => item.id == msg.from.id);
      let listIds = rankScore.map((item) => item.id);
      // console.log(currentAccount);
      // console.log(listIds.indexOf(msg.from.id) === -1);
      if (currentAccount) {
        currentAccount.twitter = msg.text.split(" ")[0].split("?")[0];
      }
      if (
        !currentAccount ||
        listIds.indexOf(msg.from.id) === -1 ||
        currentAccount.score < 5 ||
        msg.forward_from
      ) {
        if (msg.sender_chat && msg.sender_chat.id != "-1001976992799") {
          bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
          bot.sendMessage(
            chatId,
            msg.from.first_name +
            " không đủ điểm tối thiểu để gửi liên kết trong nhóm này, vui lòng tương tác các bài ghim trước khi gửi link."
          );
        }
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
    if (containsLink(msg.text) && msg.from.id != 777000 && msg.from.username !== "xfinancevn") {
      // Nếu có liên kết, bạn có thể thực hiện một số hành động ở đây, ví dụ:
      // Gửi tin nhắn cảnh báo hoặc xóa tin nhắn.
      let currentAccount = rankScore.find((item) => item.id == msg.from.id);
      let listIds = rankScore.map((item) => item.id);
      // console.log(currentAccount);
      // console.log(listIds.indexOf(msg.from.id) === -1);
      if (
        !currentAccount ||
        listIds.indexOf(msg.from.id) === -1 ||
        currentAccount.score < 5 ||
        msg.forward_from
      ) {
        if (msg.sender_chat && msg.sender_chat.id != "-1001976992799") {
          bot.deleteMessage(chatId, msg.message_id); // Xóa tin nhắn chứa liên kết
          bot.sendMessage(
            chatId,
            msg.from.first_name +
            " không đủ điểm tối thiểu để gửi liên kết trong nhóm này, vui lòng tương tác các bài ghim trước khi gửi link."
          );
        }

      } else {
        currentAccount.score -= 3;
      }

      if ((msg.text.indexOf("x.com") !== -1 || msg.text.indexOf("twitter.com/") !== -1) && msg.text.indexOf("/status/") !== -1 && extractUrls(msg.text).length > 0) {
        let links = extractUrls(msg.text);
        links.forEach(link => {
          if (currentLinks.length < 5 && currentLinks.indexOf(link.split("?")[0]) === -1) {
            currentLinks.push(link.split("?")[0]);
          } else if (
            currentLinks.length >= 5
            && nextLinks.length < 5
            && currentLinks.indexOf(link.split("?")[0]) === -1
            && nextLinks.indexOf(link.split("?")[0]) === -1) {
            nextLinks.push(link.split("?")[0]);
          }

          if (currentLinks.length >= 5 && nextLinks.length >= 5) {
            currentLinks.length = 0;
            currentLinks = JSON.parse(JSON.stringify(nextLinks));
            nextLinks.length = 0;
          }
        })
      }
    }
  }
  if (
    msg.text.toLowerCase().indexOf("done") !== -1 &&
    containsLink(msg.reply_to_message.text)
  ) {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    if (currentAccount) {
      if (
        currentAccount.doneList.indexOf(msg.reply_to_message.message_id) === -1 &&
        msg.text.toLowerCase().indexOf("done all") === -1 &&
        msg.text.toLowerCase().indexOf("done2follow") === -1 &&
        msg.text.toLowerCase().indexOf("done2gr") === -1) {
        currentAccount.score += 1;
        console.log(
          "User " +
          msg.from.id +
          " score updated. Current score: " +
          currentAccount.score
        );
        if (msg.reply_to_message.text.indexOf(`Nếu xong 1 link thì reply "done".`) === -1)
          currentAccount.doneList.push(msg.reply_to_message.message_id);
        if ((currentHour <= 7 || currentHour >= 19) && msg.reply_to_message.text.indexOf(`[BOOST]`) !== -1) {
          currentAccount.score += 0.2;
        }
      }


    } else {
      let currentAccountUsername = rankScore.find(
        (item) => item.username == msg.from.username
      );
      if (currentAccountUsername) {
        if (
          msg.text.toLowerCase().indexOf("done all") === -1 &&
          msg.text.toLowerCase().indexOf("done5") === -1 &&
          msg.text.toLowerCase().indexOf("done2follow") === -1 &&
          msg.text.toLowerCase().indexOf("done1follow") === -1 &&
          msg.text.toLowerCase().indexOf("done2gr") === -1) {
          currentAccountUsername.score = currentAccountUsername.score += 1;

          currentAccountUsername.id = msg.from.id;
          console.log(
            "User " +
            msg.from.id +
            " score updated. Current score: " +
            currentAccountUsername.score
          );
        }

      } else {
        rankScore.push({
          username: msg.from.username ?? uuidv4(),
          score: 1,
          id: msg.from.id,
        });
      }
    }
  }

  if(msg.text.toLowerCase() === "/start"){
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    let currentAccountUsername = rankScore.find(
      (item) => item.username == msg.from.username
    );
    if(!currentAccount && !currentAccountUsername){
      rankScore.push({
        username: msg.from.username ?? uuidv4(),
        score: 1,
        id: msg.from.id,
      });
    }
  }


  if (
    msg.text.toLowerCase().indexOf("done2follow") !== -1 ||
    (msg.text.toLowerCase().indexOf("done all") !== -1 &&
      containsLink(msg.reply_to_message.text)) ||
    (msg.text.toLowerCase().indexOf("done2gr") !== -1 && containsLink(msg.reply_to_message.text)) ||
    (msg.text.toLowerCase().indexOf("done1follow") !== -1 && containsLink(msg.reply_to_message.text)) ||
      msg.text.toLowerCase().indexOf("done5") !== -1
  ) {
    let currentAccount = rankScore.find((item) => item.id == msg.from.id);
    if (currentAccount && currentAccount.doneList.indexOf(msg.reply_to_message.message_id) === -1 && msg.text.toLowerCase().indexOf("done all") !== -1 && msg.reply_to_message.text.indexOf(`Nếu xong 1 link thì reply "done".`) !== -1) {
      currentAccount.score += 20;
      console.log(
        "User " +
        msg.from.id +
        " score updated. Current score: " +
        currentAccount.score
      );
      currentAccount.doneList.push(msg.reply_to_message.message_id);
      if ((currentHour <= 7 || currentHour >= 19) && msg.reply_to_message.text.indexOf(`[BOOST]`) !== -1) {
        currentAccount.score += 4;
      }
    } else if (msg.text.toLowerCase().indexOf("done2follow") !== -1 && !currentAccount.isFollow) {
      currentAccount.score += 30;
      currentAccount.isFollow = true;
      console.log(
        "User " +
        msg.from.id +
        "score updated. Current score: " +
        currentAccount.score
      );
    } else if (msg.text.toLowerCase().indexOf("done2gr") !== -1 && !currentAccount.isJoin) {
      currentAccount.score += 30;
      currentAccount.isJoin = true;
      console.log(
        "User " +
        msg.from.id +
        "score updated. Current score: " +
        currentAccount.score
      );
    } else if (msg.text.toLowerCase().indexOf("done5") !== -1 && currentAccount.idsLink.indexOf(idLink) === -1 && msg.reply_to_message.text.indexOf(idLink) !== -1) {
      currentAccount.idsLink.push(idLink)
      currentAccount.score += 7.5;
      if ((currentHour <= 7 || currentHour >= 19)) {
        currentAccount.score += 1;
      }
      console.log(
        "User " +
        msg.from.id +
        "score updated. Current score: " +
        currentAccount.score
      );
    } else if (msg.text.toLowerCase().indexOf("done1follow") !== -1 && !currentAccount.isShit) {
      currentAccount.score += 10;
      currentAccount.isJoin = true;
      console.log(
        "User " +
        msg.from.id +
        "score updated. Current score: " +
        currentAccount.score
      );
    }

  }

  if (msg.text.toLowerCase() === "/check") {
    let checkedAccount = rankScore.find(item => item.id == msg.reply_to_message.from.id);
    if (checkedAccount && checkedAccount.twitter) {
      bot.sendMessage(-1001851061739, `Twitter của bạn ${checkedAccount.firstName ?? ""} ${checkedAccount.lastName ?? ""} là: ${checkedAccount.twitter.split("/status")[0] ?? "Không tìm thấy"}`)
    } else {
      bot.sendMessage(-1001851061739, `Không tìm thấy twitter`)
    }
  }

  // /input Văn Bạch | 1998 | Coder | https://twitter.com/xfinancevn_news
  if (msg.text.toLowerCase().indexOf("/input") !== -1) {
    let currentMember = msg.text.slice(7).trim().split("|")
    console.log(currentMember)
    let idsList = infoMembers.map(item => item.id);
    if (idsList.indexOf(msg.from.id) === -1) {
      infoMembers.push({
        name: currentMember[0].trim(),
        age: currentMember[1].trim(),
        info: currentMember[2].trim(),
        twitter: currentMember[3].trim(),
        id: msg.from.id,
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name
      })
      console.log(infoMembers);
      fs.writeFileSync("./members.json", JSON.stringify(infoMembers));
    }
  }


  // if (msg.text.toLowerCase() === "/check" &&){

  // }



  if (msg.text.toLowerCase() === "/link") {
    if (backupLinks.length > 0 && firstRun) {
      clonedLinks = JSON.parse(JSON.stringify(backupLinks));
      currentLinks = JSON.parse(JSON.stringify(backupLinks));
      let id = uuidv4();
      idLink = id;
      ids.push(idLink);
      firstRun = false;
    }
    if (currentLinks && clonedLinks && currentLinks[0] != clonedLinks[0] && currentLinks.length == 5) {
      clonedLinks = JSON.parse(JSON.stringify(currentLinks));
      backupLinks = JSON.parse(JSON.stringify(currentLinks));
      fs.writeFileSync("./backupLinks.json", JSON.stringify(backupLinks));
      let id = uuidv4();
      idLink = id;
      ids.push(idLink);
    }
    if (currentLinks.length == 5) {
      let linkMarkUp = currentLinks.map(item => {
        return [{ text: "@" + item.split(".com/")[1].split("/status")[0], url: item }]
      })

      let finalLinkMarkup = {
        inline_keyboard: linkMarkUp
      }
      // console.log(finalLinkMarkup);

      // Tin nhắn với inline keyboard
      const messageOptions = {
        reply_markup: finalLinkMarkup,
      };

      bot.sendMessage(-1001851061739, `MSG id: ${idLink}
Dưới đây là ${currentLinks.length} link gần nhất được gửi trong nhóm chat để tương tác, sau khi tương tác xong hãy reply lại message này với từ khóa: done5 để bot cộng điểm.`, messageOptions);

    } else {
      bot.sendMessage(-1001851061739, `Chưa đủ 5 link để tương tác, có thể là do bot vừa reset`)
    }


  }
  if (msg.text.toLowerCase() === "/point") {
    bot.sendMessage(-1001851061739, `CƠ CHẾ TÍNH POINT CÀY RANK X FINANCE:
- Tương tác bài ghim link (done all): 20 điểm, giờ vàng: 30 điểm
- Tương tác lẻ 1 link trong group chat (done): 1 điểm, giờ vàng: 1.5 điểm
- Tương tác 5 link gần nhất từ lệnh /link (done5): 7.5 điểm, giờ vàng: 10 điểm
- done2gr và done2follow ( hiệu lực 1 lần mỗi account): 30 điểm
- Mỗi lần post link trong group chat trừ 3 điểm
- Mỗi lần được chọn lên bài ghim channel "được" chia 3 điểm
Giờ vàng: từ 19h tối tới 7h sáng hàng ngày
    `)
  }

  if (msg.text.toLowerCase() === "/addtop") {
    isReverse = true;
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
        `Thứ hạng hiện tại của bạn ${msg.from.first_name ?? ""} ${msg.from.last_name ?? ""} là: ${currentAccountIndex}/${sortedRankScore.length}`);
    } else {
      bot.sendMessage(
        -1001851061739,
        `${msg.from.first_name} " đã làm gì có rank mà check =)))).
Hãy nhập /start để bot bắt đầu lưu bạn vào hệ thống tính điểm rồi thử check rank lại`
      );
    }
  }

  if (msg.text.toLowerCase() === "/bot") {
    let message = `
DANH SÁCH CÂU LỆNH HỢP LỆ CỦA X FINANCE BOT:
- /rank: xem thứ hạng hiện tại
- /link: hiển thị 5 link gần nhất được gửi trong group chat
- /point: hiển thị chi tiết cơ chế tính điểm cày rank
- /report: báo cáo done mõm
- /check: kiểm tra twitter của member 
- /giveaway: kiểm tra thứ hạng rank khi snapshot
- /bot: kiểm tra các câu lệnh hợp lệ
  `;
    bot.sendMessage(-1001851061739, message);
  }

  if (msg.text.toLowerCase().indexOf("/top") !== -1) {
    let index = parseInt(msg.text.toLowerCase().split(" ")[1].trim());
    let accountIndex = snapshotList.sort((a, b) => b.score - a.score)[index - 1];
    bot.sendMessage(
      -1001851061739,
      `Vị trí số ${index} thuộc về: ${accountIndex.firstName} ${accountIndex.lastName ? accountIndex.lastName : ""}, username: @${accountIndex.username.length < 36 ? accountIndex.username : ""}, twitter: ${accountIndex.twitter ? accountIndex.twitter.split("/status")[0] : ""}`
    );
  }

  if (msg.text.toLowerCase() === "/giveaway") {
    if (snapshotList.length == 0) {
      bot.sendMessage(
        -1001851061739,
        "Chưa đến giờ snapshot đâu cha, 12h00 hàng ngày mới snapshot =))))"
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
  // console.log(listIds.indexOf(msg.from.id) === -1);
  if (
    reportAccount.count >= 3 &&
    reportAccount.count <= 5 &&
    msg.from.id != 1906477815
  ) {
    // console.log("report account" + reportAccount);
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
  finalResult.forEach((item) => {
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
  const currentDate = new Date();

  // Get the current hour (0-23)
  const currentHour = currentDate.getHours();

  console.log("Current hour:", currentHour);
  let ghimLink;
  if (isReverse) {
    ghimLink = filterLink(doneTaskList, currentTaskList)
  } else {
    ghimLink = filterLink(doneTaskList, currentTaskList).reverse()
  }

  let ghimLinkFinal = ghimLink
    .map((item, index) => index + 1 + ". " + item)
    .join("\n")
    .concat(` \n\n${currentHour >= 19 || currentHour < 7 ? "[BOOST] " : ""}Hi ae, đây là 10 post của lượt này, ae tương tác ủng hộ các bạn, xong hết nhớ reply "done all" ( rất quan trọng), có thể kèm link xuống cho ae trả nhé.
Nếu xong 1 link thì reply "done".
\n>>>>> Các kênh chính thức của #XFINANCE:
- X FINANCE: https://x.com/xfinancevn
- X FINANCE NEWS: https://x.com/xfinancevn_news
Anh em follow 2 tài khoản này và reply trong nhóm done2follow sẽ được nâng điểm và ưu tiên post bài.
Thank you all`);
  console.log("ghimLink: " + ghimLinkFinal);
  bot.sendMessage(-1001957652310, ghimLinkFinal, { disable_web_page_preview: true });

  isWork = false;
  isReverse = false;
  currentTaskList.length = 0;

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
  bot.sendMessage(-1001851061739, message, { disable_web_page_preview: true });
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

const adShitAlert = () => {
  let message = `
HÃY FOLLOW ỦNG HỘ KÊNH MỚI CỦA XFINANCE NHÉ AE: 

https://twitter.com/shitcoin_x

NGOÀI RA, ANH EM SAU KHI FOLLOW + BẬT CHUÔNG KÊNH NÀY VÀ REPLY LẠI MESSAGE NÀY SẼ ĐƯỢC CỘNG 15 ĐIỂM RANK: done1follow
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

const commandAlert = () => {
  let message = `
DANH SÁCH CÂU LỆNH HỢP LỆ CỦA X FINANCE BOT:
- /rank: xem thứ hạng hiện tại
- /link: hiển thị 5 link gần nhất được gửi trong group chat
- /point: hiển thị chi tiết cơ chế tính điểm cày rank
- /report: báo cáo done mõm
- /check: kiểm tra twitter của member 
- /giveaway: kiểm tra thứ hạng rank khi snapshot
  `;
  bot.sendMessage(-1001851061739, message);
};
cron.schedule("*/1 * * * *", writeFileFunc);
cron.schedule("0 12 * * *", writeSnapshotFunc);
cron.schedule("0 23 * * *", writeSnapshotClearFunc);
cron.schedule("30 6,9,12,15,18,21 * * *", adAlert);
cron.schedule("0 6,9,12,15,18,21 * * *", adShitAlert);
cron.schedule("*/10 7-23 * * *", writeReportFunc);
cron.schedule("30 7-23 * * *", ruleAlert);
cron.schedule("15 7-23 * * *", commandAlert);
cron.schedule("45 7-23 * * *", reportAlert);

cron.schedule("0 7,10,13,16,19,22 * * *", async () => {
  console.log("Cron job started.");
  await myTask();
  console.log("Cron job finished.");
});


// Khởi động ứng dụng
console.log("Ứng dụng đã khởi động.");
