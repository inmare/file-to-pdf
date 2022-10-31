import Setting from "../setting/setting.js";
import pdfSetting from "../setting/pdfSetting.js";
import SeedRandom from "./randomText.js";

export default class Text {
  static arrayBufferToHex(arrayBuffer) {
    const view = new Uint8Array(arrayBuffer);
    const hexText = Array.from(view)
      .map((dec) => dec.toString(16))
      .join("");

    return hexText;
  }

  // 글자를 네 글자의 유니코드 형태로 되돌려줌
  static textToUnicode(text) {
    const unicodeText = text
      .split("")
      .map((char) => {
        return char.codePointAt(0).toString(16).padStart(4, "0");
      })
      .join("");

    return unicodeText;
  }

  static removeMimeFromDataURL(dataURL) {
    const base64Text = dataURL.replace(/.+,/i, "");

    return base64Text;
  }

  static replaceCharTable(text) {
    const fromArray = Setting.charTable.from;
    const toArray = Setting.charTable.to;
    const specialChars = "[\\^$.|?*+()";

    let replacedText = text;
    for (let dict of zip(fromArray, toArray)) {
      // 현재 문자가 띄어쓰기면 그냥 빈 문자열로 인식되는 문제가 있음
      // 일단 문자열이 빈 문자열일시 그냥 공백으로 생각하고 문자열을 변환하는 코드를 작성함
      let fromRegex;
      switch (dict.from) {
        case "":
          fromRegex = / /g;
          break;
        case "\\n":
          // 공백문자 변환 코드 출처
          // https://stackoverflow.com/questions/784539/how-do-i-replace-all-line-breaks-in-a-string-with-br-elements
          fromRegex = /(?:\r\n|\r|\n)/g;
          break;
        case "\\t":
          fromRegex = /\t/g;
          break;
        default:
          if (specialChars.includes(dict.from)) {
            fromRegex = new RegExp(`\\${dict.from}`, "g");
          } else {
            fromRegex = new RegExp(dict.from, "g");
          }
          break;
      }
      replacedText = replacedText.replace(fromRegex, dict.to);
    }

    return replacedText;

    // 두 array안에 있는 각 요소들을 1개의 dict로 모은 배열을 반환함
    function zip(a, b) {
      return a.map((item, idx) => {
        return { from: item, to: b[idx] };
      });
    }
  }

  static splitTextToArray(text) {
    const charPerLine = pdfSetting.charInfo.charPerLine;
    const lineLength = text.length / charPerLine;

    let linebreakText = [];

    for (let i = 0; i < lineLength; i++) {
      const startIdx = charPerLine * i;
      const endIdx = charPerLine * (i + 1);
      let line = text.slice(startIdx, endIdx);
      linebreakText.push(line);
    }

    return linebreakText;
  }

  static createRandomText() {
    const wholePage = Setting.randomPageNum.default;
    const textPerPage = pdfSetting.charInfo.textPerPage;
    const textLength = wholePage * textPerPage;

    const textType = Setting.randomTextType.default;

    const seedRandom = new SeedRandom();
    const randomText = seedRandom.makeRandomText(textType, textLength);
    const processedText = this.replaceCharTable(randomText);

    return processedText;
  }

  static getTensFromDec(num) {
    return String(num).slice(-2, -1);
  }
}
