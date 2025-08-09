// 簡易平台動作遊戲（教學範例）
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // 遊戲常數
  const TILE = 48;           // 磚塊像素大小
  const GRAVITY = 0.9;       // 重力
  const FRICTION = 0.8;      // 地面摩擦
  const MOVE_SPEED = 0.7;    // 移動加速度
  const MAX_RUN = 5.2;       // 最大水平速度
  const JUMP_VEL = -15.5;    // 跳躍初速度

  // 世界資料（0=空，1=地面，2=方塊（可踩），3=金幣）
  // 簡易關卡：寬 100 x 高 12 格
  const LEVEL_H = 12;
  const LEVEL_W = 100;
  const level = Array.from({ length: LEVEL_H }, (_, y) => {
    const row = Array.from({ length: LEVEL_W }, () => 0);
    // 地板
    if (y >= LEVEL_H - 2) row.fill(1);
    return row;
  });

  // 簡單地形
  // 平台與階梯
  for (let x = 10; x < 15; x++) level[8][x] = 2;
  for (let x = 20; x < 23; x++) level[7][x] = 2, level[8][x] = 2;
  for (let x = 30; x < 36; x++) level[9][x] = 2;
  for (let x = 45; x < 48; x++) level[6][x] = 2;
  for (let x = 70; x < 76; x++) level[9][x] = 2;

  // 金幣
  const coins = new Set();
  const addCoin = (cx, cy) => { level[cy][cx] = 3; coins.add(`${cx},${cy}`); };
  addCoin(12, 7); addCoin(21, 6); addCoin(31, 8); addCoin(33, 8); addCoin(46, 5); addCoin(72, 8);

  // 玩家
  const player = {
    x: 3 * TILE, y: 6 * TILE, w: 28, h: 40,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    lives: 3
  };

  // 相機
  const camera = { x: 0, y: 0 };

  // 輸入
  const keys = { left: false, right: false, jump: false, action: false };

  // 輔助函式
  const worldToTile = (px) => Math.floor(px / TILE);
  const rectVsTileSolid = (x, y) => {
    const tx = worldToTile(x), ty = worldToTile(y);
    if (ty < 0 || ty >= LEVEL_H || tx < 0 || tx >= LEVEL_W) return 0;
    const t = level[ty][tx];
    return (t === 1 || t === 2) ? t : 0;
  };

  function resolveCollisions(entity) {
    // 水平移動
    entity.x += entity.vx;
    // 左
    if (entity.vx < 0) {
      const left = entity.x - entity.w / 2;
      const top = entity.y - entity.h / 2 + 4;
      const bottom = entity.y + entity.h / 2 - 1;
      for (let y = top; y <= bottom; y += TILE / 2) {
        if (rectVsTileSolid(left, y)) {
          entity.x = Math.floor(left / TILE) * TILE + TILE + entity.w / 2 + 0.01;
          entity.vx = 0;
          break;
        }
      }
    }
    // 右
    if (entity.vx > 0) {
      const right = entity.x + entity.w / 2;
      const top = entity.y - entity.h / 2 + 4;
      const bottom = entity.y + entity.h / 2 - 1;
      for (let y = top; y <= bottom; y += TILE / 2) {
        if (rectVsTileSolid(right, y)) {
          entity.x = Math.floor(right / TILE) * TILE - entity.w / 2 - 0.01;
          entity.vx = 0;
          break;
        }
      }
    }

    // 垂直移動
    entity.y += entity.vy;
    entity.onGround = false;

    if (entity.vy > 0) {
      // 往下
      const bottom = entity.y + entity.h / 2;
      const left = entity.x - entity.w / 2 + 6;
      const right = entity.x + entity.w / 2 - 6;
      for (let x = left; x <= right; x += TILE / 2) {
        if (rectVsTileSolid(x, bottom)) {
          entity.y = Math.floor(bottom / TILE) * TILE - entity.h / 2 - 0.01;
          entity.vy = 0;
          entity.onGround = true;
          break;
        }
      }
    } else if (entity.vy < 0) {
      // 往上（撞到磚塊）
      const top = entity.y - entity.h / 2;
      const left = entity.x - entity.w / 2 + 6;
      const right = entity.x + entity.w / 2 - 6;
      for (let x = left; x <= right; x += TILE / 2) {
        const tx = worldToTile(x), ty = worldToTile(top);
        if (ty >= 0 && level[ty][tx] === 2) {
          // 頂到方塊，彈回
          level[ty][tx] = 0;
          entity.vy = 2;
          // 隨機掉出一枚金幣
          coins.add(`${tx},${ty-1}`);
          level[ty-1][tx] = 3;
        }
        if (rectVsTileSolid(x, top)) {
          entity.y = Math.floor(top / TILE) * TILE + TILE + entity.h / 2 + 0.01;
          entity.vy = 0;
          break;
        }
      }
    }
  }

  // 收集金幣
  let score = 0;
  const scoreEl = document.getElementById('score');
  function collectCoins(entity) {
    const cx = worldToTile(entity.x);
    const cy = worldToTile(entity.y);
    for (let y = cy - 1; y <= cy + 1; y++) {
      for (let x = cx - 1; x <= cx + 1; x++) {
        if (y < 0 || y >= LEVEL_H || x < 0 || x >= LEVEL_W) continue;
        if (level[y][x] === 3) {
          const rx = x * TILE + TILE/2;
          const ry = y * TILE + TILE/2;
          if (Math.abs(entity.x - rx) < 26 && Math.abs(entity.y - ry) < 26) {
            level[y][x] = 0;
            coins.delete(`${x},${y}`);
            score += 10;
            scoreEl.textContent = score;
            // 小彈跳效果
            entity.vy = Math.min(entity.vy, -3);
          }
        }
      }
    }
  }

  // 輸入（鍵盤）
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'z' || e.key === 'Z' || e.key === ' ') keys.jump = true;
    if (e.key === 'x' || e.key === 'X') keys.action = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'z' || e.key === 'Z' || e.key === ' ') keys.jump = false;
    if (e.key === 'x' || e.key === 'X') keys.action = false;
  });

  // 觸控（按鈕）
  const btn = (id) => document.getElementById(id);
  const bindHold = (el, prop) => {
    const on = () => { keys[prop] = true; el.classList.add('hold'); };
    const off = () => { keys[prop] = false; el.classList.remove('hold'); };
    const start = (e) => { e.preventDefault(); on(); };
    const end = (e) => { e.preventDefault(); off(); };
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('pointerleave', end);
  };
  bindHold(btn('left'), 'left');
  bindHold(btn('right'), 'right');
  bindHold(btn('jump'), 'jump');
  bindHold(btn('action'), 'action');

  // 遊戲主迴圈
  let last = 0;
  function loop(t) {
    const dt = Math.min(32, t - last); // 限制最大時間步長
    last = t;
    update(dt / 16.6667);
    render();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    // 水平輸入
    if (keys.left) player.vx -= MOVE_SPEED * dt;
    if (keys.right) player.vx += MOVE_SPEED * dt;

    // 速度限制
    player.vx = Math.max(Math.min(player.vx, MAX_RUN), -MAX_RUN);

    // 跳躍
    if (keys.jump && player.onGround) {
      player.vy = JUMP_VEL;
      player.onGround = false;
    }

    // 重力
    player.vy += GRAVITY * dt * 60;
    if (player.vy > 24) player.vy = 24;

    // 摩擦
    if (player.onGround && !keys.left && !keys.right) {
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < 0.05) player.vx = 0;
    }

    // 面向
    if (player.vx !== 0) player.facing = player.vx > 0 ? 1 : -1;

    // 碰撞
    resolveCollisions(player);

    // 收集
    collectCoins(player);

    // 相機跟隨
    camera.x = Math.max(0, Math.min(player.x - canvas.width / 2, LEVEL_W * TILE - canvas.width));
    camera.y = 0;
  }

  function render() {
    // 天空背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 遠景雲（簡單）
    for (let i = 0; i < 6; i++) {
      const cx = (i * 300 - (camera.x * 0.4) % 300);
      const cy = 60 + (i % 2) * 40;
      drawCloud(cx, cy); drawCloud(cx + 150, cy + 15);
    }

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // 磚塊 & 地板
    for (let y = 0; y < LEVEL_H; y++) {
      for (let x = 0; x < LEVEL_W; x++) {
        const t = level[y][x];
        const px = x * TILE, py = y * TILE;
        if (t === 1) drawGround(px, py);
        if (t === 2) drawBrick(px, py);
        if (t === 3) drawCoin(px + TILE/2, py + TILE/2);
      }
    }

    // 玩家（簡易像素小人）
    drawPlayer(player);

    ctx.restore();

    // 地平線
    ctx.fillStyle = '#72bf53';
    ctx.fillRect(0, canvas.height - 28, canvas.width, 28);
  }

  // ====== 美術繪製（全部用程式畫，無外部素材） ======
  function drawGround(x, y) {
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#976939';
    for (let i = 0; i < 2; i++) {
      ctx.fillRect(x, y + i * 24, TILE, 2);
    }
    ctx.fillStyle = '#6b3f17';
    ctx.fillRect(x, y + 32, TILE, 16);
  }

  function drawBrick(x, y) {
    ctx.fillStyle = '#b84a2b';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.lineWidth = 2;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.strokeRect(x + c * 16 + 1, y + r * 16 + 1, 14, 14);
      }
    }
  }

  function drawCoin(cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    const t = (performance.now() / 200) % (Math.PI * 2);
    const scaleX = Math.abs(Math.cos(t)) * 0.8 + 0.2;
    ctx.scale(scaleX, 1);
    ctx.beginPath();
    ctx.fillStyle = '#ffd400';
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffea80';
    ctx.fillRect(-3, -6, 6, 12);
    ctx.restore();
  }

  function drawCloud(x, y) {
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 6, 18, 0, Math.PI * 2);
    ctx.arc(x - 24, y + 6, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayer(p) {
    const x = p.x, y = p.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(p.facing, 1);

    // 腳
    ctx.fillStyle = '#3b3b3b';
    ctx.fillRect(-12, 18, 10, 8);
    ctx.fillRect(2, 18, 10, 8);

    // 身體
    ctx.fillStyle = '#e83f3f';
    ctx.fillRect(-14, -8, 28, 24);

    // 頭
    ctx.fillStyle = '#f0c090';
    ctx.fillRect(-12, -28, 24, 20);

    // 帽子
    ctx.fillStyle = '#d22f2f';
    ctx.fillRect(-12, -32, 24, 8);
    ctx.fillRect(-12, -32, 26, 4);

    // 眼睛
    ctx.fillStyle = '#222';
    ctx.fillRect(-4, -20, 4, 4);
    ctx.fillRect(2, -20, 4, 4);

    ctx.restore();
  }

  // 啟動
  requestAnimationFrame(loop);
})();