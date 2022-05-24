window.jsPDF = window.jspdf.jsPDF;

const fileInput = document.getElementById("file-input");
fileInput.addEventListener("change", showFile);

function showFile(e) {
  const fileList = e.target.files;
  const file = fileList[0];

  console.log(file.name);

  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);

  fileReader.onload = function () {
    const buffer = fileReader.result;
    console.log(buffer);

    const view = new Uint8Array(buffer);

    let arrayHex = "";
    for (let num in view) {
      arrayHex = arrayHex + view[num].toString(16);
    }

    console.log(arrayHex);

    convertTextToPDF(arrayHex);
  };
}

function convertTextToPDF(arrayHex) {
  let doc = new jsPDF("p", "mm", "a4");
  doc.text(15, 40, arrayHex); // 글씨입력(시작x, 시작y, 내용)
  doc.save("web.pdf"); //결과 출력
}

async function ttf2base64() {
  let response = await fetch("./UbuntuMono-R.ttf");
  let blob = await response.blob();

  console.log(blob);

  return blob;

  // let fReader = new FileReader();
  // fReader.onload = function (event) {
  //   let result = event.target.result;
  //   // console.log(result);
  //   return result;
  // };

  // fReader.readAsDataURL(blob);
}

ttf2base64().then((blob) => {
  let fileReader = new FileReader();
  fileReader.onload = function (event) {
    let result = event.target.result;
    // console.log(result);
  };
  fileReader.readAsDataURL(blob);
});
