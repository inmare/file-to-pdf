import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Unit from "./unit.js";

export default class CharInfo {
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

  static getLastLineLength(text) {
    // 메타 데이터 형식 : ABBCCC
    const metadataLen = 0;
    for (let [_, value] of pdfSetting.metadataLength) {
      metadataLen += value;
    }

    const textData = pdfSetting.metadata.text;
    const charInfo = pdfSetting.metadata.charInfo;

    const wholeTextLength =
      metadataLen + textData.fileNameLength.value + text.length;

    const lastLineTextLength = wholeTextLength % charInfo.charPerLine;

    return lastLineTextLength;
  }
}