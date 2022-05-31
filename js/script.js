import { fileToText } from "./file-parsing.js";

window.jsPDF = window.jspdf.jsPDF;

const fileInput = document.getElementById("file-input");
const convertButton = document.getElementById("convert-button");
fileInput.addEventListener("change", showFile);

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
