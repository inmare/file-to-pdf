import cmToPoint from "../util/cmToPoint.js";
import Text from "../util/text.js";

const Setting = {
  convertType: {
    id: "convert-type",
    type: "select",
    value: ["자동", "Ascii", "Hex", "Unicode", "Base64"],
    default: "Ascii",
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
    default: 1.8,
    get pt() {
      return cmToPoint(this.default);
    },
  },
  mRight: {
    id: "m-right",
    type: "text",
    default: 1,
    get pt() {
      return cmToPoint(this.default);
    },
  },
  mBottom: {
    id: "m-bottom",
    type: "text",
    default: 1,
    get pt() {
      return cmToPoint(this.default);
    },
  },
  mLeft: {
    id: "m-left",
    type: "text",
    default: 1,
    get pt() {
      return cmToPoint(this.default);
    },
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
  fontType: {
    id: "font-type",
    type: "select",
    value: [
      "UbuntuMono-Bold",
      "UbuntuMono-Regular",
      "D2Coding-Bold",
      "JetBrainsMono-Bold",
      "JetBrainsMono-ExtraBold",
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
    to: ["Γ", "Δ", "δ", "Σ", "§", "Я", "Ξ", "¶", "Ю"],
    get toUnicode() {
      return this.to.map((char) => Text.textToUnicode(char));
    },
  },
};

export default Setting;
