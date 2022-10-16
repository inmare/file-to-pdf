import Setting from "../setting/setting.js";

function initializeSetting() {
  for (let [_, value] of Object.entries(Setting)) {
    const elem = document.getElementById(value.id);
    const elemType = value.type;
    switch (elemType) {
      case "select":
        fillSelect(elem, value);
        break;
      case "text":
        fillText(elem, value);
        break;
      case "checkbox":
        fillCheckbox(elem, value);
        break;
      case "table":
        createTable(elem, value);
        break;
      default:
        break;
    }
  }
}

function fillSelect(select, setting) {
  const optionArray = setting.value;
  for (let value of optionArray) {
    const option = document.createElement("option");
    option.value = value;
    option.innerText = value;
    if (value == setting.default) {
      option.selected = true;
    }
    select.append(option);
  }
}

function fillText(text, setting) {
  text.placeholder = setting.default;
}

function fillCheckbox(checkbox, setting) {
  checkbox.checked = setting.default;
}

function createTable(table, setting) {
  const fromTr = document.createElement("tr");
  const fromTd = document.createElement("td");
  fromTd.innerText = "From";
  table.append(fromTr);
  fromTr.append(fromTd);
  const toTr = document.createElement("tr");
  const toTd = document.createElement("td");
  toTd.innerText = "To";
  table.append(toTr);
  toTr.append(toTd);
  const delTr = document.createElement("tr");
  const delTd = document.createElement("td");
  table.append(delTr);
  delTr.append(delTd);

  for (let i = 0; i < setting.from.length; i++) {
    const fromTd = document.createElement("td");
    fromTd.innerText = setting.from[i];
    // fromTd.addEventListener("click", copyText);
    fromTr.append(fromTd);
    const toTd = document.createElement("td");

    toTd.innerText = setting.to[i];
    toTr.append(toTd);
    const delTd = document.createElement("td");
    delTd.classList.add("delete-char");
    delTd.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    delTr.append(delTd);
  }
}

export default class Initialize {
  static setting() {
    return new Promise((resolve, reject) => {
      try {
        resolve(initializeSetting());
      } catch (error) {
        reject(error);
      }
    });
  }
}