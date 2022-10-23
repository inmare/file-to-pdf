export default class Font {
  static async addFont(doc, fontName) {
    const fontDatURL = await this.getFontDataURL(fontName);

    doc.addFileToVFS(`${fontName}.ttf`, fontDatURL);
    doc.addFont(`${fontName}.ttf`, fontName, "normal");
  }

  static async getFontDataURL(fontName) {
    const response = await fetch(`./fonts/${fontName}.ttf`);
    const blob = await response.blob();
    const fileReader = new FileReader();
    const promise = new Promise((resolve, _) => {
      fileReader.readAsDataURL(blob);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
    });
    const dataURL = await promise;
    const rawDataURL = Text.removeMimeFromDataURL(dataURL);

    return rawDataURL;
  }
}
