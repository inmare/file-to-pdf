import cmToPoint from "../util/cmToPoint.js";

const pdfSetting = {
  dataLength: {
    convertTypeDec: 1,
    fileNameLength: 2,
    lastLineLength: 3,
  },
  file: {
    name: null,
    size: null,
  },
  text: {
    fileNameUnicode: null,
    convertTypeTable: ["Ascii", "Hex", "Unicode", "Base64"],
    convertTypeDec: {
      value: null,
      get str() {
        const valueStr = String(this.value);
        const maxLength = pdfSetting.dataLength.convertTypeDec;
        return valueStr.padStart(maxLength, "0");
      },
    },
    fileNameLength: {
      value: null,
      get str() {
        const valueStr = String(this.value);
        const maxLength = pdfSetting.dataLength.fileNameLength;
        return valueStr.padStart(maxLength, "0");
      },
    },
    lastLineLength: {
      value: null,
      get str() {
        const valueStr = String(this.value);
        const maxLength = pdfSetting.dataLength.lastLineLength;
        return valueStr.padStart(maxLength, "0");
      },
    },
  },
  charInfo: {
    charPerLine: null,
    linePerPage: null,
    textPerPage: null,
    // 후에 정보 추가하기
    charWidth: null,
    charHeight: null,
  },
  firstPage: {
    fontType: "Pretendard-Medium",
    fontSize: 13,
    margin: {
      value: 2.5,
      get pt() {
        return cmToPoint(this.value);
      },
    },
  },
};

export default pdfSetting;
