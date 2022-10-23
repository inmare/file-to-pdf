const pdfSetting = {
  metadataLength: {
    convertTypeDec: 1,
    fileNameLength: 2,
    lastLineLength: 3,
  },
  metadata: {
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
          const valueStr = String(value);
          const maxLength = pdfSetting.metadataLength.convertTypeDec;
          return valueStr.padStart(maxLength, "0");
        },
      },
      fileNameLength: {
        value: null,
        get str() {
          const valueStr = String(value);
          const maxLength = pdfSetting.metadataLength.fileNameLength;
          return valueStr.padStart(maxLength, "0");
        },
      },
      lastLineLength: {
        value: null,
        get str() {
          const valueStr = String(value);
          const maxLength = pdfSetting.metadataLength.lastLineLength;
          return valueStr.padStart(maxLength, "0");
        },
      },
    },
    charInfo: {
      charPerLine: null,
      linePerPage: null,
      textPerPage: null,
    },
  },
  firstPage: {
    font: "Pretendard-Medium",
    fontSize: 12,
  },
};

export default pdfSetting;
