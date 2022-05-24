window.jsPDF = window.jspdf.jsPDF;

const fileInput = document.getElementById("file-input");
fileInput.addEventListener("change", showFile);

// 파일 업로드하기
function showFile(e) {
  return new Promise((resolve, reject) => {
    const fileList = e.target.files;
    const file = fileList[0];
    const fileReader = new FileReader();
    // 후에 텍스트로 읽기도 추가하기
    fileReader.readAsArrayBuffer(file);

    //   console.log(file.name);
    const buffer = fileReader.result;
    console.log(buffer);

    const view = new Uint8Array(buffer);

    let arrayHex = "";
    for (let num in view) {
      arrayHex = arrayHex + view[num].toString(16);
    }

    console.log(arrayHex);

    convertTextToPDF(arrayHex);
  });
}

function convertTextToPDF(arrayHex) {
  //ttf파일을 읽어서 base64 문자열 형태로 바꿔줌
  ttf2base64().then((blob) => {
    let fileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.onload = function (event) {
      let result = event.target.result;
      console.log(result);
    };
  });

  let doc = new jsPDF("p", "mm", "a4");
  doc.text(15, 40, arrayHex); // 글씨입력(시작x, 시작y, 내용)
  //   doc.save("web.pdf");
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
