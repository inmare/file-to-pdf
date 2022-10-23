import $ from "../util/global.js";

export default class Table {
  static getAllTd(trIdx) {
    return $(`#char-table tr:nth-child(${trIdx}) > td`);
  }

  static getTargetTd(trIdx, tdIdx) {
    return $(`#char-table tr:nth-child(${trIdx}) > td:nth-child(${tdIdx})`);
  }

  static appendCharToTable(fromChar, toChar, font) {
    const fromTr = $("#char-table tr:nth-child(1)");
    const toTr = $("#char-table tr:nth-child(2)");
    const delTr = $("#char-table tr:nth-child(3)");

    const fromTd = document.createElement("td");
    fromTd.innerText = fromChar;
    fromTd.style.fontFamily = `${font}, "Adobe Blank"`;
    fromTr.append(fromTd);
    const toTd = document.createElement("td");
    toTd.innerText = toChar;
    toTd.style.fontFamily = `${font}, "Adobe Blank"`;
    toTr.append(toTd);
    const delTd = document.createElement("td");
    const delBtn = document.createElement("i");
    delBtn.classList.add("fa-solid", "fa-xmark");
    delTd.append(delBtn);
    delTr.append(delTd);

    return [fromTd, toTd, delTd];
  }
}
