class SeedRandom {
  constructor() {
    // seed는 1로 초기화
    this.seed = 1;
  }

  // 난수 생성 알고리즘
  // 출처 : https://blog.naver.com/pmw9440/221877712774
  _random() {
    this.seed = (1013904223 + 1664525 * this.seed) % 4294967296;
    return this.seed / 4294967296;
  }

  _choice(array) {
    const arrIdx = Math.round(this._random() * array.length - 0.5);
    return array[arrIdx];
  }

  _makeRandomArray(type) {
    const arrayRange = {
      ascii: [
        // ascii 문자열 범위
        { start: 0x20, end: 0x7e },
      ],
      hex: [
        // 0~9
        { start: 0x30, end: 0x39 },
        // a~f
        { start: 0x61, end: 0x66 },
      ],
      base64: [
        // A~Z
        { start: 0x41, end: 0x5a },
        // a~z
        { start: 0x61, end: 0x7a },
        // 0~9
        { start: 0x30, end: 0x39 },
        // +
        { start: 0x2b, end: 0x2f },
        // /
        { start: 0x2f, end: 0x2f },
      ],
    };

    const ranges = arrayRange[type.toLowerCase()];
    let array = [];
    for (let range of ranges) {
      const start = range.start;
      const end = range.end;
      for (let i = start; i < end + 1; i++) {
        array.push(String.fromCharCode(i));
      }
    }

    return array;
  }

  makeRandomText(type, length) {
    const array = this._makeRandomArray(type);

    this._random();

    let text = "";
    for (let i = 0; i < length; i++) {
      if (i < 10) console.log(this.seed);
      text += this._choice(array);
    }

    return text;
  }
}

export default SeedRandom;
