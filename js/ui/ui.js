import Initialize from "./initialize.js";

function addChar(e) {}

function removeChar(e) {
  const charTd = getAllTd(3);

  const idx = Array.from(charTd).indexOf(e.target.parentElement) + 1;
  console.log(idx);

  const targetFromTd = getTargetTd(1, idx);
  console.log(targetFromTd);
  const targetToTd = getTargetTd(2, idx);

  targetFromTd.remove();
  targetToTd.remove();
  e.target.parentElement.remove();

  function getAllTd(trIdx) {
    return document.querySelectorAll(`#char-table tr:nth-child(${trIdx}) > td`);
  }

  function getTargetTd(trIdx, tdIdx) {
    return document.querySelector(
      `#char-table tr:nth-child(${trIdx}) > td:nth-child(${tdIdx})`
    );
  }
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
    const addCharBtn = document.querySelector("#add-char");
    addCharBtn.addEventListener("click", addChar);

    const charTd = document.querySelectorAll(
      "#char-table tr:nth-child(3) > td i"
    );

    for (let td of charTd) {
      td.addEventListener("click", removeChar);
    }
  }
}
