function $(selector) {
  const elemArray = document.querySelectorAll(selector);
  const length = elemArray.length;
  if (length == 1) {
    const elem = document.querySelector(selector);
    return elem;
  } else {
    return elemArray;
  }
}

window.$ = $;
