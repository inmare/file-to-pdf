import Setting from "../setting/setting.js";
import Util from "../ui/util.js";
import UI from "../ui/ui.js";
import $ from "../global.js";

export default class Preprocess {
  static initialize() {
    const fileInput = $("#input-btn");
    fileInput.addEventListener("change", this.getFileInfo);
  }

  static getFileInfo(e) {
    const input = e.target;
    const file = input.files[0];
    const name = file.name;
    const size = file.size;

    // 파일의 크기가 너무 클 경우 업로드 불가
    const maxSize = 3000;
    if (size / 1000 > maxSize) {
      return alert(`${maxSize}kb 이상의 파일은 업로드 할 수 없습니다!`);
    }

    const sizeKb = Math.round(size / 10) / 100;
    UI.displayFileInfo(name, sizeKb);
  }

  static changeSetting() {
    const inputType = ["select", "text", "checkbox", "table"];
    for (let type of inputType) {
      switch (type) {
        case "select":
          getSelectSetting();
          break;
        case "text":
          getTextSetting();
          break;
        case "checkbox":
          getCheckboxSetting();
          break;
        case "table":
          getTableSetting();
          break;
        default:
          break;
      }
    }

    function getSelectSetting() {
      const selectElem = $("#setting-section select");
      for (let elem of selectElem) {
        const keyName = _dashToCamelCase(elem.id);
        Setting[keyName].default = elem.value;
      }
    }

    function getTextSetting() {
      const textElem = $("#setting-section input[type='text']");
      for (let elem of textElem) {
        if (elem.id == "char-from" || elem.id == "char-to") {
          continue;
        }
        const value = elem.value;
        const isValid = _checkTextValue(value);
        if (isValid) {
          const keyName = _dashToCamelCase(elem.id);
          Setting[keyName].default = parseFloat(value);
        }
      }
    }

    function getCheckboxSetting() {
      const checkboxElem = $("#setting-section input[type='checkbox']");
      for (let elem of checkboxElem) {
        const checked = elem.checked;
        const keyName = _dashToCamelCase(elem.id);
        Setting[keyName].default = checked;
      }
    }

    function getTableSetting() {
      const fromTd = Util.getAllTd(1);
      const toTd = Util.getAllTd(2);
      let fromArray = [];
      let toArray = [];

      for (let [idx, td] of fromTd.entries()) {
        if (idx != 0) {
          fromArray.push(td.innerText);
        }
      }

      for (let [idx, td] of toTd.entries()) {
        if (idx != 0) {
          toArray.push(td.innerText);
        }
      }

      Setting.charTable.from = fromArray;
      Setting.charTable.to = toArray;
    }

    function _dashToCamelCase(text) {
      const regex = /-./g;
      const camelCase = text.replace(regex, (match) => {
        return match.slice(1).toUpperCase();
      });
      return camelCase;
    }

    function _checkTextValue(value) {
      if (value === "") {
        return false;
      } else {
        const isNum = _checkTextIsNumber(value);
        return isNum;
      }
    }

    function _checkTextIsNumber(text) {
      const intRegex = /^\d*$/;
      const floatRegex = /^\d+\.\d+$/;
      const intMatch = text.match(intRegex);
      const floatMatch = text.match(floatRegex);

      if (intMatch || floatMatch) {
        return true;
      } else {
        return false;
      }
    }
  }
}
