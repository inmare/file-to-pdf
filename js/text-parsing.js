import * as convert from "./type-conversion.js";

// 특수문자의 경우 자동으로 \를 앞에 붙여줌
RegExp.escape = function (s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

// 줄 바꿈 문자가 어떤 os의 것인지 판단
function getLineBreakChar(text) {
  const indexOfLF = text.indexOf("\n", 1);

  if (indexOfLF === -1) {
    if (text.indexOf("\r") !== -1) return "\r";
    return "\n";
  }

  if (text[indexOfLF - 1] === "\r") return "\r\n";
  return "\n";
}

/*
현재 알고리즘이 만들어내는 공백 대체 문자는 각 아스키코드를 최대 한번 이용한다
아스키코드를 2번 이상 이용해야 될 문자열이 입력으로 들어올 가능성은 거의 없기 때문에
아래와 같은 방식을 이용했다
*/
function getAvailSpaceChar(text) {
  let asciiInfoArr = makeAsciiInfoArray(text);

  // 글자들 중 빈도수가 작은 것부터 우선적으로 분류
  asciiInfoArr = sortAsciiInfoArray(asciiInfoArr);

  // 혼동이 가능한 글자의 리스트, 후에 추가 가능
  let charChecklist = RegExp.escape("'`,.~-08BOD5S$");
  let spaceCharArr = [];
  let spaceChar = "";

  for (let i = 0; i < asciiInfoArr.length; i++) {
    const asciiInfo = asciiInfoArr[i];
    const regexp = new RegExp(asciiInfo.regChar, "g");

    if (charChecklist.match(regexp)) {
      continue;
    }

    // 텍스트에 해당 글자가 없을 때
    if (asciiInfo.count == 0) {
      spaceChar = asciiInfo.char;
      break;
    } else {
      // 해당 글자가 있을 때
      if (!spaceCharArr.length) {
        spaceCharArr.push(asciiInfo);
        continue;
      } else {
        let tempSpaceChar = "";
        for (const charInfo of spaceCharArr) {
          tempSpaceChar += charInfo.regchar;
        }
        tempSpaceChar += asciiInfo.regchar;
        const tempRegexp = new RegExp(tempSpaceChar, "g");
        if (!text.match(tempRegexp)) {
          spaceChar = spaceCharArr[0].char + asciiInfo.char;
          break;
        } else {
          continue;
        }
      }
    }
  }

  return spaceChar;
}

function makeAsciiInfoArray(text) {
  let asciiInfoArr = [];

  for (let i = 0x21; i < 0x7f; i++) {
    const ascii = RegExp.escape(String.fromCharCode(i));
    const regexp = new RegExp(ascii, "g");

    // 일치하는 문자열이 없을 경우 match가 null을 반환
    const charCount = text.match(regexp) ? text.match(regexp).length : 0;
    const asciiInfo = {
      num: i,
      char: String.fromCharCode(i),
      regChar: ascii,
      count: charCount,
    };

    asciiInfoArr.push(asciiInfo);
  }

  return asciiInfoArr;
}

function sortAsciiInfoArray(asciiInfoArr) {
  return asciiInfoArr.sort(function (a, b) {
    return a.count < b.count ? -1 : a.num > b.num ? 1 : 0;
  });
}

/* 메타데이터 구조 (readme에 설명 되어 있음)

텍스트 파일
A BB CC DDD EEE <파일 이름(유니코드화)> <공백 대체 문자> 

- A: 파일의 종류. 일반 텍스트 파일일 경우 0입니다.
- B: 띄어쓰기를 대체하는 글자의 길이
- C: 파일 이름의 길이
- D: 마지막 줄의 글자 수
- E: 마지막 페이지의 줄 수

텍스트 파일(유니코드), 일반 파일
A BB CC DDD EEE <파일 이름(유니코드화)>

- A: 파일의 종류. 유니코드 텍스트 파일의 경우 1, 일반 파일의 경우 2입니다.
- B: 일반 텍스트 파일과 데이터 길이를 맞추기 위한 공백으로 00이 들어갑니다.
- C: 파일 이름의 길이
- D: 마지막 줄의 글자 수
- E: 마지막 페이지의 줄 수
*/
function addMetadataToText(textInfo, fileName) {
  // textHLen, textVLen과 metaLength은 추후에 수정 될 수 있음
  const info = textInfo;
  const textHLength = 220;
  const textVLength = 173;
  const pageLength = textHLength * textVLength;
  const metaLength = 11;
  const fileNameUnicode = convert.textToUnicode(fileName);
  let textLength = null;
  let metadata = "";

  // 파일 이름, 공백 대체 문자(텍스트 파일 한정)
  if (info.option == "text") {
    textLength =
      info.text.length +
      info.spaceChar.length +
      fileNameUnicode.length +
      metaLength;
    metadata += "0";
    metadata += convert.dcmToHex(info.spaceChar.length, 2, info.option);
  } else {
    textLength = textInfo.text.length + fileNameUnicode.length + metaLength;
    // 유니코드: 1, 일반 파일 :2
    info.option == "unicode" ? (metadata += "1") : (metadata += "2");
    metadata += "OO"; // 길이 맞춤용 문자. 00이 아니라 OO임에 유의
  }

  // 파일 이름 길이
  metadata += convert.dcmToHex(fileName.length, 2, info.option);

  // 마지막 줄의 글자 수
  const lastCharLength = textLength % textHLength;
  metadata += convert.dcmToHex(lastCharLength, 3, info.option);

  // 마지막 페이지의 줄 수
  const lastPageLen =
    textLength > pageLength ? textLength % pageLength : textLength;
  const lineLen = convert.roundDcmPlace(lastPageLen / textHLength);
  const fullLineLen = Math.floor(lineLen);
  const lastLine = lineLen - fullLineLen == 0.0 ? 1 : 0;
  const lastLineLength = fullLineLen + lastLine;
  metadata += convert.dcmToHex(lastLineLength, 3, info.option);

  // 마지막 줄을 완전히 채워줄 글자
  const lastLineFiller = info.text[info.text.length - 1].repeat(
    textHLength - lastCharLength
  );

  let fileText = null;
  if (info.option == "text") {
    fileText =
      metadata + fileNameUnicode + info.spaceChar + info.text + lastLineFiller;
  } else {
    fileText = metadata + fileNameUnicode + info.text + lastLineFiller;
  }

  return fileText;
}

export {
  getLineBreakChar,
  getAvailSpaceChar,
  makeAsciiInfoArray,
  sortAsciiInfoArray,
  addMetadataToText,
};
