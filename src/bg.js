let bgImage = null;
let scaledBg = null;

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

export function makeScaledBg(height, img = bgImage) {
  if (!img) return null;
  const scale = height / img.height;
  const width = Math.round(img.width * scale);
  let canvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  }
  let ctx = null;
  if (canvas.getContext) {
    try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
  }
  if (ctx && ctx.drawImage) ctx.drawImage(img, 0, 0, width, height);
  scaledBg = canvas;
  return scaledBg;
}

export function drawTiledBg(ctx, cameraX = 0) {
  if (!scaledBg) return;
  const tileW = scaledBg.width;
  const offsetX = ((cameraX % tileW) + tileW) % tileW;
  for (let x = -offsetX; x < ctx.canvas.width; x += tileW) {
    ctx.drawImage(scaledBg, x, 0);
  }
}

