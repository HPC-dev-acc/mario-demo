export function computeRenderScale(cssW, cssH, baseW = 960, baseH = 540) {
  const widthRatio = cssW / baseW;
  const heightRatio = cssH / baseH;
  return widthRatio; // contain/cover keeps aspect so width ratio suffices
}
