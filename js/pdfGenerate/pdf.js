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
    console.table(pdfSetting);
    const textWithData = Metadata.comebineTextAndData(text);
    // const makeFirstPageGuide = Setting.firstPageGuide.default;
    this.createPage(doc, textWithData);

    // doc.save("test.pdf");
  }

  static async createRandomTextPDF() {
    // 랜덤한 텍스트로 구성된 pdf만들기
  }

  static createFirstPageGuide(doc) {
    doc.addPage();
  }

  static createPage(doc, text) {
    const font = Setting.fontType.default;
    const fontSize = Setting.fontSize.default;
    const kerning = Setting.kerning.default;
    const lineHeight = Setting.lineHeight.default;

    const options = {
      charSpace: kerning,
      lineHeightFactor: lineHeight,
    };

    doc.setFont(font);
    doc.setFontSize(fontSize);
    doc.setTextColor("0");

    const textPerPage = pdfSetting.charInfo.textPerPage;
    const wholePage = Math.ceil(text.length / textPerPage);

    const x = Setting.mLeft.pt;
    const y = Setting.mTop.pt;

    for (let i = 0; i < wholePage; i++) {
      const startIdx = textPerPage * i;
      let endIdx = textPerPage * (i + 1);
      endIdx = text.length > endIdx ? text.length : endIdx;

      const pageText = text.slice(startIdx, endIdx);
      doc.text(pageText, x, y, options);
    }
  }
}
