import firstPageTable from "../setting/firstPageSetting.js";
import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Metadata from "./metadata.js";
import Font from "./font.js";
import Text from "../util/text.js";

export default class PDF {
  static async createPDF(text, file, isRandomText) {
    const doc = new jsPDF("p", "pt", "a4");

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

    doc.output("dataurlnewwindow", {
      filename: outputFileName,
    });
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
      console.log(linebreakPageText[21][2], linebreakPageText[21][3]);
      doc.text(linebreakPageText, x, y, options);

      // 가이드 라인 생성
      const makeLineGuide = Setting.lineGuide.default;
      if (makeLineGuide) {
        this.createLineGuide(doc, pageText, i + 1, isRandomText);
      }
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
      const y = mTop + textHeight * lineNum;

      doc.text(lineNumStr, xLeft, y);
      doc.text(lineNumStr, xRight, y);
    }

    for (let i = 1; i * 10 <= charLength; i++) {
      const charNum = i * 10;
      const charNumStr = Text.getTensFromDec(charNum);
      const x = mLeft + textWidth * charNum;
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
