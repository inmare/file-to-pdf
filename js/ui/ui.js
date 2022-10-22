import Initialize from "./initialize.js";
import Table from "./table.js";
import $ from "../global.js";

function removeChar(e) {
  const delTd = e.target.parentElement;
  const charTd = Table.getAllTd(3);

  const idx = Array.from(charTd).indexOf(delTd) + 1;

  const targetFromTd = Table.getTargetTd(1, idx);
  const targetToTd = Table.getTargetTd(2, idx);

  targetFromTd.remove();
  targetToTd.remove();
  delTd.remove();
}

function addChar() {
  const fromText = $("#char-from").value;
  const toText = $("#char-to").value;

  if (fromText === "" || toText === "") {
    return alert("글자를 입력해주세요.");
  }

  const fromTd = Table.getAllTd(1);
  const toTd = Table.getAllTd(2);

  let charList = "";

  for (let [idx, td] of fromTd.entries()) {
    if (idx != 0) {
      charList += td.innerText;
    }
  }

  for (let [idx, td] of toTd.entries()) {
    if (idx != 0) {
      charList += td.innerText;
    }
  }

  if (charList.includes(fromText) || charList.includes(toText)) {
    return alert(
      "이미 표에 포함된 글자입니다.\n표의 글자를 삭제하거나 다른 글자를 넣어주세요."
    );
  } else {
    const font = $("#font-type").value;
    const [_fromTd, _toTd, delTd] = Table.appendCharToTable(
      fromText,
      toText,
      font
    );
    const delBtn = delTd.querySelector("i");
    delBtn.addEventListener("click", removeChar);
  }
}

function changeTableFont(e) {
  const font = e.target.value;
  const fromTd = Table.getAllTd(1);
  const toTd = Table.getAllTd(2);
  for (let [idx, td] of fromTd.entries()) {
    if (idx != 0) {
      td.style.fontFamily = `'${font}', 'Adobe Blank`;
    }
  }
  for (let [idx, td] of toTd.entries()) {
    if (idx != 0) {
      td.style.fontFamily = `'${font}', 'Adobe Blank'`;
    }
  }
}

function setMode(e) {
  const mode = $("#current-mode");
  if (e.target.checked) {
    mode.innerText = "랜덤한 글자 생성 (업로드 된 파일은 무시됩니다.)";
  } else {
    mode.innerText = "파일 변환";
  }
}

export default class UI {
  static initialize() {
    Initialize.setting().then((_) => {
      this.initListener();
    });

    this.addScrollToTopBtn();
  }

  static initListener() {
    const addCharBtn = $("#add-char");
    addCharBtn.addEventListener("click", addChar);

    const charTd = $("#char-table tr:nth-child(3) > td i");
    for (let td of charTd) {
      td.addEventListener("click", removeChar);
    }

    const fontSelect = $("#font-type");
    fontSelect.addEventListener("change", changeTableFont);

    const randomTextBtn = $("#make-random-text");
    const event = new Event("change");
    randomTextBtn.addEventListener("change", setMode);
    randomTextBtn.dispatchEvent(event);
  }

  static addScrollToTopBtn() {
    const app = $("#app");
    const btn = document.createElement("div");
    btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    btn.id = "scroll-to-top";
    btn.classList.add("flex-row", "center-h", "center-v");
    app.append(btn);

    btn.addEventListener("click", () => {
      window.scrollTo(0, 0);
    });
  }

  static displayFileInfo(name, size) {
    const fileInfo = $("#file-info");
    let clippedFileName;

    const extRegex = /\..*$/;
    const match = name.match(extRegex);
    let clippedName = name.slice(0, match.index);
    clippedName =
      clippedName.length > 20
        ? clippedName.slice(0, 20) + "\u2026"
        : clippedName;
    const extension = name.slice(match.index);
    clippedFileName = clippedName + extension;

    fileInfo.innerText = `${clippedFileName} (${size}kb)`;
  }
}
