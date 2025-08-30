let bgImage = null;
let scaledBg = null;
let bgDpr = 1;

export async function loadBackground(url) {
  if (typeof fetch === 'function' && typeof createImageBitmap === 'function') {
    const res = await fetch(url);
    const blob = await res.blob();
    bgImage = await createImageBitmap(blob);
  } else {
    bgImage = document.createElement('canvas');
    bgImage.width = 1;
    bgImage.height = 1;
  }
  return bgImage;
}

export function makeScaledBg(height, img = bgImage, dpr = 1) {
  if (!img) return null;
  bgDpr = dpr;
  const scaledH = Math.round(height * dpr);
  const scale = scaledH / img.height;
  const width = Math.round(img.width * scale);
  let canvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, scaledH);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = scaledH;
  }
  let ctx = null;
  if (canvas.getContext) {
    try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
  }
  if (ctx && ctx.drawImage) ctx.drawImage(img, 0, 0, width, scaledH);
  scaledBg = canvas;
  return scaledBg;
}

export function drawTiledBg(ctx, cameraX = 0) {
  if (!scaledBg) return;
  const cssScaleX = Number(ctx.canvas.dataset?.cssScaleX) || 1;
  const cssScaleY = Number(ctx.canvas.dataset?.cssScaleY) || 1;
  const tileW = scaledBg.width / (bgDpr * cssScaleX);
  const tileH = scaledBg.height / (bgDpr * cssScaleY);
  const viewW = ctx.canvas.width / cssScaleX;
  const offsetX = ((cameraX % tileW) + tileW) % tileW;
  for (let x = -offsetX; x < viewW; x += tileW) {
    ctx.drawImage(scaledBg, x, 0, tileW, tileH);
  }
}

