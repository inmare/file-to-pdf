import Setting from "../setting/setting.js";

// 파일, 텍스트 등의 종류 변경에 사용되는 함수 모음
export default class Type {
  static detectConvertType(text, fileSize) {
    const hasNonAscii = _hasNonAscii(text);
    if (!hasNonAscii) {
      return "Ascii";
    } else {
      const isSmall = _isFileSmall(fileSize);
      if (isSmall) {
        const hasCJK = _hasCJK(text);
        if (hasCJK) {
          return "Unicode";
        } else {
          return "Hex";
        }
      } else {
        return "Base64";
      }
    }

    function _hasNonAscii(text) {
      const textRegex = /[^\u0020-\u007f]+/u;
      const hasNonAscii = textRegex.test(text);

      return hasNonAscii;
    }

    function _hasCJK(text) {
      // CJK 정규표현식 범위 출처
      // https://stackoverflow.com/questions/43418812/check-whether-a-string-contains-japanese-chinese-characters
      const CJKregex =
        /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]+/u;
      const hasCJK = CJKregex.test(text);

      return hasCJK;
    }

    // 파일이 20kb보다 작으면 true 반환
    function _isFileSmall(fileSize) {
      const isSmall = fileSize / 1000 < 20;

      return isSmall;
    }
  }

  static fileToType(file, type) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      switch (type) {
        case "Text":
          fileReader.readAsText(file);
          break;
        case "ArrayBuffer":
          fileReader.readAsArrayBuffer(file);
          break;
        case "DataURL":
          fileReader.readAsDataURL(file);
          break;
      }

      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
    });
  }

  // 공백을 제외한 나머지 공백문자들(\n, \t)을 \\n, \\t의 형태로 바꿔줌
  // 이때 OS별 개행문자는 모두 \\n으로 통일
  static removeBlankFromText(text) {
    // 공백문자 변환 코드 출처
    // https://stackoverflow.com/questions/784539/how-do-i-replace-all-line-breaks-in-a-string-with-br-elements
    const compText = text
      .replace(/(?:\r\n|\r|\n)/g, "\\n")
      .replace(/\t/g, "\\t");

    return compText;
  }

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
      let fromRegex = new RegExp(dict.from, "g");
      if (dict.from == "") {
        fromRegex = /\s/g;
      } else if (specialChars.includes(dict.from)) {
        fromRegex = new RegExp(`\\${dict.from}`, "g");
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
}
