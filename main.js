// import path from "path";
// import {getCanvasImage, HorizontalImage, registerFont, UltimateTextToImage, VerticalImage} from "ultimate-text-to-image";
const path = require("path");
const axios = require("axios");
const {
  getCanvasImage,
  HorizontalImage,
  registerFont,
  UltimateTextToImage,
  VerticalImage,
} = require("ultimate-text-to-image");
let oldId;
const main = async () => {
  while (true) {
    try {
        const headers = {
            'X-Bparam': '{"a":"web","b":"Windows 10","c":"vi","d":7,"e":"","f":"","g":"","h":"0.1.0","i":"official"}'
          }
      const res = await axios.post(
        "https://api.followin.io/feed/list/recommended/news",
        {
          count: 20,
          only_important: true,
        },{headers}
      );
      let feedData = res.data.data.list[0];
      console.log(res.data.data.list[0]);
      // render the image
      const textToImage1 = new UltimateTextToImage(feedData.translated_title , {
        width: 800,
        maxWidth: 800,
        maxHeight: 800,
        fontFamily: "Arial",
        fontColor: "#e4e4e4",
        fontSize: 40,
        minFontSize: 10,
        lineHeight: 50,
        autoWrapLineHeightMultiplier: 1.2,
        margin: 40,
        marginBottom: 0,
        align: "left",
        valign: "middle",
        borderColor: "#101010",
        borderSize: 20,
        backgroundColor: "#101010",
        underlineColor: "#101010",
        underlineSize: 2,
        bold: "bolder",
      });
      const textToImage2 = new UltimateTextToImage(
        feedData.translated_content + "\n@xfinancevn_news: nơi cập nhật tin tức về #crypto nhanh nhất!",
        {
          width: 800,
          maxWidth: 800,
          maxHeight: 800,
          fontFamily: "Arial",
          fontColor: "#e0e0e0",
          fontSize: 24,
          minFontSize: 10,
          lineHeight: 50,
          autoWrapLineHeightMultiplier: 1.2,
          margin: 40,
          marginBottom: 60,
          align: "left",
          valign: "middle",
          borderColor: "#101010",
          borderSize: 20,
          backgroundColor: "#101010",
          underlineColor: "#101010",
          underlineSize: 2,
        }
      );

      const finalVerticalImage = new VerticalImage([
        textToImage1,
        textToImage2,
      ]);
      if (oldId != feedData.id)
        finalVerticalImage
          .render()
          .toFile(path.join(__dirname, `${feedData.id}.png`));

      oldId = feedData.id;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      console.log("error");
    }
  }
};

main();
