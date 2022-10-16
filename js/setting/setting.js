const Setting = {
  convertType: {
    id: "convert-type",
    type: "select",
    value: ["자동", "Ascii", "Hex", "Unicode", "Base64"],
    default: "자동",
  },
  makeRandomText: {
    id: "make-random-text",
    type: "checkbox",
    default: false,
  },
  textType: {
    id: "text-type",
    type: "select",
    value: ["Ascii", "Hex", "Base64"],
    default: "Ascii",
  },
  pageNum: {
    id: "page-num",
    type: "select",
    value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    default: 4,
  },
  mTop: {
    id: "m-top",
    type: "text",
    default: 2,
  },
  mRight: {
    id: "m-right",
    type: "text",
    default: 1,
  },
  mBottom: {
    id: "m-bottom",
    type: "text",
    default: 1,
  },
  mLeft: {
    id: "m-left",
    type: "text",
    default: 1,
  },
  firstPageGuide: {
    id: "first-page-guide",
    type: "checkbox",
    default: true,
  },
  lineGuide: {
    id: "line-guide",
    type: "checkbox",
    default: true,
  },
  font: {
    id: "font-type",
    type: "select",
    value: [
      "UbuntuMono-Bold",
      "UbuntuMono-Regular",
      "D2CodingBold",
      "JetBrainsMono-SemiBold",
      "JetBrainsMono-Bold",
    ],
    default: "UbuntuMono-Bold",
  },
  fontSize: {
    id: "font-size",
    type: "text",
    default: 3.8,
  },
  kerning: {
    id: "kerning",
    type: "text",
    default: 0.45,
  },
  lineHeight: {
    id: "line-height",
    type: "text",
    default: 1.2,
  },
  charTable: {
    id: "char-table",
    type: "table",
    from: [" ", "0", "8", "5", "$", "`", "~", "Q", "D"],
    to: ["Γ", "Δ", "Ч", "Σ", "§", "Я", "Ξ", "¶", "Ю"],
  },
};

export default Setting;
