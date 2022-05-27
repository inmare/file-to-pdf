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

  fileInput.removeEventListener("change", showFile);
  convertButton.addEventListener("click", (event) =>
    detectFileType(event, file)
  );
  // convertTextToPDF(arrayHex);
}

function detectFileType(event, file) {
  //ttf파일을 읽어서 base64 문자열 형태로 바꿔줌
  // ttf2base64().then((blob) => {
  //   let fileReader = new FileReader();
  //   fileReader.readAsDataURL(blob);
  //   fileReader.onload = function (event) {
  //     let result = event.target.result;
  //     console.log(result);
  //   };
  // });
  // 후에 텍스트로 읽기도 추가하기
  const fileTypeOption = document.getElementById("file-type-option");
  const optionIdx = fileTypeOption.selectedIndex;

  let fileText = null;

  console.log(fileTypeOption.value);
  switch (optionIdx) {
    case 0: // 파일 종류
      return alert("파일 종류를 선택해주세요");
    default: // 그 외 나머지
      fileText = convertFileToText(file, optionIdx);
  }

  // let doc = new jsPDF("p", "mm", "a4");
  // doc.text(15, 40, arrayHex);
  //   doc.save("web.pdf");
}

function convertFileToText(file, optionIdx) {
  const fileReader = new FileReader();

  if (optionIdx == 3) {
    // 일반 파일
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = () => {
      const buffer = fileReader.result;
      const view = new Uint8Array(buffer);

      let arrayHex = "";
      for (let num in view) {
        arrayHex += view[num].toString(16);
      }

      console.log(arrayHex);
    };
  } else {
    // 텍스트 파일, 텍스트 파일(유니코드)
    fileReader.readAsText(file);
    fileReader.onload = () => {
      let text = fileReader.result;

      // 줄 바꿈 문자를 \n으로 통일시킴
      const lineBreak = detectLineBreakChar(text);
      const regexp = new RegExp(lineBreak, "g");
      text = text.replace(regexp, "\\n");

      if (optionIdx == 1) {
        // 텍스트 파일
        console.log(text);
        let replacedText = replaceSpace(text);
        console.log(replacedText);
      } else if (optionIdx == 2) {
        // 텍스트 파일(유니코드)
        let unicodeText = "";
        for (let i = 0; i < text.length; i++) {
          let unicodeChar = text.charCodeAt(i).toString(16);

          // 유니코드 문자의 길이를 4글자로 통일하기
          if (unicodeChar.length < 4) {
            let zeroLength = 4 - unicodeChar.length;
            unicodeChar = "0".repeat(zeroLength) + unicodeChar;
          }

          unicodeText += unicodeChar;
        }
        console.log(unicodeText);
      }
    };
  }
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

function replaceSpace(text) {
  let asciiInfoArr = makeAsciiInfoArray(text);

  // 글자들 중 빈도수가 작은 것부터 우선적으로 분류
  asciiInfoArr = sortAsciiInfoArray(asciiInfoArr);

  console.log(asciiInfoArr);

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
  // 혼동이 가능한 글자의 리스트
  // 후에 추가 가능
  let charChecklist = RegExp.escape("'`,.~-08BOD");

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
        // 그 다음으로 빈도수가 적은 글자와 합친 후
        // 텍스트 안에 해당 글자가 있는지 테스트
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

async function ttf2base64() {
  let response = await fetch("./UbuntuMono-R.ttf");
  let blob = await response.blob();

  return blob;

  // let fReader = new FileReader();
  // fReader.onload = function (event) {
  //   let result = event.target.result;
  //   // console.log(result);
  //   return result;
  // };

  // fReader.readAsDataURL(blob);
}
