import Preprocess from "./preprocess.js";
import Setting from "../setting/setting.js";
import PDF from "../pdfGenerate/pdf.js";
import Type from "./type.js";
import Text from "../util/text.js";
import $ from "../util/global.js";

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
    } else {
      if (!fileInput.files.length) {
        return alert("파일이 없습니다!");
      }
      const file = fileInput.files[0];
      const text = await Type.fileToType(file, "Text");
      const convertType = Setting.convertType.default;

      if (convertType == "자동") {
        const convertType = Type.detectConvertType(text, file.size);
        Setting.convertType.default = convertType;
      }

      const convertText = await Convert.convertToText(file);
      const replacedText = Text.replaceCharTable(convertText);

      const metadata = Preprocess.getMetadata(file);

      PDF.createPDF(replacedText, metadata);
    }
  }

  static async convertToText(file) {
    const convertType = Setting.convertType.default;
    let resultText;
    switch (convertType) {
      case "Ascii": {
        const text = await Type.fileToType(file, "Text");
        resultText = Text.removeBlankFromText(text);
        break;
      }
      case "Hex": {
        const arrayBuffer = await Type.fileToType(file, "ArrayBuffer");
        resultText = Text.arrayBufferToHex(arrayBuffer);
        break;
      }
      case "Unicode": {
        const text = await Type.fileToType(file, "Text");
        resultText = Text.textToUnicode(text);
        break;
      }
      case "Base64": {
        const dataURL = await Type.fileToType(file, "DataURL");
        resultText = Text.removeMimeFromDataURL(dataURL);
        break;
      }
      default:
        break;
    }
    return resultText;
  }
}
