// const { exec,execSync } = require('child_process');
const fs = require("fs");

// const result = []

// exec('twscrape user_tweets_and_replies 1294615357504630784 --limit=1', (err, stdout, stderr) => {
//     if (err) {
//       // node couldn't execute the command
//       console.log(err)
//       return;
//     }

//     // the *entire* stdout and stderr (buffered)
//     result.push(stdout);
//     fs.writeFileSync("./test.json", JSON.stringify(result))
//   });

console.log(new Date().toLocaleDateString());

let ghimLink = [
  {
    id: 6448559444,
    link: "https://twitter.com/TaiBuiZ1000/status/1711949899057795379",
    score: 493.60959259823767,
  },
  {
    id: 5679886372,
    link: "https://twitter.com/DonglaoMeme/status/1711919991669629183",
    score: 488.3333333333333,
  },
  {
    id: 1761287516,
    link: "https://x.com/trong_hatachi/status/1711629467951751569",
    score: 479.39895940564486,
  },
  {
    id: 5391813603,
    link: "https://twitter.com/quynhnhusodo66/status/1712031275064926622",
    score: 478.8699103004849,
  },
  {
    id: 363935824,
    link: "https://x.com/7979eth/status/1711902710776394184",
    score: 463.8973022347267,
  },
  {
    id: 296157287,
    link: "https://x.com/EmiesEth/status/1711936050741051770",
    score: 452.9944989453049,
  },
  {
    id: 885818612,
    link: "https://x.com/anna_if99/status/1711886377900732435",
    score: 447.5,
  },
  {
    id: 5045397477,
    link: "https://x.com/NTTHOME/status/1712003213883555972",
    score: 437.0898491083676,
  },
  {
    id: 1102205247,
    link: "https://x.com/downusd/status/1712032775388418203",
    score: 436.9506172839506,
  },
  {
    id: 1675840970,
    link: "https://twitter.com/andyyyy96/status/1711960611981263295",
    score: 428.0867076495792,
  },
  {
    id: 5249751721,
    link: "https://x.com/kinstark001/status/1712016736487436669",
    score: 409.33333333333337,
  },
  {
    id: 679419472,
    link: "https://x.com/DigiAssetIntel/status/1711942024595935387",
    score: 404.81740588324953,
  },
].map((item) => item.link);

let urls = [
  "https://x.com/xfinancevn/status/1710181899073888363?s=46&t=YscXrj-m4APmdbiNwqm-iA",
  "https://x.com/xfinancevn_news/status/1710120169270550538",
  "https://x.com/namsb88/status/1710096798856204368",
];
const currentDate = new Date();
const currentHour = currentDate.getHours();

let pushListMessage = `\n\n👉 Slot link của ban admin X FINANCE( có thể không tương tác). Mỗi link 10 point:
${urls
  .map((item, index) => index + 1 + ". " + item.split("/photo")[0])
  .join("\n")}`;

let ghimLinkFinal =
  `Khung giờ: ${currentHour}H ${new Date().toLocaleDateString()}.\n` +
  ghimLink
    .map((item, index) => index + 1 + ". " + item.split("/photo")[0])
    .join("\n")
    .concat(pushListMessage)
    .concat(` \n\nHi ae, đây là các post của lượt này, ae tương tác ủng hộ các bạn, xong hết nhớ reply "done all" ( rất quan trọng), có thể kèm link xuống cho ae trả nhé.
  Tối đa 60 điểm cho 1 bài ghim nhé anh em!
  
  >>>>> Các kênh chính thức của #XFINANCE:
  - X FINANCE: https://x.com/xfinancevn
  - X FINANCE NEWS: https://x.com/xfinancevn_news
  Anh em follow 2 tài khoản này và reply trong nhóm done2follow sẽ được 30 điểm.
  Thank you all`);


const getUrlById = (username, twitterIdStr) => {
  try {
  console.log("Getting lastest post for: " + username)

  const missingPosts = [];

  let path = `./users1/${username}.txt`;
  const result = require("child_process")
    .execSync(
      `python3 scrape1.py ${twitterIdStr} ${username} ${path} 20`
    )
    .toString();

  const dataRaw = fs.readFileSync(path, { encoding: "utf-8" });
  const finalData = dataRaw
    .split("\n")
    .filter(item => item)
    .map(item => JSON.parse(item))
    .filter((item) => !item.retweetedTweet && item.rawContent.indexOf("RT @") === -1 && item.url.toLowerCase().indexOf(username.toLowerCase()) !== -1)
    .map(item => item.url)
  return finalData[0];
  } catch (error) {
    return null;
  }
  
};

const a = getUrlById("HiddenGems_X", "284961232");

console.log(a);
