import Setting from "../setting/setting.js";
import Metadata from "./metadata.js";
import Font from "./font.js";
import Text from "../util/text.js";
import Unit from "./unit.js";

export default class PDF {
  static async createPDF(text, file) {
    const doc = new jsPDF("p", "pt", "a4");
    // 메인 텍스트용 폰트 추가
    await Font.addFont(doc, Setting.fontType.default);
    // 메인 텍스트용 메타 데이터 추가
    Metadata.addFileData(file);
    const charInfo = this.getCharLengthInfo(doc);
    const textWithData = this.comebineTextAndData(text, metadata, charInfo);
    const makeFirstPageGuide = Setting.firstPageGuide.default;
    if (makeFirstPageGuide) {
      this.createFirstPageGuide(doc, metadata, charInfo);
    }
  }

  static async createRandomTextPDF() {
    // 랜덤한 텍스트로 구성된 pdf만들기
  }

  static createFirstPageGuide(doc, metadata, charInfo) {
    doc.addPage();
  }

  static comebineTextAndData(text, metadata) {
    let metadataText =
      metadata.convertType +
      metadata.nameLength +
      metadata.dummyTextLength +
      metadata.fileNameUnicode;

    metadataText = Text.replaceCharTable(metadataText);

    const lastChar = text.slice(-1);
    const combinedText =
      metadataText + text + lastChar.repeat(metadata.dummyTextLength);

    return combinedText;
  }
}
