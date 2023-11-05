let rankScore = require("./score.json")

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

let newRankScore = markDuplicatesAsBanned(rankScore)

rankScore = JSON.parse(JSON.stringify(newRankScore))

console.log(rankScore)