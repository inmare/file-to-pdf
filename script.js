window.jsPDF = window.jspdf.jsPDF;

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
    convertFileToPDF(event, file)
  );
  // convertTextToPDF(arrayHex);
}

function convertFileToPDF(event, file) {
  //ttf파일을 읽어서 base64 문자열 형태로 바꿔줌
  // ttf2base64().then((blob) => {
  //   let fileReader = new FileReader();
  //   fileReader.readAsDataURL(blob);
  //   fileReader.onload = function (event) {
  //     let result = event.target.result;
  //     console.log(result);
  //   };
  // });
  const fileReader = new FileReader();
  // 후에 텍스트로 읽기도 추가하기
  const fileTypeOption = document.getElementById("file-type-option");
  const optionIdx = fileTypeOption.selectedIndex;

  switch (optionIdx) {
    case 0: // 파일 종류
      return console.log("파일 종류를 선택해주세요");
    case 1: // 텍스트 파일
      console.log(fileTypeOption.value);
    case 2: // 텍스트 파일(유니코드)
      console.log(fileTypeOption.value);
    case 3: // 일반 파일
      console.log(fileTypeOption.value);
  }

  fileReader.readAsArrayBuffer(file);

  fileReader.onload = () => {
    const buffer = fileReader.result;
    console.log(buffer);

    const view = new Uint8Array(buffer);

    let arrayHex = "";
    for (let num in view) {
      arrayHex = arrayHex + view[num].toString(16);
    }

    console.log(arrayHex);
  };

  // let doc = new jsPDF("p", "mm", "a4");
  // doc.text(15, 40, arrayHex);
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
