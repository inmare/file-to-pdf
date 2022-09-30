function textToUnicode(text) {
  let unicodeText = "";
  for (let i = 0; i < text.length; i++) {
    let unicodeChar = text.charCodeAt(i).toString(16);
    unicodeChar = zeroToO(unicodeChar);

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

function dcmToHex(num, hexLength, option) {
  let hexNum = num.toString(16);
  if (hexNum.length < hexLength) {
    hexNum = "0".repeat(hexLength - hexNum.length) + hexNum;
    if (option != "text") {
      hexNum = zeroToO(hexNum); // 일반 파일, 유니코드의 경우 0을 대문자 O로 변환
    }
  }

  return hexNum;
}

// 유니코드와 일반파일의 경우, 머신러닝 프로그램이 구분을 더 쉽게 할 수 있도록
// 숫자 0을 알파벳 대문자 O로 바꿔준다
function zeroToO(text) {
  return text.replace(/0/g, "O");
}

// 소수점 n자리까지만 정확히 숫자를 반환하도록 함
// 기본은 3자리로 설정됨
function roundDcmPlace(float, place = 3) {
  return Math.round(float * Math.pow(10, place)) / Math.pow(10, place);
}

async function ttfToBase64(fontName) {
  const response = await fetch(`./fonts/${fontName}.ttf`);
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
function cmToPoint(cm) {
  return cm * 28.346;
}

function fitNumToGuide(num) {
  // 숫자에서 10의 자리만 추출함
  return num < 100
    ? parseInt(num / 10).toString()
    : parseInt((num % 100) / 10).toString();
}

export {
  textToUnicode,
  dcmToHex,
  zeroToO,
  roundDcmPlace,
  ttfToBase64,
  cmToPoint,
  fitNumToGuide,
};
