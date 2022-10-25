import pdfSetting from "../setting/pdfSetting.js";
import Setting from "../setting/setting.js";
import Metadata from "./metadata.js";
import Font from "./font.js";
import Text from "../util/text.js";
import cmToPoint from "../util/cmToPoint.js";

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
    totalHeight += textHeight;

    let infoTableFinalY;
    doc.autoTable({
      body: [
        {
          title: "파일 이름",
          data: pdfSetting.file.name,
        },
        {
          title: "파일 크기",
          data: pdfSetting.file.size,
        },
        {
          title: "변경 모드",
          data: Setting.convertType.default,
        },
        // 랜덤 텍스트 생성시에는 위의 정보들은 넣지 말기
        {
          title: "줄 당 글자 수",
          data: pdfSetting.charInfo.charPerLine,
        },
        {
          title: "페이지 당 줄 수",
          data: pdfSetting.charInfo.linePerPage,
        },
        {
          title: "페이지 당 글자 수",
          data: pdfSetting.charInfo.textPerPage,
        },
      ],
      columns: [
        {
          header: "제목",
          dataKey: "title",
        },
        {
          header: "값",
          dataKey: "data",
        },
      ],
      columnStyles: {
        title: {
          fillColor: [210, 210, 210],
          minCellWidth: cmToPoint(3),
        },
        data: {
          fillColor: [255, 255, 255],
          minCellWidth: cmToPoint(3),
        },
      },
      willDrawCell: (data) => {
        if (data.section == "head") {
          data.row.height = 0;
          return false;
        }
      },
      didDrawPage: (data) => {
        // 각 줄의 높이를 전부 infoTableHeight에 더하기
        infoTableFinalY = data.cursor.y;
      },
      styles: {
        font: firstPageFont,
        fontSize: pdfSetting.firstPage.fontSize,
        fontStyle: "normal",
        cellWidth: "auto",
        halign: "center",
        valign: "middle",
        textColor: 0,
        lineWidth: 1,
        lineColor: 0,
      },
      tableWidth: "wrap",
      startY: totalHeight,
      margin: { left: margin },
    });

    totalHeight = infoTableFinalY;
    totalHeight += textHeight * 2;

    doc.text("변경된 텍스트", margin, totalHeight);
    totalHeight += textHeight;

    const charTableHead = ["글자", ...Setting.charTable.from];
    const originalChar = ["변환된 글자", ...Setting.charTable.to];
    const unicodeChar = ["유니코드", ...Setting.charTable.toUnicode];
    let charTableFinalY;
    doc.autoTable({
      head: [charTableHead],
      body: [originalChar, unicodeChar],
      headStyles: {
        fillColor: [210, 210, 210],
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      styles: {
        font: firstPageFont,
        fontSize: pdfSetting.firstPage.fontSize,
        fontStyle: "normal",
        halign: "center",
        valign: "middle",
        textColor: 0,
        lineWidth: 1,
        lineColor: 0,
      },
      willDrawCell: (data) => {
        if (data.section == "body" && data.column.index == 0) {
          data.cell.styles.fillColor = [210, 210, 210];
        }
      },
      didDrawPage: (data) => {
        charTableFinalY = data.cursor.y;
      },
      tableWidth: "wrap",
      startY: totalHeight,
      margin: { left: margin },
    });

    totalHeight = charTableFinalY;
    totalHeight += textHeight * 2;

    doc.text("메타데이터", margin, totalHeight);
    totalHeight += textHeight;
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
