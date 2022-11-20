import firstPageTable from "../setting/firstPageSetting.js";
import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Metadata from "./metadata.js";
import Font from "./font.js";
import Text from "../util/text.js";

export default class PDF {
  static async createPDF(text, file, isRandomText) {
    const doc = new jsPDF("p", "pt", "a4", true);

    await Font.addFont(doc, Setting.fontType.default);
    await Font.addFont(doc, pdfSetting.guideFont);

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
      this.createFirstPageGuide(doc, isRandomText);
      doc.addPage();
    }

    this.createPage(doc, processedText, isRandomText);

    doc.setProperties({
      title: outputFileName,
    });
    window.open(doc.output("bloburl"));
  }

  static createFirstPageGuide(doc, isRandomText) {
    const firstPageFont = pdfSetting.guideFont;
    const firstPageFontSize = pdfSetting.firstPage.fontSize;
    const margin = pdfSetting.firstPage.margin.pt;

    doc.setFont(firstPageFont);
    doc.setFontSize(firstPageFontSize);
    doc.setTextColor("0");

    const textHeight = doc.getTextDimensions("A").h * doc.getLineHeightFactor();
    let totalHeight = margin;

    addText("PDF 정보");

    const infoTable = firstPageTable.infoTable(isRandomText);
    addTable(infoTable);

    addText("변경된 텍스트");

    const charListTable = firstPageTable.charListTable();
    addTable(charListTable);

    if (!isRandomText) {
      addText("메타데이터");

      const meatdataTable = firstPageTable.meatdataTable();
      addTable(meatdataTable);
    }

    function addText(text) {
      doc.text(text, margin, totalHeight);
      _addLineBreak(1);
    }

    function addTable(tableConfig) {
      _setTableConfig(tableConfig);
      doc.autoTable(tableConfig);
      _addLineBreak(2);
    }

    function _addLineBreak(lineNum) {
      totalHeight += textHeight * lineNum;
    }

    function _setTableConfig(tableConfig) {
      tableConfig.startY = totalHeight;
      tableConfig.didDrawPage = function (data) {
        // 표가 그려진 후 cursor y좌표를 totalHeight에 할당하기
        totalHeight = data.cursor.y;
      };
    }
  }

  static createPage(doc, text, isRandomText) {
    const font = Setting.fontType.default;
    const fontSize = Setting.fontSize.default;

    doc.setFont(font);
    doc.setFontSize(fontSize);
    doc.setTextColor("0");

    const charPerLine = pdfSetting.charInfo.charPerLine;
    const textPerPage = pdfSetting.charInfo.textPerPage;

    const charHeight = pdfSetting.charInfo.charHeight;
    const charWidth = pdfSetting.charInfo.charWidth;

    const pageLength = Math.ceil(text.length / textPerPage);
    let x = Setting.mLeft.pt;
    let y = Setting.mTop.pt;

    for (let i = 0; i < pageLength; i++) {
      if (i != 0) doc.addPage();

      const startIdx = i * textPerPage;
      let endIdx = (i + 1) * textPerPage;
      endIdx = endIdx > text.length ? text.length : endIdx;
      const pageText = text.slice(startIdx, endIdx);

      // 원래 jspdf에서는 text를 담고 있는 array로도 텍스트를 표시할 수 있지만,
      // 그렇게 글자를 표시할 시 이상한 글자를 표시하지 못 하는 이유를 알 수 없는 버그가 발생해서
      // 아래의 코드처럼 글자를 하나하나 입력하는 방식을 사용함
      for (const [idx, char] of pageText.split("").entries()) {
        doc.text(char, x, y);
        if ((idx + 1) % charPerLine == 0) {
          // 줄 바꿈
          x = Setting.mLeft.pt;
          y += charHeight;
          continue;
        }
        x += charWidth;
      }

      const makeLineGuide = Setting.lineGuide.default;
      if (makeLineGuide) {
        this.createLineGuide(doc, pageText, i + 1, isRandomText);
      }

      x = Setting.mLeft.pt;
      y = Setting.mTop.pt;
    }
  }

  static createLineGuide(doc, pageText, pageNum, isRandomText) {
    doc.setTextColor("0.5");

    const charLength = pdfSetting.charInfo.charPerLine;
    const lineLength = pageText.length / charLength;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const textWidth = pdfSetting.charInfo.charWidth;
    const textHeight = pdfSetting.charInfo.charHeight;

    const lineGuideMargin = pdfSetting.lineGuide.margin.pt;
    const mTop = Setting.mTop.pt;
    const mLeft = Setting.mLeft.pt;

    for (let i = 1; i * 10 <= lineLength; i++) {
      const lineNum = i * 10;
      const lineNumStr = Text.getTensFromDec(lineNum);
      const xLeft = lineGuideMargin;
      const xRight = pageWidth - lineGuideMargin;
      const y = mTop + textHeight * (lineNum - 1);

      doc.text(lineNumStr, xLeft, y);
      doc.text(lineNumStr, xRight, y);
    }

    for (let i = 1; i * 10 <= charLength; i++) {
      const charNum = i * 10;
      const charNumStr = Text.getTensFromDec(charNum);
      const x = mLeft + textWidth * (charNum - 1);
      const yTop = lineGuideMargin;
      const yBottom = pageHeight - lineGuideMargin;

      doc.text(charNumStr, x, yTop);
      doc.text(charNumStr, x, yBottom);
    }

    doc.text(`page ${pageNum}`, lineGuideMargin, lineGuideMargin);

    // 파일 변환시 파일 이름도 추가
    if (!isRandomText) {
      // 파일 이름에는 영어가 아닌 글자가 포함될 수도 있기 때문에 guideFont로 이름을 표시함
      const fileNameFont = pdfSetting.guideFont;
      doc.setFont(fileNameFont);
      doc.text(
        pdfSetting.file.name,
        lineGuideMargin,
        lineGuideMargin + textHeight
      );
      // 파일 이름 표시 후 다시 원래 페이지 폰트로 되돌리기
      doc.setFont(Setting.fontType.default);
    }

    doc.setTextColor("0");
  }
}
