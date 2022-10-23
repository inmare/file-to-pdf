import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Text from "../util/text.js";
import CharInfo from "./charInfo.js";

export default class Metadata {
  static getMetadata(doc, file, text) {
    this.addFileData(file);
    this.addCharInfoData(doc);
    this.addTextData(text);
  }

  static addFileData(file) {
    const fileData = pdfSetting.metadata.file;
    const sizeKb = Math.round(size / 10) / 100;

    fileData.name = file.name;
    fileData.size = `${sizeKb}kb`;
  }

  static addCharInfoData(doc) {
    const fontName = Setting.fontType.default;
    doc.setFont(fontName);

    const charInfo = CharInfo.getCharLengthInfo(doc);
    for (let [key, value] of charInfo.entries()) {
      pdfSetting.metadata.charInfo[key] = value;
    }
  }

  static addTextData(text) {
    const textData = pdfSetting.metadata.text;
    const fileName = pdfSetting.metadata.file.name;

    // 파일 이름 유니코드 및 길이 정보 추가
    const fileNameUnicode = Text.textToUnicode(fileName);
    const fileNameLen = fileNameUnicode.length;
    const fileNameLenMax = pdfSetting.metadataLength.fileNameLength;

    textData.fileNameUnicode = fileNameUnicode;
    textData.fileNameLength.value = fileNameLen;
    textData.fileNameLength.str = String(fileNameLen).padStart(
      fileNameLenMax,
      "0"
    );

    // 변환 종류 정보 추가
    const convertTypeTable = textData.convertTypeTable;
    const convertType = Setting.convertType.default;
    const convertTypeDec = convertTypeTable.indexOf(convertType);

    textData.convertTypeDec.value = convertTypeDec;
    textData.convertTypeDec.str = String(convertTypeDec);

    // 마지막 줄 글자 개수 정보 추가
    const lastLineLength = CharInfo.getLastLineLength(text);
  }
}
