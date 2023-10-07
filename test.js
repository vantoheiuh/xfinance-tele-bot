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
    'https://x.com/xfinancevn/status/1710181899073888363?s=46&t=YscXrj-m4APmdbiNwqm-iA',
    'https://x.com/xfinancevn_news/status/1710120169270550538',
    'https://x.com/namsb88/status/1710096798856204368',
    'https://twitter.com/vuongthai90/status/1710171480494154052',
    'https://twitter.com/TaiBuiZ1000/status/1710159260452311074',
    'https://twitter.com/TuLa1219/status/1710029785970454686',
    'https://twitter.com/THNGLUVN627598/status/1710133125366665278',
    'https://x.com/xglobaltravel/status/1710095462697771131',
    'https://twitter.com/AkaiTrading/status/1710118641457680426',
    'https://x.com/CryptoHQN/status/1710109927891751179',
    'https://x.com/hung_bnb/status/1710171390039802192',
    'https://twitter.com/ladson_lady/status/1709971463258976268'
  ]

//twscrape user_by_login USERNAME








const checkVar = (urls, username, twitterIdStr) => {
    console.log("Đang check var: " + username)

    const missingPosts = []
  
    let path = `./users/${username}${urls.length}.txt`
    const idURLs = urls.map(item => item.split("status/")[1].split("?")[0]);
    const result = require('child_process').execSync(`twscrape user_tweets_and_replies ${twitterIdStr} --limit=${urls.length === 5 ? 1 : 50} > ${path}`).toString();


  
    const dataRaw = fs.readFileSync(path, { encoding: 'utf-8' });
    const finalData = dataRaw.split("\n").filter(item => item).map(item => JSON.parse(item).id_str);
    let count = 0;
    idURLs.forEach(id => {
      if (finalData.indexOf(id) != -1) {
        count += 1;
      }else{
        console.log(urls.find(item => item.indexOf(id) !== -1))
        missingPosts.push(urls.find(item => item.indexOf(id) !== -1))
      }
    });
    console.log(`Tổng tương tác của ${username}: ${count}/${idURLs.length}`)
    return {count, missingPosts};
  }

const a = checkVar(urls, "thaidozk", "1677720785396596736");

console.log(a)

