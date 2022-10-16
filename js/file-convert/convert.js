import Preprocess from "./preprocess.js";
import Setting from "../setting/setting.js";
import $ from "../global.js";

export default class Convert {
  static initialize() {
    const fileConvert = $("#convert-btn");
    fileConvert.addEventListener("click", this.convertFile);
  }

  static async convertFile() {
    const fileInput = $("#input-btn");
    Preprocess.changeSetting();

    const makeRandom = Setting.makeRandomText.default;
    if (makeRandom) {
      // make random text
      console.log(makeRandom);
    } else {
      if (!fileInput.files.length) {
        return alert("파일이 없습니다!");
      }
      const file = fileInput.files[0];
      const text = await Preprocess.readTextFromFile(file);
    }
  }
}
