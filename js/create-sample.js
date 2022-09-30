import { seedRandom } from "./random-generation.js";
import { cmToPoint, ttfToBase64 } from "./type-conversion.js";

const createSampleBtn = document.querySelector("#create-sample");
createSampleBtn.onclick = createSample;

async function createSample() {
  // 랜덤한 텍스트 생성
  let asciiArray = [];

  for (let i = 0x21; i < 0x7f; i++) {
    const ascii = String.fromCharCode(i);
    asciiArray.push(ascii);
  }

  const random = new seedRandom(1);
  random.random();

  const hLen = 20;
  const vLen = 10;

  let randomText = "";

  for (let i = 0; i < hLen * vLen; i++) {
    const char = random.choice(asciiArray);
    randomText += char;

    if ((i + 1) % hLen == 0 && i != 0) {
      randomText += "\n";
    }
  }

  // pdf생성
  const fontName = "UbuntuMono-Bold";
  const fontDataURL = await ttfToBase64(fontName);
  const pdf = new jsPDF("p", "pt", "a4");
  pdf.addFileToVFS(`${fontName}.ttf`, fontDataURL);
  pdf.addFont(`${fontName}.ttf`, fontName, "normal");
  pdf.setFont(fontName);
  pdf.setFontSize(3.8); // hex에 대해서는 3pt로 적용되도록 수정
  pdf.setTextColor("0"); // 검은색

  const charH = pdf.getTextDimensions("A").h * 1.2;

  let topMargin = cmToPoint(1.8);
  let sideMargin = cmToPoint(1);
  let options = {
    charSpace: 0.45,
    lineHeightFactor: 1.2,
  };
  console.log(sideMargin, topMargin);
  pdf.text(sideMargin, topMargin, randomText, options);
  // 텍스트 회전
  options.angle = 10;
  topMargin = topMargin + charH * 10 + 20;
  console.log(sideMargin, topMargin);
  pdf.text(sideMargin, topMargin, randomText, options);
  pdf.output("save");
}

export default createSample;
