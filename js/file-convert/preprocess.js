import UI from "../ui/ui.js";
import $ from "../global.js";

export default class Preprocess {
  static initialize() {
    this.fileInput = $("#input-btn");
    this.fileConvert = $("#convert-btn");
    this.fileInput.addEventListener("change", this.getFileInfo);
    this.fileConvert.addEventListener("click", this.convertFile.bind(this));
  }

  static getFileInfo(e) {
    const input = e.target;
    const file = input.files[0];
    const name = file.name;
    const size = file.size;

    // 파일의 크기가 너무 클 경우 업로드 불가
    const maxSize = 3000;
    if (size / 1000 > maxSize) {
      return alert(`${maxSize}kb 이상의 파일은 업로드 할 수 없습니다!`);
    }

    const sizeKb = Math.round(size / 1000);
    UI.displayFileInfo(name, sizeKb);
  }

  static async convertFile() {
    if (!this.fileInput.files.length) {
      return alert("파일이 없습니다!");
    }

    const file = this.fileInput.files[0];
    const text = await this.readTextFromFile(file);
    const hasNonAscii = this.checkAscii(text);``
  }

  static readTextFromFile(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsText(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
    });
  }

  static checkNonAsciiText(text) {
    const textRegex = /[^\u0020-\u007f]+/u;
    const hasNonAscii = textRegex.test(text);

    return hasNonAscii;
  }
}
