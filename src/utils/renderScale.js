export function computeRenderScale(
  cssW,
  cssH,
  baseW = 960,
  baseH = 540,
  uniform = false
) {
  const widthRatio = cssW / baseW;
  const heightRatio = cssH / baseH;
  if (uniform) return Math.min(widthRatio, heightRatio);
  return { scaleX: widthRatio, scaleY: heightRatio };
}
