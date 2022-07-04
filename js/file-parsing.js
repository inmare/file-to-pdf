import * as convert from "./type-conversion.js";
import {
  getLineBreakChar,
  getAvailSpaceChar,
  addMetadataToText,
} from "./text-parsing.js";

import { textToPDF } from "./pdf-conversion.js";

async function fileToText(file, option) {
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
          text: fileToHex(result),
          option: option,
          spaceChar: null,
        };
      } else {
        // 텍스트 파일, 텍스트 파일(유니코드)
        // 줄 바꿈 문자를 \n으로 통일시킴
        const lineBreak = getLineBreakChar(result);
        const regexp = new RegExp(lineBreak, "g");
        const text = result.replace(regexp, "\\n");

        if (option == "text") {
          // 텍스트 파일
          const spaceChar = getAvailSpaceChar(text);
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
      // 랜덤한 텍스트가 아니라는 의미로 마지막 인수에 false를 넣음
      textToPDF(fileText, file.name, false);
    });
}

function fileToHex(buffer) {
  const view = new Uint8Array(buffer);

  let hexText = "";
  for (let num of view) {
    let convertedNum = convert.zeroToO(num.toString(16));
    convertedNum = num < 16 ? "O" + convertedNum : convertedNum;
    hexText += convertedNum;
  }

  return hexText;
}

export { fileToText };
