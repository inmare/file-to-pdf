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
}
