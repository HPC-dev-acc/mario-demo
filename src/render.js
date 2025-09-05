import { TILE, TRAFFIC_LIGHT } from './game/physics.js';
import { drawTiledBg } from './bg.js';

export const CAMERA_OFFSET_Y = 0;

export function getVisibleRange(camera, canvas, LEVEL_W, LEVEL_H, camY = camera.y + CAMERA_OFFSET_Y) {
  const scaleX = Number(canvas.dataset?.cssScaleX) || 1;
  const scaleY = Number(canvas.dataset?.cssScaleY) || scaleX;
  const viewW = canvas.width / scaleX;
  const viewH = canvas.height / scaleY;
  const startX = Math.max(0, Math.floor(camera.x / TILE));
  const endX = Math.min(LEVEL_W, Math.ceil((camera.x + viewW) / TILE));
  const startY = Math.max(0, Math.floor(camY / TILE));
  const endY = Math.min(LEVEL_H, Math.ceil((camY + viewH) / TILE));
  return { startX, endX, startY, endY };
}

function getHighlightColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--designHighlight') || '#ff0';
}

export function render(ctx, state, design) {
  const { level, lights, player, camera, LEVEL_W, LEVEL_H, playerSprites, npcs, transparent, patterns, indestructible } = state;
  const camY = camera.y + CAMERA_OFFSET_Y;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawTiledBg(ctx, camera.x);
  ctx.save();
  ctx.translate(-camera.x, -camY);
  const { startX, endX, startY, endY } = getVisibleRange(camera, ctx.canvas, LEVEL_W, LEVEL_H, camY);
  const showBoxes = design?.isEnabled?.();
  if (showBoxes) { ctx.strokeStyle = '#0f0'; ctx.lineWidth = 1; }
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const t = level[y][x], px = x * TILE, py = y * TILE;
      const key = `${x},${y}`;
      const isTransparent = transparent?.has(key);
      const alpha = isTransparent ? (showBoxes ? 0.5 : 0) : 1;
      const patt = patterns?.[key];
      if (t === 2) {
        const locked = showBoxes && indestructible?.has(key);
        if (patt) drawBrickPattern(ctx, px, py, patt.mask, alpha, locked);
        else drawBrick(ctx, px, py, alpha, locked);
      }
      if (t === 3) drawCoin(ctx, px + TILE / 2, py + TILE / 2, alpha);
      if (t === TRAFFIC_LIGHT) drawTrafficLight(ctx, px, py, lights[key]?.state, state.trafficLightSprites, alpha);
      if (showBoxes && t !== 0) ctx.strokeRect(px, py, TILE, TILE);
    }
  }
  if (showBoxes) {
    ctx.strokeStyle = getHighlightColor();
    ctx.lineWidth = 2;
    const selObj = design.getSelected?.();
    if (selObj) ctx.strokeRect(selObj.x * TILE, selObj.y * TILE, TILE, TILE);
    const sel = state.selection;
    if (sel) {
      const h = TILE / 2;
      const sx = sel.x * TILE + (sel.q % 2) * h;
      const sy = sel.y * TILE + Math.floor(sel.q / 2) * h;
      ctx.strokeRect(sx, sy, h, h);
    }
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1;
  }
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.fillRect(-TILE, -TILE, TILE, LEVEL_H * TILE + 2 * TILE);
  if (npcs) {
    const trunks = [];
    for (const n of npcs) {
      if (n.type === 'trunk') { trunks.push(n); continue; }
      drawNpc(ctx, n, n.sprite);
      if (showBoxes) ctx.strokeRect(n.box.x, n.box.y, n.box.w, n.box.h);
    }
    drawPlayer(ctx, player, playerSprites);
    if (showBoxes) ctx.strokeRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
    for (const n of trunks) {
      drawNpc(ctx, n, n.sprite);
      if (showBoxes) ctx.strokeRect(n.box.x, n.box.y, n.box.w, n.box.h);
    }
  } else {
    drawPlayer(ctx, player, playerSprites);
    if (showBoxes) ctx.strokeRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
  }
  ctx.restore();
}

function drawBrick(ctx, x, y, alpha = 1, locked = false) {
  if (alpha < 1) { ctx.save(); ctx.globalAlpha = alpha; }
  ctx.fillStyle = '#b84a2b'; ctx.fillRect(x, y, TILE, TILE);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.strokeRect(x + c * 16 + 1, y + r * 16 + 1, 14, 14);
  if (alpha < 1) ctx.restore();
  if (locked) { ctx.save(); ctx.fillStyle = 'rgba(80,80,80,0.3)'; ctx.fillRect(x, y, TILE, TILE); ctx.restore(); }
}

