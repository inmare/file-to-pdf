import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Text from "../util/text.js";
import CharInfo from "./charInfo.js";

export default class Metadata {
  static setMetadata(doc, text, file, isRandomText) {
    this.addCharInfoData(doc);
    if (!isRandomText) {
      this.addFileData(file);
      this.addTextData(text);
    }
  }

  static comebineTextAndData(text) {
    const textData = pdfSetting.text;
    const charInfo = pdfSetting.charInfo;

    let metadataText =
      textData.convertTypeDec.str +
      textData.fileNameLength.str +
      textData.lastLineLength.str +
      textData.fileNameUnicode;

    metadataText = Text.replaceCharTable(metadataText);

    // 줄 길이에 맞게 마지막 글자를 반복해주기
    const lastChar = text.slice(-1);
    const dummyTextLength =
      charInfo.charPerLine - textData.lastLineLength.value;
    const combinedText = metadataText + text + lastChar.repeat(dummyTextLength);

    return combinedText;
  }

  static addCharInfoData(doc) {
    const font = Setting.fontType.default;
    const fontSize = Setting.fontSize.default;
    const charInfo = CharInfo.getCharLengthInfo(doc, font, fontSize);

    for (let [key, value] of Object.entries(charInfo)) {
      pdfSetting.charInfo[key] = value;
    }
  }

  static addFileData(file) {
    const fileData = pdfSetting.file;
    const sizeKb = Math.round(file.size / 10) / 100;

    fileData.name = file.name;
    fileData.size = `${sizeKb}kb`;
  }

  static addTextData(text) {
    const textData = pdfSetting.text;
    const fileName = pdfSetting.file.name;

    // 파일 이름 유니코드 및 길이 정보 추가
    const fileNameUnicode = Text.textToUnicode(fileName);
    const fileNameLen = fileNameUnicode.length;

    textData.fileNameUnicode = fileNameUnicode;
    textData.fileNameLength.value = fileNameLen;

    // 변환 종류 정보 추가
    const convertTypeTable = textData.convertTypeTable;
    const convertType = Setting.convertType.default;
    const convertTypeDec = convertTypeTable.indexOf(convertType);

    textData.convertTypeDec.value = convertTypeDec;

    // 마지막 줄 글자 개수 정보 추가
    const lastLineLength = CharInfo.getLastLineLength(text);
    textData.lastLineLength.value = lastLineLength;
  }
}
