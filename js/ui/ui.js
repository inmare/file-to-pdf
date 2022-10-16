import Initialize from "./initialize.js";
import $ from "../global.js";

function addChar() {
  const fromText = $("#char-from").value;
  const toText = $("#char-to").value;

  if (fromText === "" || toText === "") {
    return alert("글자를 입력해주세요.");
  }

  const fromTd = _getAllTd(1);
  const toTd = _getAllTd(2);

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
    const fromTd = document.createElement("td");
    const toTd = document.createElement("td");
    const delTd = document.createElement("td");
    const delBtn = document.createElement("i");
    fromTd.innerText = fromText;
    toTd.innerText = toText;
    delTd.append(delBtn);
    delBtn.classList.add("fa-solid", "fa-xmark");
    delBtn.addEventListener("click", removeChar);

    const fromTr = $("#char-table tr:nth-child(1)");
    const toTr = $("#char-table tr:nth-child(2)");
    const delTr = $("#char-table tr:nth-child(3)");
    fromTr.append(fromTd);
    toTr.append(toTd);
    delTr.append(delTd);
  }
}

function removeChar(e) {
  const delTd = e.target.parentElement;
  const charTd = _getAllTd(3);

  const idx = Array.from(charTd).indexOf(delTd) + 1;

  const targetFromTd = _getTargetTd(1, idx);
  const targetToTd = _getTargetTd(2, idx);

  targetFromTd.remove();
  targetToTd.remove();
  delTd.remove();
}

function _getAllTd(trIdx) {
  return $(`#char-table tr:nth-child(${trIdx}) > td`);
}

function _getTargetTd(trIdx, tdIdx) {
  return $(`#char-table tr:nth-child(${trIdx}) > td:nth-child(${tdIdx})`);
}

export default class UI {
  static initialize() {
    Initialize.setting().then(
      (_) => {
        this.addListener();
      },
      (error) => {
        console.log(`${error.name}: ${error.message}`);
      }
    );
    // addEventListener to elemetns
  }

  static addListener() {
    const addCharBtn = $("#add-char");
    addCharBtn.addEventListener("click", addChar);

    const charTd = $("#char-table tr:nth-child(3) > td i");

    for (let td of charTd) {
      td.addEventListener("click", removeChar);
    }
  }
}
