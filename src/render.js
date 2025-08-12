import { TILE, TRAFFIC_LIGHT } from './game/physics.js';

export const Y_OFFSET = 80;

export function render(ctx, state) {
  const { level, lights, player, camera, LEVEL_W, LEVEL_H, playerSprites } = state;
  if (ctx.canvas && ctx.canvas.style) {
    ctx.canvas.style.backgroundPosition = `${-Math.floor(camera.x)}px 0px`;
  }
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(-camera.x, -camera.y + Y_OFFSET);
    for (let y = 0; y < LEVEL_H; y++) {
      for (let x = 0; x < LEVEL_W; x++) {
        const t = level[y][x], px = x * TILE, py = y * TILE;
        if (t === 2) drawBrick(ctx, px, py);
        if (t === 3) drawCoin(ctx, px + TILE / 2, py + TILE / 2);
        if (t === TRAFFIC_LIGHT) drawTrafficLight(ctx, px, py, lights[`${x},${y}`]?.state);
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,.15)';
    ctx.fillRect(-TILE, -TILE, TILE, LEVEL_H * TILE + 2 * TILE);
    drawPlayer(ctx, player, playerSprites);
    ctx.restore();
}

function drawBrick(ctx, x, y) {
  ctx.fillStyle = '#b84a2b'; ctx.fillRect(x, y, TILE, TILE);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.strokeRect(x + c * 16 + 1, y + r * 16 + 1, 14, 14);
}
function drawCoin(ctx, cx, cy) {
  ctx.save(); ctx.translate(cx, cy);
  const t = (performance.now() / 200) % (Math.PI * 2), scaleX = Math.abs(Math.cos(t)) * .8 + .2;
  ctx.scale(scaleX, 1);
  ctx.beginPath(); ctx.fillStyle = '#ffd400'; ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffea80'; ctx.fillRect(-3, -6, 6, 12); ctx.restore();
}
function drawTrafficLight(ctx, x, y, state) {
  ctx.fillStyle = '#555';
  ctx.fillRect(x + 20, y + TILE - 24, 8, 24);
  const colors = { red: '#e22', yellow: '#ff0', green: '#2ecc40' };
  ctx.fillStyle = colors[state] || '#2ecc40';
  ctx.beginPath(); ctx.arc(x + 24, y + 12, 8, 0, Math.PI * 2); ctx.fill();
}
export function drawPlayer(ctx, p, sprites, t = performance.now()) {
  const { w, h } = p; // use player dimensions for scaling
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.shadowY, w / 2, h / 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.facing, 1);
  let anim;
  if (p.sliding > 0) anim = sprites?.slide;
  else if (!p.onGround) anim = sprites?.jump;
  else if (p.running && (Math.abs(p.vx) > 0.1 || p.blocked)) anim = sprites?.run;
  else anim = sprites?.idle;
  if (anim && anim.length) {
    const frame = Math.floor(t / (p.blocked ? 200 : 100)) % anim.length;
    const img = anim[frame];
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  }
  ctx.restore();
}
