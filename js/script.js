import $ from "./util/global.js";
import UI from "./ui/ui.js";
import Convert from "./fileConvert/convert.js";
import Preprocess from "./fileConvert/preprocess.js";

document.addEventListener("DOMContentLoaded", () => {
  window.jsPDF = window.jspdf.jsPDF;
  window.$ = $;
  UI.initialize();
  Convert.initialize();
  Preprocess.initialize();
});