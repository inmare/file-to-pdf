import * as convert from "./type-conversion.js";

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

export { addMetadataToText };
