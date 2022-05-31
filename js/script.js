"use strict";

import { addMetadataToText } from "./text-parsing.js";
import * as convert from "./type-conversion.js";

window.jsPDF = window.jspdf.jsPDF;
// 특수문자의 경우 자동으로 \를 앞에 붙여줌
RegExp.escape = function (s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const fileInput = document.getElementById("file-input");
const convertButton = document.getElementById("convert-button");
fileInput.addEventListener("change", showFile);

// 파일 업로드하기
function showFile(e) {
  const fileList = e.target.files;
  const file = fileList[0];

  const fileType = document.querySelector(".file-type");

  let p = document.createElement("p");
  p.innerHTML = `${file.name}가 업로드 되었습니다.`;
  p.style = "padding-bottom: 0px;";
  fileType.prepend(p);

  fileType.classList.toggle("hide");
  // 그대로 class를 붙이면 transition이 적용되지 않아 시간 간격을 둠
  setTimeout(() => {
    fileType.classList.toggle("show");
  }, 2);

  // removeEventListener를 적용할 수 있게 하기 위해 새로운 변수에 함수를 할당함
  const detectTypeFunc = (event) => {
    // 인자로 자기자신을 보내줘서 다른 함수에서도 removeEventListener를 적용할 수 있게 함
    detectFileType(event, file, detectTypeFunc);
  };

  fileInput.removeEventListener("change", showFile);
  convertButton.addEventListener("click", detectTypeFunc);
}

function detectFileType(event, file, detectTypeFunc) {
  const fileTypeOption = document.getElementById("file-type-option");
  const option = fileTypeOption.value;
  // console.log(fileTypeOption.value);
  switch (option) {
    case "default": // 파일 종류
      alert("파일 종류를 선택해주세요");
      break;
    default: // 그 외 나머지
      // 한번 변환이 끝나면 더 이상 변환을 할 수 없도록 함
      // 나중에 없앨 수도 있는 기능
      convertButton.removeEventListener("click", detectTypeFunc);
      convertButton.classList.toggle("hover");
      convertFileToText(file, option);
  }
}

function convertFileToText(file, option) {
  const fileReader = new FileReader();
  const promise = new Promise((resolve, reject) => {
    if (option == "file") {
      fileReader.readAsArrayBuffer(file);
    } else {
      fileReader.readAsText(file);
    }

    fileReader.onload = () => resolve(fileReader.result);
  });

  promise
    .then((result) => {
      if (option == "file") {
        // 일반 파일
        return {
          text: convertFileToHex(result),
          option: option,
          spaceChar: null,
        };
      } else {
        // 텍스트 파일, 텍스트 파일(유니코드)
        // 줄 바꿈 문자를 \n으로 통일시킴
        const lineBreak = detectLineBreakChar(result);
        const regexp = new RegExp(lineBreak, "g");
        const text = result.replace(regexp, "\\n");

        if (option == "text") {
          // 텍스트 파일
          const spaceChar = detectAvailSpaceChar(text);
          const replacedText = text.replace(/ /g, spaceChar);
          return {
            text: replacedText,
            option: option,
            spaceChar: spaceChar,
          };
        } else if (option == "unicode") {
          // 텍스트 파일(유니코드)
          return {
            text: convert.textToUnicode(text),
            option: option,
            spaceChar: null,
          };
        }
      }
    })
    .then((textInfo) => {
      const fileText = addMetadataToText(textInfo, file.name);
      convertTextToPDF(fileText, file.name);
    });
}

// 줄 바꿈 문자가 어떤 os의 것인지 판단
function detectLineBreakChar(text) {
  const indexOfLF = text.indexOf("\n", 1);

  if (indexOfLF === -1) {
    if (text.indexOf("\r") !== -1) return "\r";
    return "\n";
  }

  if (text[indexOfLF - 1] === "\r") return "\r\n";
  return "\n";
}

function convertFileToHex(buffer) {
  const view = new Uint8Array(buffer);

  let hexText = "";
  for (let num in view) {
    hexText += convert.zeroToO(view[num].toString(16));
  }

  return hexText;
}

/*
현재 알고리즘이 만들어내는 공백 대체 문자는 각 아스키코드를 최대 한번 이용한다
아스키코드를 2번 이상 이용해야 될 문자열이 입력으로 들어올 가능성은 거의 없기 때문에
아래와 같은 방식을 이용했다
*/
function detectAvailSpaceChar(text) {
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

/* 
글자에 관한 정보 -> 추후 머신러닝의 결과에 따라 수정가능
현재는 파이썬에 만든 것과 최대한 흡사하게 만듦
char: 220, line: 173
가로 여백 : 0.45
세로 여백 : 1.1
*/

function convertTextToPDF(text, fileName) {
  convert.ttfToBase64().then((result) => {
    const pdf = new jsPDF("p", "pt", "a4");
    const fontDataURL = result;

    pdf.addFileToVFS("UbuntuMono-R.ttf", fontDataURL);
    pdf.addFont("UbuntuMono-R.ttf", "UbuntuMono-R", "normal");
    pdf.setFont("UbuntuMono-R");
    pdf.setFontSize(4); // hex에 대해서는 3pt로 적용되도록 수정
    pdf.setTextColor("0"); // 검은색

    // 나중에 파일 종류에 따라서 다양하게 수정할 수 있도록 바꾸기
    // 변수 이름도 수정 할 수도?
    const sizeInfo = {};

    sizeInfo.marginTop = convert.cmToPoint(2);
    sizeInfo.marginSide = convert.cmToPoint(1);
    sizeInfo.pageW = pdf.internal.pageSize.getWidth();
    sizeInfo.pageH = pdf.internal.pageSize.getHeight();
    sizeInfo.charW = pdf.getTextDimensions("A").w + 0.45;
    sizeInfo.charH = pdf.getTextDimensions("A").h * 1.1;

    let pos = {
      x: sizeInfo.marginSide,
      y: sizeInfo.marginTop,
    };

    let index = {
      page: 1,
      line: 1,
      char: 1,
    };

    for (const c of text) {
      // 새 페이지 추가
      if (pos.y > sizeInfo.pageH - sizeInfo.marginSide) {
        pdf.addPage();
        pos.x = sizeInfo.marginSide;
        pos.y = sizeInfo.marginTop;
        index.page += 1;
        index.line = 1;
      }

      pdf.setTextColor("0.5"); // guide는 회색으로 표시
      addGuideToPage(pdf, pos, index, sizeInfo);
      pdf.setTextColor("0");
      pdf.text(pos.x, pos.y, c);
      pos.x += sizeInfo.charW;
      index.char += 1;

      // 줄바꿈
      if (pos.x > sizeInfo.pageW - sizeInfo.marginSide) {
        pos.x = sizeInfo.marginSide;
        pos.y += sizeInfo.charH;
        pos.y = convert.roundDcmPlace(pos.y);
        index.line += 1;
        index.char = 1;
      }
    }

    const fileSuffix = "-changed";

    pdf.save(`${fileName}` + fileSuffix + ".pdf");
  });
}

function addGuideToPage(pdf, pos, index, sizeInfo) {
  // 페이지 가이드라인 추가
  if (index.line == 1 && index.char == 1) {
    const pageString = "page " + index.page;
    pdf.text(0, sizeInfo.charH, pageString);
  }
  // 가로 가이드라인 추가
  if (index.line == 1 && index.char % 10 == 0) {
    const charString = convert.fitNumToGuide(index.char, "h");
    pdf.text(pos.x, sizeInfo.charH, charString);
    pdf.text(pos.x, sizeInfo.pageH, charString);
  }
  // 세로 가이드라인 추가
  if (index.char == 1) {
    const lineString = convert.fitNumToGuide(index.line, "v");
    pdf.text(0, pos.y, lineString);
    pdf.text(sizeInfo.pageW - sizeInfo.charW * 3, pos.y, lineString);
  }
}
