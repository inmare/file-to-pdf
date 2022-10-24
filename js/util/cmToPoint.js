function cmToPoint(cm) {
  // 부동 소수점 오차를 해결하기 위해 소수점 다섯째 자리에서 반올림함
  const point = Math.round(cm * 28.346 * 10000) / 10000;
  return point;
}

export default cmToPoint;
