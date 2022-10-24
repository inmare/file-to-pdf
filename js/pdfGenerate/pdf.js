import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Metadata from "./metadata.js";
import Font from "./font.js";

export default class PDF {
  static async createPDF(text, file) {
    const doc = new jsPDF("p", "pt", "a4");
    // 메인 텍스트용 폰트 추가
    await Font.addFont(doc, Setting.fontType.default);
    // 메인 텍스트용 메타 데이터 추가
    Metadata.setMetadata(doc, file, text);
    const textWithData = Metadata.comebineTextAndData(text);
    // const makeFirstPageGuide = Setting.firstPageGuide.default;
    this.createPage(doc, textWithData);
  }

  static async createRandomTextPDF() {
    // 랜덤한 텍스트로 구성된 pdf만들기
  }

  static createFirstPageGuide(doc, metadata, charInfo) {
    doc.addPage();
  }

  static createPage(doc, text) {
    const font = Setting.fontType.default;
    const fontSize = Setting.fontType.default;
    const kerning = Setting.kerning.default;
    const lineHeight = Setting.lineHeight.default;

    const options = {
      charSpace: kerning,
      lineHeightFactor: lineHeight,
    };

    doc.setFont(font);
    doc.setFontSize(fontSize);

    const charInfo = pdfSetting.metadata.charInfo;
    const textPerPage = charInfo.textPerPage;
    const wholePage = Math.ceil(textPerPage / text.length);

    for (let i = 0; i < wholePage; i++) {
      doc.addPage();
      const startIdx = textPerPage * i;
      let endIdx = textPerPage * (i + 1);
      endIdx = text.length > endIdx ? text.length : endIdx;

      const pageText = text.slice(startIdx, endIdx);
      
    }
  }
}
