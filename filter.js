const fs = require('fs')

let doneList = fs.readFileSync("./donelist.txt",'utf-8')

let waitList = fs.readFileSync("./list.txt",'utf-8')

let usernameList = doneList.split("\r\n").map(item => item.split("/")[3])
console.log(usernameList)
let i = 1;
waitList.split("\r\n").forEach(link => {
    if(usernameList.indexOf(link.split("/")[3]) == -1){
        console.log(i + ". " + link);
        i++
    }
})
