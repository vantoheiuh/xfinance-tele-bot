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
  const url = "https://i.ibb.co/ZYVhnsk/1.jpg";
  const canvasImage1 = await getCanvasImage({ url });
  const url2 = "https://i.ibb.co/BG29xnt/3.jpg";
  const canvasImage2 = await getCanvasImage({ url: url2 });
  while (true) {
    try {
      const headers = {
        "X-Bparam":
          '{"a":"web","b":"Windows 10","c":"vi","d":7,"e":"","f":"","g":"","h":"0.1.0","i":"official"}',
      };
      const res = await axios.post(
        "https://api.followin.io/feed/list/recommended/news",
        {
          count: 20,
          only_important: true,
        },
        { headers }
      );
      let feedData = res.data.data.list[0];
      console.log(res.data.data.list[0]);
      // render the image
      const textToImage1 = new UltimateTextToImage(" ", {
        width: 800,
        height: 200,
        images: [{ canvasImage: canvasImage1, layer: -1, repeat: "fit" }],
      });

      const textToImage3 = new UltimateTextToImage(" ", {
        width: 800,
        height: 200,
        images: [{ canvasImage: canvasImage2, layer: -1, repeat: "fit" }],
      });

      const textToImage2 = new UltimateTextToImage(
        feedData.translated_title.toUpperCase(),
        {
          width: 800,
          maxWidth: 800,
          fontFamily: "Kenyan Coffee",
          fontColor: "#260882",
          fontSize: 48,
          lineHeight: 1.2,
          autoWrapLineHeightMultiplier: 1.2,
          margin: 40,
          marginBottom: 60,
          align: "left",
          valign: "middle",
          borderColor: "#FFFFFF",
          borderSize: 20,
          backgroundColor: "#FFFFFF",
          underlineColor: "#FFFFFF",
          underlineSize: 2,
        }
      );



      const finalVerticalImage = new VerticalImage([
        textToImage1,
        textToImage2,
        textToImage3
      ]);
      if (oldId != feedData.id)
        finalVerticalImage
          .render()
          .toFile(path.join(__dirname, `${feedData.id}.jpg`));
      finalVerticalImage
        .render()
        .toFile(path.join(__dirname, `${feedData.id}.jpg`));
      oldId = feedData.id;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      console.log("error");
    }
  }
};

main();
