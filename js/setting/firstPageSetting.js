import Setting from "./setting.js";
import pdfSetting from "./pdfSetting.js";
import cmToPoint from "../util/cmToPoint.js";

const _headerColor = [210, 210, 210];
const _bodyColor = [255, 255, 255];
const _commonStyle = {
  font: pdfSetting.firstPage.fontType,
  fontSize: pdfSetting.firstPage.fontSize,
  fontStyle: "normal",
  cellWidth: "auto",
  halign: "center",
  valign: "middle",
  textColor: 0,
  lineWidth: 1,
  lineColor: 0,
};

const firstPageTable = {
  vertical: {
    // 보여줄 표의 종류에 따라 body에 추가하는 값이 달라짐
    // startY 및 didDrawPage 함수는 설정을 적용하는 함수 내부에서 유동적으로 결정함
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
        fillColor: _headerColor,
        minCellWidth: cmToPoint(3),
      },
      data: {
        fillColor: _bodyColor,
        minCellWidth: cmToPoint(3),
      },
    },
    willDrawCell: (data) => {
      if (data.section == "head") {
        data.row.height = 0;
        return false;
      }
    },
    styles: _commonStyle,
    tableWidth: "wrap",
    margin: { left: pdfSetting.firstPage.margin.pt },
  },
  horizontal: {
    headStyles: {
      fillColor: _headerColor,
    },
    bodyStyles: {
      fillColor: _bodyColor,
    },
    styles: _commonStyle,
    didParseCell: (data) => {
      if (data.section == "body" && data.column.index == 0) {
        data.cell.styles.fillColor = _headerColor;
      }
    },
    tableWidth: "wrap",
    margin: { left: pdfSetting.firstPage.margin.pt },
  },
};

export default firstPageTable;
