import firstPageTable from "../setting/firstPageSetting.js";
import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Metadata from "./metadata.js";
import Font from "./font.js";
import Text from "../util/text.js";

export default class PDF {
  static async createPDF(text, file, isRandomText) {
    const doc = new jsPDF("p", "pt", "a4");
    // 메인 텍스트용 폰트 추가
    await Font.addFont(doc, Setting.fontType.default);
    // 메인 텍스트용 메타 데이터 추가
    let processedText;
    let outputFileName;
    if (!isRandomText) {
      Metadata.setMetadata(doc, text, file, isRandomText);
      processedText = Metadata.comebineTextAndData(text);
      outputFileName = `${file.name}.pdf`;
    } else {
      Metadata.setMetadata(doc, null, null, isRandomText);
      processedText = Text.createRandomText();
      const textType = Setting.randomTextType.default;
      outputFileName = `Random${textType}.pdf`;
    }

    const makeFirstPageGuide = Setting.firstPageGuide.default;

    if (makeFirstPageGuide) {
      const firstPageFont = pdfSetting.firstPage.fontType;
      await Font.addFont(doc, firstPageFont);
      this.createFirstPageGuide(doc, isRandomText);
      doc.addPage();
    }

    this.createPage(doc, processedText);

    doc.output("dataurlnewwindow", {
      filename: outputFileName,
    });
  }

  static createFirstPageGuide(doc, isRandomText) {
    const firstPageFont = pdfSetting.firstPage.fontType;
    const firstPageFontSize = pdfSetting.firstPage.fontSize;
    const margin = pdfSetting.firstPage.margin.pt;

    doc.setFont(firstPageFont);
    doc.setFontSize(firstPageFontSize);
    doc.setTextColor("0");

    const textHeight = doc.getTextDimensions("A").h * doc.getLineHeightFactor();
    let totalHeight = margin;

    doc.text("PDF 정보", margin, totalHeight);
    addLineBreak(1);

    const infoTable = firstPageTable.infoTable(isRandomText);
    setTableConfig(infoTable);
    doc.autoTable(infoTable);
    addLineBreak(2);

    doc.text("변경된 텍스트", margin, totalHeight);
    addLineBreak(1);

    const charListTable = firstPageTable.charListTable();
    setTableConfig(charListTable);
    doc.autoTable(charListTable);
    addLineBreak(2);

    if (!isRandomText) {
      doc.text("메타데이터", margin, totalHeight);
      addLineBreak(1);

      const meatdataTable = firstPageTable.meatdataTable();
      setTableConfig(meatdataTable);
      doc.autoTable(meatdataTable);
    }

    function addLineBreak(lineNum) {
      totalHeight += textHeight * lineNum;
    }

    function setTableConfig(tableConfig) {
      tableConfig.startY = totalHeight;
      tableConfig.didDrawPage = function (data) {
        // 표가 그려진 후 cursor y좌표를 totalHeight에 할당하기
        totalHeight = data.cursor.y;
      };
    }
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
      if (i != 0) doc.addPage();
      const startIdx = textPerPage * i;
      let endIdx = textPerPage * (i + 1);
      endIdx = text.length < endIdx ? text.length : endIdx;

      const pageText = text.slice(startIdx, endIdx);
      const linebreakPageText = Text.addLinebreak(pageText);
      doc.text(linebreakPageText, x, y, options);
    }
  }
}
