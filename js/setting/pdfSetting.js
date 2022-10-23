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
        str: null,
      },
      fileNameLength: {
        value: null,
        str: null,
      },
      lastLineLength: {
        value: null,
        str: null,
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
