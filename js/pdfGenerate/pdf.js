import Setting from "../setting/setting.js";
import Text from "../util/text.js";
import Unit from "./unit.js";

export default class PDF {
  static async createPDF(text, metadata) {
    this.doc = new jsPDF("p", "pt", "a4");
    await PDF.setFontSetting();
    const charInfo = this.getCharLengthInfo();
    const textWithData = this.comebineTextAndData(text, metadata, charInfo);
    
  }

  static async setFontSetting() {
    const font = Setting.fontType.default;
    const fontDatURL = await this.getFontDataURL(font);
    const fontSize = Setting.fontSize.default;

    this.doc.addFileToVFS(`${font}.ttf`, fontDatURL);
    this.doc.addFont(`${font}.ttf`, font, "normal");
    this.doc.setFont(font);
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor("0");
  }

  static async getFontDataURL(font) {
    const response = await fetch(`./fonts/${font}.ttf`);
    const blob = await response.blob();
    const fileReader = new FileReader();
    const promise = new Promise((resolve, _) => {
      fileReader.readAsDataURL(blob);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
    });
    const dataURL = await promise;
    const rawDataURL = Text.removeMimeFromDataURL(dataURL);

    return rawDataURL;
  }

  static getCharLengthInfo() {
    const contextSize = this.getContextSize();

    const kerning = Setting.kerning.default;
    const lineHeight = Setting.lineHeight.default;

    const charSize = this.doc.getTextDimensions("A");
    const charWidth = charSize.w + kerning;
    const charHeight = charSize.h * lineHeight;

    const charPerLine = Math.ceil(contextSize.width / charWidth);
    const linePerPage = Math.ceil(contextSize.height / charHeight);
    const charInfo = {
      charPerLine: charPerLine,
      linePerPage: linePerPage,
      textPerPage: charPerLine * linePerPage,
    };

    return charInfo;
  }

  static getContextSize() {
    const mTop = Unit.cmToPoint(Setting.mTop.default);
    const mRight = Unit.cmToPoint(Setting.mRight.default);
    const mBottom = Unit.cmToPoint(Setting.mBottom.default);
    const mLeft = Unit.cmToPoint(Setting.mLeft.default);
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();

    const contextWidth = pageWidth - mRight - mLeft;
    const contextHeight = pageHeight - mTop - mBottom;
    const contextInfo = {
      width: contextWidth,
      height: contextHeight,
    };

    return contextInfo;
  }

  static comebineTextAndData(text, metadata, charInfo) {
    // 메타 데이터 형식 : ABBCC
    // 텍스트 길이 + 메타 데이터 길이(5자로 고정)
    const wholeTextLength = 5 + metadata.fileNameUnicode.length + text.length;

    const lastLineCharLength = wholeTextLength % charInfo.charPerLine;
    const dummyTextLength = charInfo.charPerLine - lastLineCharLength;
    let metadataText =
      metadata.convertType +
      metadata.nameLengthHex +
      dummyTextLength.toString(16).padStart(2, "0") +
      metadata.fileNameUnicode;

    metadataText = Text.replaceCharTable(metadataText);

    const lastChar = text[-1];
    const combinedText = metadataText + text + lastChar.repeat(dummyTextLength);

    return combinedText;
  }
}
