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
  _vertical: {
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
  _horizontal: {
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
  infoTable: function (isRandomText) {
    const config = this._vertical;
    let body = [
      { title: "줄 당 글자 수", data: pdfSetting.charInfo.charPerLine },
      { title: "페이지 당 줄 수", data: pdfSetting.charInfo.linePerPage },
      { title: "페이지 당 글자 수", data: pdfSetting.charInfo.textPerPage },
    ];
    if (!isRandomText) {
      // 랜덤한 글자를 생성하는 것이 아닐 경우 아래의 정보들 또한 추가
      body = [
        { title: "파일 이름", data: pdfSetting.file.name },
        { title: "파일 크기", data: pdfSetting.file.size },
        { title: "변경 모드", data: Setting.convertType.default },
        ...body,
      ];
    }

    config.body = body;
    return config;
  },
  charListTable: function () {
    const config = this._horizontal;
    const head = [["글자", ...Setting.charTable.from]];
    const body = [
      ["변환된 글자", ...Setting.charTable.to],
      ["유니코드", ...Setting.charTable.toUnicode],
    ];

    config.head = head;
    config.body = body;

    return config;
  },
  meatdataTable: function () {
    const config = this._vertical;
    const body = [
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

    config.body = body;
    return config;
  },
};

export default firstPageTable;