function drawBrickPattern(ctx, x, y, mask, alpha = 1, locked = false) {
  if (alpha < 1) { ctx.save(); ctx.globalAlpha = alpha; }
  const h = TILE / 2;
  ctx.fillStyle = '#b84a2b';
  if (mask[0][0]) ctx.fillRect(x, y, h, h);
  if (mask[0][1]) ctx.fillRect(x + h, y, h, h);
  if (mask[1][0]) ctx.fillRect(x, y + h, h, h);
  if (mask[1][1]) ctx.fillRect(x + h, y + h, h, h);
  if (alpha < 1) ctx.restore();
  if (locked) { ctx.save(); ctx.fillStyle = 'rgba(80,80,80,0.3)'; ctx.fillRect(x, y, TILE, TILE); ctx.restore(); }
}
function drawCoin(ctx, cx, cy, alpha = 1) {
  ctx.save(); ctx.translate(cx, cy);
  if (alpha < 1) ctx.globalAlpha = alpha;
  const t = (performance.now() / 200) % (Math.PI * 2), scaleX = Math.abs(Math.cos(t)) * .8 + .2;
  ctx.scale(scaleX, 1);
  ctx.beginPath(); ctx.fillStyle = '#ffd400'; ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffea80'; ctx.fillRect(-3, -6, 6, 12); ctx.restore();
}
export function drawTrafficLight(ctx, x, y, state, sprites, alpha = 1) {
  const sprite = sprites?.[state] || sprites?.green;
  if (!sprite) return;
  const { img, sx, sy, sw, sh } = sprite;
  const dh = TILE * 3.75;
  const dw = sw * (dh / sh);
  const dx = x + TILE / 2 - dw / 2;
  const dy = y + TILE - dh;
  if (alpha < 1) { ctx.save(); ctx.globalAlpha = alpha; }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  if (alpha < 1) ctx.restore();
}

export function drawPlayer(ctx, p, sprites, t = performance.now()) {
  const w = p.renderW || p.w;
  const { h } = p; // use player dimensions for scaling
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.shadowY, w / 2, h / 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.facing, 1);
  ctx.imageSmoothingEnabled = false;
  let anim;
  if (p.sliding > 0) anim = sprites?.slide;
  else if (!p.onGround) anim = sprites?.jump;
  else if (p.redLightPaused || p.stunnedMs > 0) anim = sprites?.idle;
  else if (p.running && (Math.abs(p.vx) > 0.1 || p.blocked)) anim = sprites?.run;
  else anim = sprites?.idle;
  if (anim && anim.length) {
    const frame = Math.floor(t / (p.blocked ? 200 : 100)) % anim.length;
    const img = anim[frame];
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
  }
  ctx.restore();
  if (p.redLightPaused) {
    drawSweat(ctx, p.x, p.y - h / 2 - 5, t);
  }
}

export function drawNpc(ctx, p, sprite) {
  const { w, h } = p;
  const offsetY = p.offsetY || 0;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x, (p.shadowY || (p.y + h/2)) + offsetY, w/4, h/8, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
  if (!sprite) return;
  if (sprite.animations) {
    const { img, frameWidth: FW = 64, frameHeight: FH = 64, columns = 12, animations } = sprite;
    const anim = animations?.[p.state] || animations?.idle;
    if (!anim) return;
    const baseScale = h / FH;
    const frameIdx = anim.frames[Math.floor((p.animTime || 0) * anim.fps) % anim.frames.length];
    const sx = (frameIdx % columns) * FW;
    const sy = Math.floor(frameIdx / columns) * FH;
    let dw = FW * baseScale;
    let dh = FH * baseScale;
    const extra = p.type === 'officeman' ? 1.25 : p.type === 'trunk' ? 1.1 : 1;
    dw *= extra;
    dh *= extra;
    ctx.save();
    ctx.imageSmoothingEnabled = p.type === 'trunk';
    if (p.type === 'officeman' || p.type === 'trunk') {
      ctx.translate(p.x, p.y + anim.offsetY * baseScale * extra + offsetY);
      ctx.scale(p.facing || 1, 1);
      ctx.drawImage(img, sx, sy, FW, FH, -dw / 2, -dh / 2, dw, dh);
    } else {
      ctx.translate(p.x, p.y + h / 2 - dh + anim.offsetY * baseScale + offsetY);
      ctx.scale(p.facing || 1, 1);
      ctx.drawImage(img, sx, sy, FW, FH, -dw / 2, 0, dw, dh);
    }
    ctx.restore();
  } else {
    const anim = sprite[p.state] || sprite.idle;
    if (!anim) return;
    const frames = anim.frames || anim;
    const fps = anim.fps || frames.length;
    const frame = Math.floor((p.animTime || 0) * fps) % frames.length;
    const img = frames[frame];
    ctx.save();
    ctx.imageSmoothingEnabled = p.type === 'trunk';
    ctx.translate(p.x, p.y + offsetY);
    ctx.scale(p.facing || 1, 1);
    const extra = p.type === 'officeman' ? 1.25 : p.type === 'trunk' ? 1.1 : 1;
    const dw = w * extra;
    const dh = h * extra;
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }
  if (p.redLightPaused) {
    drawSweat(ctx, p.x, p.y + offsetY - h / 2 - 5);
  }
}

function drawSweat(ctx, x, y, t = performance.now()) {
  ctx.save();
  ctx.fillStyle = '#8cf';
  for (let i = 0; i < 3; i++) {
    const phase = (t / 250 + i / 3) % 1;
    const dx = Math.sin(phase * Math.PI * 2) * 3;
    const dy = -i * 6 - phase * 4;
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

