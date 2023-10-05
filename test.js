// const { exec,execSync } = require('child_process');
const fs = require('fs');

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


let urls = [
    'https://twitter.com/PimarketApp/status/1709423985455476953',
    'https://x.com/thaindnguyen/status/1709943504833794281',
    'https://x.com/maiphuong2x/status/1709777835051901340',
    'https://x.com/Tracyxp212/status/1709897977551331436',
    'https://x.com/phanquochaut4/status/1709906177939972591',
    'https://twitter.com/emieseth/status/1709875889599865026',
    'https://twitter.com/Doom_XFinance/status/1709907225517674710',
    'https://twitter.com/Q091000/status/1709949785900449998',
    'https://x.com/inhvnthin11/status/1709946984759734697',
    'https://twitter.com/vuongthai90/status/1709937202854334483',
    'https://x.com/daity510/status/1709777199396757886',
    'https://x.com/ntawinter/status/1709872209244881207'
  ]

//twscrape user_by_login USERNAME








const checkVar = (urls, username) => {
    console.log("Đang check var: " + username)
    const userInfoRaw = require('child_process').execSync(`twscrape user_by_login ${username}`).toString();

    const userInfo = JSON.parse(userInfoRaw)
    const idURLs = urls.map(item => item.split("status/")[1]);
    const result = require('child_process').execSync(`twscrape user_tweets_and_replies ${userInfo.id_str} --limit=1 > ./users/${username}.txt`).toString();

    const dataRaw = fs.readFileSync(`./users/${username}.txt`, { encoding: 'utf-8' });
    const finalData = dataRaw.split("\n").filter(item => item).map(item => JSON.parse(item).id_str);
    let count = 0;
    idURLs.forEach(id => {
        if (finalData.indexOf(id) !== -1) {
            count += 1;
        }
    });
    console.log(`Tổng tương tác của ${username}: ${count}/${idURLs.length}`)
    return count;
}

checkVar(urls, "coincomedian");

