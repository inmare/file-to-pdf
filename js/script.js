import { fileToText } from "./file-parsing.js";
import { seedRandom } from "./random-generation.js";
import { textToPDF } from "./pdf-conversion.js";
import { zeroToO } from "./type-conversion.js";

// 페이지 수에 옵션 더해주기 (10페이지까지)
const defaultPages = document.getElementById("random-pages");
for (let i = 0; i < 10; i++) {
  const option = document.createElement("option");
  option.innerHTML = String(i + 1);
  option.value = String(i + 1);
  defaultPages.append(option);
}

const fileInput = document.getElementById("file-input");
const convertButton = document.getElementById("convert-button");
fileInput.addEventListener("change", showFile);

const settingButton = document.getElementById("setting-button");
const setting = document.querySelector(".setting");
settingButton.addEventListener("click", () => {
  setting.classList.toggle("hide");
  setTimeout(() => {
    setting.classList.toggle("show");
  }, 2);
});

const randomButton = document.getElementById("random-generate");
randomButton.addEventListener("click", makeRandomText);

// 파일 업로드하기
function showFile(event) {
  const fileList = event.target.files;
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
  const detectTypeFunc = (e) => {
    // 인자로 자기자신을 보내줘서 다른 함수에서도 removeEventListener를 적용할 수 있게 함
    detectFileType(e, file, detectTypeFunc);
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
      fileToText(file, option);
  }
}

function makeRandomText() {
  randomButton.removeEventListener("click", makeRandomText);
  randomButton.classList.toggle("hover");

  const randomTextType = document.getElementById("random-text-type");
  const randomPages = document.getElementById("random-pages");
  const randomSeed = document.getElementById("random-seed");
  let textType = null;
  let pages = null;
  let seed = null;

  if (
    randomTextType.value == "default" ||
    randomPages.vaue == "default" ||
    randomSeed.value == ""
  ) {
    return alert("모든 설정을 제대로 입력해주세요.");
  } else {
    if (!Number(randomSeed.value)) {
      return alert("시드에는 0이 아닌 숫자만 입력할 수 있습니다.");
    } else {
      textType = randomTextType.value;
      pages = Number(randomPages.value);
      seed = Number(randomSeed.value);
    }
  }

  const random = new seedRandom(seed);
  // hex 값이기 때문에 0을 O으로 바꿔줌
  const hexString = zeroToO("0123456789abcdef");
  const randomArray = [];

  // 조금 더 랜덤한 값을 넣어주기 위해 랜덤함수를 한 번 실행시켜 줌
  random.random();

  if (textType == "ascii") {
    for (let i = 0x21; i < 0x7f; i++) {
      const ascii = String.fromCharCode(i);
      randomArray.push(ascii);
    }
  } else if (textType == "hex") {
    for (let i = 0; i < 16; i++) {
      const hex = hexString[i];
      randomArray.push(hex);
    }
  }

  // 페이지 값을 하드코딩 해 둠
  // 다른 함수에서도 쓰이는 값이기 때문에 json파일 같은 곳에 저장해야 할 듯
  const textLength = 220 * 173 * pages;
  let randomText = "";

  for (let i = 0; i < textLength; i++) {
    randomText += random.choice(randomArray);
  }

  const fileName = `random-${textType}`;
  textToPDF(randomText, fileName);
}
