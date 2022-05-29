window.jsPDF = window.jspdf.jsPDF;
// 특수문자의 경우 자동으로 \를 앞에 붙여줌
RegExp.escape = function (s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const main = document.querySelector("main");
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
        return convertFileToHex(result);
      } else {
        // 텍스트 파일, 텍스트 파일(유니코드)
        // 줄 바꿈 문자를 \n으로 통일시킴
        const lineBreak = detectLineBreakChar(result);
        const regexp = new RegExp(lineBreak, "g");
        const text = result.replace(regexp, "\\n");

        if (option == "text") {
          // 텍스트 파일
          return replaceSpace(text);
        } else if (option == "unicode") {
          // 텍스트 파일(유니코드)
          return convertTextToUnicode(text);
        }
      }
    })
    .then((fileText) => convertTextToPDF(fileText));
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
    hexText += convertZeroToO(view[num].toString(16));
  }

  return hexText;
}

function convertTextToUnicode(text) {
  let unicodeText = "";
  for (let i = 0; i < text.length; i++) {
    let unicodeChar = text.charCodeAt(i).toString(16);
    unicodeChar = convertZeroToO(unicodeChar);

    // 유니코드 문자의 길이를 4글자로 통일하기
    // 아래 if문에서 0 대신 대문자 O를 사용하는 것에 유의하기
    if (unicodeChar.length < 4) {
      let zeroLength = 4 - unicodeChar.length;
      unicodeChar = "O".repeat(zeroLength) + unicodeChar;
    }

    unicodeText += unicodeChar;
  }

  return unicodeText;
}

// 유니코드와 일반파일의 경우, 머신러닝 프로그램이 구분을 더 쉽게 할 수 있도록
// 숫자 0을 알파벳 대문자 O로 바꿔준다
function convertZeroToO(text) {
  return text.replace(/0/g, "O");
}

function replaceSpace(text) {
  let asciiInfoArr = makeAsciiInfoArray(text);

  // 글자들 중 빈도수가 작은 것부터 우선적으로 분류
  asciiInfoArr = sortAsciiInfoArray(asciiInfoArr);

  let spaceChar = detectAvailSpaceChar(asciiInfoArr);
  const replacedText = text.replace(/ /g, spaceChar);

  return replacedText;
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

function detectAvailSpaceChar(asciiInfoArr) {
  // 혼동이 가능한 글자의 리스트, 후에 추가 가능
  let charChecklist = RegExp.escape("'`,.~-08BOD5S$");

  for (let i = 0; i < asciiInfoArr.length; i++) {
    const asciiInfo = asciiInfoArr[i];
    const regexp = new RegExp(asciiInfo.regChar, "g");

    if (charChecklist.match(regexp)) {
      continue;
    }

    // 텍스트에 해당 글자가 없을 때
    if (asciiInfo.count == 0) {
      return asciiInfo.char;
    } else {
      // 해당 글자가 있을 때
      const nextAsciiInfo = asciiInfoArr[i + 1];
      const nextRegexp = new RegExp(nextAsciiInfo.regChar, "g");

      if (charChecklist.match(nextRegexp)) {
        continue;
      } else {
        // 그 다음으로 빈도수가 적은 글자와 합친 후 텍스트 안에 해당 글자가 있는지 테스트
        const tempSpaceChar = asciiInfo.regChar + nextAsciiInfo.regChar;
        const tempRegexp = new RegExp(tempSpaceChar, "g");

        if (!text.match(tempRegexp)) {
          return asciiInfo.char + nextAsciiInfo.char;
        } else {
          continue;
        }
      }
    }
  }
}

function convertTextToPDF(text) {
  ttf2base64().then((result) => {
    const pdf = new jsPDF("p", "pt", "a4");
    const fontDataURL = result;

    pdf.addFileToVFS("UbuntuMono-R.ttf", fontDataURL);
    pdf.addFont("UbuntuMono-R.ttf", "UbuntuMono-R", "normal");
    pdf.setFont("UbuntuMono-R");
    pdf.setFontSize(4); // hex에 대해서는 3pt로 적용되도록 수정
    pdf.setTextColor(1); // 검은색

    // 나중에 파일 종류에 따라서 다양하게 수정할 수 있도록 바꾸기
    const marginTop = cm2point(2);
    const marginSide = cm2point(1);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const charWidth = pdf.getTextDimensions("A").w + 0.5;
    const charHeight = pdf.getTextDimensions("A").h * 1.15;

    let pos = {
      x: marginSide,
      y: marginTop,
    };

    for (const c of text) {
      pdf.text(pos.x, pos.y, c);
      pos.x += charWidth;

      if (pos.y > pageHeight - marginSide) {
        pdf.addPage();
        pos.x = marginSide;
        pos.y = marginTop;
        continue;
      }

      if (pos.x > pageWidth - marginSide) {
        pos.x = marginSide;
        pos.y += charHeight;
        pos.y = roundDecimalPlace(pos.y);
      }
    }

    pdf.save("test.pdf");
  });
}

async function ttf2base64() {
  const response = await fetch("./UbuntuMono-R.ttf");
  const blob = await response.blob();
  const fileReader = new FileReader();
  const promise = new Promise((resolve, reject) => {
    fileReader.readAsDataURL(blob);
    fileReader.onload = () => resolve(fileReader.result);
  });
  const result = await promise;

  // jspdf는 앞부분에 메타 데이터가 없는 base64문자열을 읽어들이기 때문에
  // , 뒷부분을 없애줌
  return result.split(",")[1];
}

// cm 단위를 pdf에서 쓰이는 point로 바꿔줌
function cm2point(cm) {
  return cm * 28.346;
}

// 소수점 3자리까지만 정확히 숫자를 반환하도록 함
function roundDecimalPlace(float, place = 3) {
  return Math.round(float * Math.pow(10, place)) / Math.pow(10, place);
}
