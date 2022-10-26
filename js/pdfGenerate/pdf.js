import firstPageTable from "../setting/firstPageSetting.js";
import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Metadata from "./metadata.js";
import Font from "./font.js";
import Text from "../util/text.js";

export default class PDF {
  static async createPDF(text, file) {
    const doc = new jsPDF("p", "pt", "a4");
    // 메인 텍스트용 폰트 추가
    await Font.addFont(doc, Setting.fontType.default);
    // 메인 텍스트용 메타 데이터 추가
    Metadata.setMetadata(doc, file, text);
    const textWithData = Metadata.comebineTextAndData(text);
    const makeFirstPageGuide = Setting.firstPageGuide.default;

    if (makeFirstPageGuide) {
      const firstPageFont = pdfSetting.firstPage.fontType;
      await Font.addFont(doc, firstPageFont);
      this.createFirstPageGuide(doc);
      doc.addPage();
    }

    this.createPage(doc, textWithData);

    doc.output("dataurlnewwindow", {
      filename: `${file.name}.pdf`,
    });
  }

  static async createRandomTextPDF() {
    // 랜덤한 텍스트로 구성된 pdf만들기
  }

  static createFirstPageGuide(doc) {
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
    addInfoTable();

    addLineBreak(2);

    doc.text("변경된 텍스트", margin, totalHeight);
    addLineBreak(1);
    addCharListTable();

    addLineBreak(2);

    doc.text("메타데이터", margin, totalHeight);
    addLineBreak(1);
    addMetadataTable();

    function addLineBreak(lineNum) {
      totalHeight += textHeight * lineNum;
    }

    function addMetadataTable() {
      const metadataTable = firstPageTable.vertical;
      metadataTable.body = [
        {
          title: "변경 모드",
          data: pdfSetting.text.convertTypeDec.str,
        },
        {
          title: "파일 이름(유니코드)의 길이",
          data: pdfSetting.text.fileNameLength.str,
        },
        {
          title: "마지막 줄의 실제 길이",
          data: pdfSetting.text.lastLineLength.str,
        },
      ];
      metadataTable.startY = totalHeight;
      metadataTable.didDrawPage = function (data) {
        // 표가 그려진 후 cursor y좌표를 totalHeight에 할당하기
        totalHeight = data.cursor.y;
      };
      doc.autoTable(metadataTable);
    }

    function addCharListTable() {
      const charListTable = firstPageTable.horizontal;
      charListTable.head = [["글자", ...Setting.charTable.from]];
      charListTable.body = [
        ["변환된 글자", ...Setting.charTable.to],
        ["유니코드", ...Setting.charTable.toUnicode],
      ];
      charListTable.startY = totalHeight;
      charListTable.didDrawPage = function (data) {
        totalHeight = data.cursor.y;
      };
      doc.autoTable(charListTable);
    }

    function addInfoTable() {
      const infoTable = firstPageTable.vertical;
      infoTable.body = [
        { title: "파일 이름", data: pdfSetting.file.name },
        { title: "파일 크기", data: pdfSetting.file.size },
        { title: "변경 모드", data: Setting.convertType.default },
        { title: "줄 당 글자 수", data: pdfSetting.charInfo.charPerLine },
        { title: "페이지 당 줄 수", data: pdfSetting.charInfo.linePerPage },
        { title: "페이지 당 글자 수", data: pdfSetting.charInfo.textPerPage },
      ];
      infoTable.startY = totalHeight;
      infoTable.didDrawPage = function (data) {
        // 표가 그려진 후 cursor y좌표를 totalHeight에 할당하기
        totalHeight = data.cursor.y;
      };
      doc.autoTable(infoTable);
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
