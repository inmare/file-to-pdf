import Setting from "../setting/setting.js";
import Text from "../util/text.js";
import Unit from "./unit.js";

export default class PDF {
  static async createPDF(text, metadata) {
    const doc = new jsPDF("p", "pt", "a4");
    await PDF.setFontSetting(doc);
    const charInfo = this.getCharLengthInfo(doc);
    const textWithData = this.comebineTextAndData(text, metadata, charInfo);
    const makeFirstPageGuide = Setting.firstPageGuide.default;
    if (makeFirstPageGuide) {
      this.createFirstPageGuide(doc, metadata, charInfo);
    }
  }

  static async createRandomTextPDF() {
    // 랜덤한 텍스트로 구성된 pdf만들기
  }

  static createFirstPageGuide(doc, metadata, charInfo) {
    doc.addPage()
  }

  static async setFontSetting(doc) {
    const font = Setting.fontType.default;
    const fontDatURL = await this.getFontDataURL(font);
    const fontSize = Setting.fontSize.default;

    doc.addFileToVFS(`${font}.ttf`, fontDatURL);
    doc.addFont(`${font}.ttf`, font, "normal");
    doc.setFont(font);
    doc.setFontSize(fontSize);
    doc.setTextColor("0");
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

  static getCharLengthInfo(doc) {
    const contextSize = this.getContextSize(doc);

    const kerning = Setting.kerning.default;
    const lineHeight = Setting.lineHeight.default;

    const charSize = doc.getTextDimensions("A");
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

  static getContextSize(doc) {
    const mTop = Unit.cmToPoint(Setting.mTop.default);
    const mRight = Unit.cmToPoint(Setting.mRight.default);
    const mBottom = Unit.cmToPoint(Setting.mBottom.default);
    const mLeft = Unit.cmToPoint(Setting.mLeft.default);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

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
    const dummyTextLength = this.getDummyTextLength(text, metadata, charInfo);

    let metadataText =
      metadata.convertType +
      metadata.nameLengthHex +
      dummyTextLength.toString(16).padStart(2, "0") +
      metadata.fileNameUnicode;

    metadataText = Text.replaceCharTable(metadataText);

    const lastChar = text.slice(-1);
    const combinedText = metadataText + text + lastChar.repeat(dummyTextLength);

    return combinedText;
  }

  static getDummyTextLength(text, metadata, charInfo) {
    const wholeTextLength = 5 + metadata.fileNameUnicode.length + text.length;

    const lastLineCharLength = wholeTextLength % charInfo.charPerLine;
    const dummyTextLength = charInfo.charPerLine - lastLineCharLength;

    return dummyTextLength;
  }
}
