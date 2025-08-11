import { TILE, TRAFFIC_LIGHT } from './game/physics.js';

export function render(ctx, state) {
  const { level, lights, player, camera, GOAL_X, LEVEL_W, LEVEL_H } = state;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < 6; i++) {
    const cx = (i * 300 - (camera.x * 0.4) % 300), cy = 60 + (i % 2) * 40;
    drawCloud(ctx, cx, cy); drawCloud(ctx, cx + 150, cy + 15);
  }
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  for (let y = 0; y < LEVEL_H; y++) {
    for (let x = 0; x < LEVEL_W; x++) {
      const t = level[y][x], px = x * TILE, py = y * TILE;
      if (t === 1) drawGround(ctx, px, py);
      if (t === 2) drawBrick(ctx, px, py);
      if (t === 3) drawCoin(ctx, px + TILE / 2, py + TILE / 2);
      if (t === TRAFFIC_LIGHT) drawTrafficLight(ctx, px, py, lights[`${x},${y}`]?.state);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.fillRect(-TILE, -TILE, TILE, LEVEL_H * TILE + 2 * TILE);
  ctx.fillStyle = 'rgba(255,255,255,.65)';
  ctx.fillRect(GOAL_X, 0, 6, LEVEL_H * TILE);
  drawPlayer(ctx, player);
  ctx.restore();
  ctx.fillStyle = '#72bf53';
  ctx.fillRect(0, ctx.canvas.height - 28, ctx.canvas.width, 28);
}

function drawGround(ctx, x, y) {
  ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = '#976939'; for (let i = 0; i < 2; i++) ctx.fillRect(x, y + i * 24, TILE, 2);
  ctx.fillStyle = '#6b3f17'; ctx.fillRect(x, y + 32, TILE, 16);
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
function drawCloud(ctx, x, y) {
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.arc(x + 24, y + 6, 18, 0, Math.PI * 2);
  ctx.arc(x - 24, y + 6, 18, 0, Math.PI * 2);
  ctx.fill();
}
function drawPlayer(ctx, p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.facing, 1);
  ctx.fillStyle = '#3b3b3b'; ctx.fillRect(-12, 18, 10, 8); ctx.fillRect(2, 18, 10, 8);
  ctx.fillStyle = '#e83f3f'; ctx.fillRect(-14, -8, 28, 24);
  ctx.fillStyle = '#f0c090'; ctx.fillRect(-12, -28, 24, 20);
  ctx.fillStyle = '#d22f2f'; ctx.fillRect(-12, -32, 24, 8); ctx.fillRect(-12, -32, 26, 4);
  ctx.fillStyle = '#222'; ctx.fillRect(-4, -20, 4, 4); ctx.fillRect(2, -20, 4, 4);
  ctx.restore();
}
