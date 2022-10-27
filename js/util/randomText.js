class seedRandom {
  constructor(seed) {
    this.seed = seed;
  }

  // 난수 생성 알고리즘
  // 출처 : https://blog.naver.com/pmw9440/221877712774
  random() {
    this.seed = (1013904223 + 1664525 * this.seed) % 4294967296;
    return this.seed / 4294967296;
  }

  choice(array) {
    const arrIdx = Math.round(this.random() * array.length - 0.5);
    return array[arrIdx];
  }

  makeRandomText(array, length) {
    let text = "";
    for (let i = 0; i < length; i++) {
      text += this.choice(array);
    }

    return text;
  }
}

export default seedRandom;
