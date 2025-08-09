// 版本號（Semantic Versioning）
const VERSION = (window.__APP_VERSION__ || "1.3.2");

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // ===== Logger（JSON Lines, ISO 8601, level） =====
  const Logger = (() => {
    const BUF_MAX = 600;
    const buf = [];
    const pre = () => document.getElementById('log-lines');
    const nowISO = () => new Date().toISOString(); // RFC3339 / ISO 8601 (UTC)
    function push(level, evt, data) {
      const rec = { ts: nowISO(), level, evt };
      if (data && typeof data === 'object' && Object.keys(data).length) rec.data = data;
      const line = JSON.stringify(rec);
      buf.push(line); if (buf.length > BUF_MAX) buf.shift();
      const el = pre();
      if (el) { el.textContent = buf.join('\n'); el.scrollTop = el.scrollHeight; }
    }
    return {
      trace: (evt, data) => push('TRACE', evt, data),
      debug: (evt, data) => push('DEBUG', evt, data),
      info:  (evt, data) => push('INFO',  evt, data),
      warn:  (evt, data) => push('WARN',  evt, data),
      error: (evt, data) => push('ERROR', evt, data),
      lines: () => buf.slice(),
      clear: () => { buf.length = 0; const el = pre(); if (el) el.textContent = ''; },
    };
  })();
  window.LOG = Logger;

  const logCopyBtn = document.getElementById('log-copy');
  const logClearBtn = document.getElementById('log-clear');
  if (logCopyBtn) logCopyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(Logger.lines().join('\n')); } catch(_) {}
  });
  if (logClearBtn) logClearBtn.addEventListener('click', () => Logger.clear());

  // 聚焦與鍵盤防捲動
  canvas.setAttribute('tabindex', '0');
  function refocus(e){ try { if(e) e.preventDefault(); canvas.focus(); } catch(_){} }
  window.addEventListener('load', () => { refocus(); setVersionBadge(); Logger.info('app_start', {version: VERSION}); });
  window.addEventListener('pointerdown', (e)=>{ Logger.debug('pointerdown', {x:e.clientX,y:e.clientY}); refocus(e); }, { passive:false });
  window.addEventListener('touchstart', (e)=>{ Logger.debug('touchstart', {points: e.touches?.length||0}); refocus(e); }, { passive:false });
  window.addEventListener('keydown', (e) => {
    const c = e.code || e.key;
    if (c === 'Space' || c === 'ArrowUp' || c === 'ArrowDown' || c === 'ArrowLeft' || c === 'ArrowRight') e.preventDefault();
  }, { passive:false });

  function setVersionBadge(){
    const el = document.getElementById('version-pill');
    if (el) el.textContent = `v${VERSION}`;
  }

  // === 遊戲常數 ===
  const TILE = 48;
  const GRAVITY = 0.88;
  const FRICTION = 0.8;
  const MOVE_SPEED = 0.7;
  const MAX_RUN = 5.2;
  const JUMP_VEL = -17.8;

  // 關卡
  const LEVEL_H = 12;
  const LEVEL_W = 100;
  const level = Array.from({ length: LEVEL_H }, (_, y) => {
    const row = Array.from({ length: LEVEL_W }, () => 0);
    if (y >= LEVEL_H - 2) row.fill(1); // 地板
    return row;
  });
  for (let x = 10; x < 15; x++) level[8][x] = 2;
  for (let x = 20; x < 23; x++) level[7][x] = 2, level[8][x] = 2;
  for (let x = 30; x < 36; x++) level[9][x] = 2;
  for (let x = 45; x < 48; x++) level[6][x] = 2;
  for (let x = 70; x < 76; x++) level[9][x] = 2;

  // 右邊終點（旗竿區域）
  const GOAL_X = (LEVEL_W - 3) * TILE;
  const GOAL_LINE = GOAL_X + TILE; // 末端前三格
  // 左邊停止點（不可穿越）
  const LEFT_STOP_X = 12; // 角色中心最小 x

  // 金幣
  const coins = new Set();
  const addCoin = (cx, cy) => { level[cy][cx] = 3; coins.add(`${cx},${cy}`); };
  addCoin(12, 7); addCoin(21, 6); addCoin(31, 8); addCoin(33, 8); addCoin(46, 5); addCoin(72, 8);

  // 玩家
  const player = {
    x: 3 * TILE, y: 6 * TILE, w: 28, h: 40,
    vx: 0, vy: 0, onGround: false, facing: 1
  };

  const camera = { x: 0, y: 0 };
  const keys = { left: false, right: false, jump: false, action: false };

  let elapsedMs = 0;

  // 跳躍緩衝 / 土狼
  let jumpBufferMs = 0, coyoteMs = 0;
  const JUMP_BUFFER_MAX = 120, COYOTE_MAX = 100;
  let dbgPress = 0, dbgFired = 0;

  // 狀態：進行中 / 過關
  let cleared = false;
  const celebrateEl = document.getElementById('celebrate');
  const replayBtn = document.getElementById('btn-replay');
if (celebrateEl) { celebrateEl.hidden = true; LOG.debug("stage_clear_hide"); }
  if (replayBtn) replayBtn.addEventListener('click', () => location.reload());

  function pressJump(src){ jumpBufferMs = JUMP_BUFFER_MAX; keys.jump = true; dbgPress++; Logger.debug('jump_press', {src}); }
  function releaseJump(){ keys.jump = false; }

  // 偵錯 HUD
  const dbg = {
    fpsEl: document.getElementById('dbg-fps'),
    posEl: document.getElementById('dbg-pos'),
    velEl: document.getElementById('dbg-vel'),
    groundEl: document.getElementById('dbg-ground'),
    coyoteEl: document.getElementById('dbg-coyote'),
    bufferEl: document.getElementById('dbg-buffer'),
    keysEl: document.getElementById('dbg-keys'),
    pressEl: document.getElementById('dbg-press'),
    firedEl: document.getElementById('dbg-fired'),
  };
  let fpsLast = performance.now(), fpsCnt = 0, fpsVal = 0;
  function updFps(t){
    fpsCnt++;
    if (t - fpsLast >= 250){
      const now = performance.now();
      fpsVal = Math.round(1000 * fpsCnt / (now - fpsLast));
      fpsLast = now; fpsCnt = 0;
      if (dbg.fpsEl) dbg.fpsEl.textContent = `${fpsVal}`;
    }
  }

  const worldToTile = (px) => Math.floor(px / TILE);
  const rectVsTileSolid = (x, y) => {
    const tx = worldToTile(x), ty = worldToTile(y);
    if (ty < 0 || ty >= LEVEL_H || tx < 0 || tx >= LEVEL_W) return 0;
    const t = level[ty][tx];
    return (t === 1 || t === 2) ? t : 0;
  };

  function resolveCollisions(entity) {
    // 水平
    entity.x += entity.vx;
    if (entity.vx < 0) {
      const left = entity.x - entity.w / 2;
      const top = entity.y - entity.h / 2 + 4;
      const bottom = entity.y + entity.h / 2 - 1;
      for (let y = top; y <= bottom; y += TILE / 2) {
        if (rectVsTileSolid(left, y)) {
          entity.x = Math.floor(left / TILE) * TILE + TILE + entity.w / 2 + 0.01;
          entity.vx = 0; break;
        }
      }
    }
    if (entity.vx > 0) {
      const right = entity.x + entity.w / 2;
      const top = entity.y - entity.h / 2 + 4;
      const bottom = entity.y + entity.h / 2 - 1;
      for (let y = top; y <= bottom; y += TILE / 2) {
        if (rectVsTileSolid(right, y)) {
          entity.x = Math.floor(right / TILE) * TILE - entity.w / 2 - 0.01;
          entity.vx = 0; break;
        }
      }
    }

    // 垂直
    entity.y += entity.vy;
    const wasGround = entity.onGround;
    entity.onGround = false;
    if (entity.vy > 0) {
      const bottom = entity.y + entity.h / 2;
      const left = entity.x - entity.w / 2 + 6;
      const right = entity.x + entity.w / 2 - 6;
      for (let x = left; x <= right; x += TILE / 2) {
        if (rectVsTileSolid(x, bottom)) {
          entity.y = Math.floor(bottom / TILE) * TILE - entity.h / 2 - 0.01;
          entity.vy = 0; entity.onGround = true; break;
        }
      }
    } else if (entity.vy < 0) {
      const top = entity.y - entity.h / 2;
      const left = entity.x - entity.w / 2 + 6;
      const right = entity.x + entity.w / 2 - 6;
      for (let x = left; x <= right; x += TILE / 2) {
        const tx = worldToTile(x), ty = worldToTile(top);
        if (ty >= 0 && level[ty][tx] === 2) {
          level[ty][tx] = 0; entity.vy = 2;
          Logger.info('brick_hit', {tx,ty});
          coins.add(`${tx},${ty-1}`); level[ty-1][tx] = 3;
        }
        if (rectVsTileSolid(x, top)) {
          entity.y = Math.floor(top / TILE) * TILE + TILE + entity.h / 2 + 0.01;
          entity.vy = 0; break;
        }
      }
    }
    if (!wasGround && entity.onGround) Logger.debug('ground_enter', {y: entity.y});
    if (wasGround && !entity.onGround) Logger.debug('ground_leave', {y: entity.y});
  }

  // 分數 / 金幣（拿掉向上彈的效果）
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
            level[y][x] = 0; coins.delete(`${x},${y}`);
            score += 10; if (scoreEl) scoreEl.textContent = score;
            Logger.info('coin_collect', {x, y, score});
          }
        }
      }
    }
  }

  // 鍵盤輸入
  window.addEventListener('keydown', (e) => {
    if (cleared) return;
    const code = e.code || e.key;
    if (code === 'ArrowLeft') { e.preventDefault(); keys.left = true; }
    if (code === 'ArrowRight'){ e.preventDefault(); keys.right = true; }
    if (code === 'KeyZ' || code === 'Space') { e.preventDefault(); pressJump('kb'); }
    if (code === 'KeyX') { e.preventDefault(); keys.action = true; Logger.debug('action', {src:'kb'}); }
  }, { passive:false });
  window.addEventListener('keyup', (e) => {
    const code = e.code || e.key;
    if (code === 'ArrowLeft') keys.left = false;
    if (code === 'ArrowRight') keys.right = false;
    if (code === 'KeyZ' || code === 'Space') releaseJump();
    if (code === 'KeyX') keys.action = false;
  });

  // 觸控（pointer + touch 後援）
  const btn = (id) => document.getElementById(id);
  const bindHold = (el, prop) => {
    if (!el) return;
    const on = () => { if (cleared) return; keys[prop] = true; el.classList.add('hold'); if (prop === 'jump') pressJump('touch'); };
    const off = () => { if (prop === 'jump') releaseJump(); keys[prop] = false; el.classList.remove('hold'); };
    const start = (e) => { e.preventDefault(); on(); };
    const end = (e) => { e.preventDefault(); off(); };
    el.addEventListener('pointerdown', start, { passive:false });
    el.addEventListener('pointerup', end, { passive:false });
    el.addEventListener('pointercancel', end, { passive:false });
    el.addEventListener('pointerleave', end, { passive:false });
    el.addEventListener('touchstart', (e)=>{ e.preventDefault(); on(); }, { passive:false });
    el.addEventListener('touchend',   (e)=>{ e.preventDefault(); off(); }, { passive:false });
    el.addEventListener('touchcancel',(e)=>{ e.preventDefault(); off(); }, { passive:false });
  };
  bindHold(btn('left'), 'left');
  bindHold(btn('right'), 'right');
  bindHold(btn('jump'), 'jump');
  bindHold(btn('action'), 'action');

  // 主迴圈
  let last = 0;
  function loop(t) {
    const dt = Math.min(32, t - last);
    last = t;
    update(dt / 16.6667);
    render();
    updFps(t);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    elapsedMs += dt * 16.6667;
    if (!cleared && celebrateEl && !celebrateEl.hidden) { celebrateEl.hidden = true; LOG.debug("stage_clear_force_hide"); }
    if (cleared) { // 過關後讓角色慢慢停下
      player.vx *= 0.9;
      player.vy = Math.min(player.vy + 0.6 * dt, 8);
      resolveCollisions(player);
      camera.x = Math.max(0, Math.min(player.x - canvas.width / 2, LEVEL_W * TILE - canvas.width));
          // 更新偵錯 HUD（補回）
      const round = (n) => Math.round(n);
      if (dbg.posEl)   dbg.posEl.textContent   = `${round(player.x)}, ${round(player.y)}`;
      if (dbg.velEl)   dbg.velEl.textContent   = `${player.vx.toFixed(2)}, ${player.vy.toFixed(2)}`;
      if (dbg.groundEl)dbg.groundEl.textContent= player.onGround ? '✔' : '—';
      if (dbg.coyoteEl)dbg.coyoteEl.textContent= `${Math.ceil(coyoteMs)}`;
      if (dbg.bufferEl)dbg.bufferEl.textContent= `${Math.ceil(jumpBufferMs)}`;
      const k = `${keys.left?'L':''}${keys.right?'R':''}${keys.jump?'/J':''}${keys.action?'/X':''}`;
      if (dbg.keysEl)  dbg.keysEl.textContent  = k || '—';
      if (dbg.pressEl) dbg.pressEl.textContent = `${dbgPress}`;
      if (dbg.firedEl) dbg.firedEl.textContent = `${dbgFired}`;
      return;
    }

    const dtMs = dt * 16.6667;

    if (keys.left) player.vx -= MOVE_SPEED * dt;
    if (keys.right) player.vx += MOVE_SPEED * dt;
    player.vx = Math.max(Math.min(player.vx, MAX_RUN), -MAX_RUN);

    // 左邊停止點（不可超過）
    if (player.x < LEFT_STOP_X) { player.x = LEFT_STOP_X; if (player.vx < 0) player.vx = 0; }

    // 土狼時間 / 緩衝
    if (player.onGround) coyoteMs = COYOTE_MAX; else coyoteMs = Math.max(0, coyoteMs - dtMs);
    jumpBufferMs = Math.max(0, jumpBufferMs - dtMs);

    if (jumpBufferMs > 0 && (player.onGround || coyoteMs > 0)) {
      player.vy = JUMP_VEL;
      player.onGround = false;
      jumpBufferMs = 0; coyoteMs = 0;
      dbgFired++; Logger.info('jump_fired', {vy: player.vy});
    }

    // 正確的重力積分（不要再 *60）
    player.vy += GRAVITY * dt;
    if (player.vy > 24) player.vy = 24;

    if (player.onGround && !keys.left && !keys.right) {
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < 0.05) player.vx = 0;
    }

    if (player.vx !== 0) player.facing = player.vx > 0 ? 1 : -1;

    resolveCollisions(player);
    collectCoins(player);

    // 檢查過關（到達右端）
    const playerRight = player.x + player.w / 2;
    if (elapsedMs >= 1200 && playerRight >= GOAL_LINE) triggerClear();

    camera.x = Math.max(0, Math.min(player.x - canvas.width / 2, LEVEL_W * TILE - canvas.width));
  }

  function triggerClear(){
    if (cleared) return;
    cleared = true;
    keys.left = keys.right = keys.jump = keys.action = false;
    Logger.info('stage_clear', {score});
    if (celebrateEl) celebrateEl.hidden = false;
    // 簡單煙火粒子
    spawnFireworks();
  }

  // --- 粒子煙火（簡單版） ---
  const fireworks = [];
  function spawnFireworks(){
    for (let n=0;n<6;n++){
      const cx = (Math.random()*0.6+0.2)*canvas.width;
      const cy = (Math.random()*0.3+0.15)*canvas.height;
      const color = `hsl(${Math.floor(Math.random()*360)},90%,60%)`;
      for (let i=0;i<60;i++){
        const a = Math.random()*Math.PI*2;
        const s = Math.random()*3+1.5;
        fireworks.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:60,color});
      }
    }
  }
  function renderFireworks(){
    for (const p of fireworks){
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.life/60, 0);
      ctx.fillRect(p.x, p.y, 2, 2);
      p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life -= 1;
    }
    ctx.globalAlpha = 1;
    for (let i=fireworks.length-1;i>=0;i--) if (fireworks[i].life<=0) fireworks.splice(i,1);
  }

  // --- 繪製 ---
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 雲
    for (let i = 0; i < 6; i++) {
      const cx = (i * 300 - (camera.x * 0.4) % 300);
      const cy = 60 + (i % 2) * 40;
      drawCloud(cx, cy); drawCloud(cx + 150, cy + 15);
    }
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // 地形 / 磚 / 金幣
    for (let y = 0; y < LEVEL_H; y++) {
      for (let x = 0; x < LEVEL_W; x++) {
        const t = level[y][x];
        const px = x * TILE, py = y * TILE;
        if (t === 1) drawGround(px, py);
        if (t === 2) drawBrick(px, py);
        if (t === 3) drawCoin(px + TILE/2, py + TILE/2);
      }
    }

    // 右端終點旗竿
    drawGoal(GOAL_X, (LEVEL_H-2)*TILE);

    drawPlayer(player);
    ctx.restore();

    // 前景地面
    ctx.fillStyle = '#72bf53';
    ctx.fillRect(0, canvas.height - 28, canvas.width, 28);

    // 慶祝粒子
    if (cleared) renderFireworks();
  }

  function drawGoal(x, groundY){
    // 旗桿
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x+TILE, groundY - TILE*6, 6, TILE*6);
    // 旗子
    const t = performance.now()/500;
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.moveTo(x+TILE+6, groundY - TILE*6 + 10);
    ctx.lineTo(x+TILE+6+28, groundY - TILE*6 + 18 + Math.sin(t)*3);
    ctx.lineTo(x+TILE+6, groundY - TILE*6 + 26);
    ctx.closePath(); ctx.fill();
  }

  function drawGround(x, y) {
    ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#976939'; for (let i = 0; i < 2; i++) ctx.fillRect(x, y + i * 24, TILE, 2);
    ctx.fillStyle = '#6b3f17'; ctx.fillRect(x, y + 32, TILE, 16);
  }
  function drawBrick(x, y) {
    ctx.fillStyle = '#b84a2b'; ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.strokeRect(x + c * 16 + 1, y + r * 16 + 1, 14, 14);
  }
  function drawCoin(cx, cy) {
    ctx.save(); ctx.translate(cx, cy);
    const t = (performance.now() / 200) % (Math.PI * 2);
    const scaleX = Math.abs(Math.cos(t)) * 0.8 + 0.2;
    ctx.scale(scaleX, 1);
    ctx.beginPath(); ctx.fillStyle = '#ffd400'; ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffea80'; ctx.fillRect(-3, -6, 6, 12); ctx.restore();
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
    ctx.save(); ctx.translate(x, y); ctx.scale(p.facing, 1);
    ctx.fillStyle = '#3b3b3b'; ctx.fillRect(-12, 18, 10, 8); ctx.fillRect(2, 18, 10, 8);
    ctx.fillStyle = '#e83f3f'; ctx.fillRect(-14, -8, 28, 24);
    ctx.fillStyle = '#f0c090'; ctx.fillRect(-12, -28, 24, 20);
    ctx.fillStyle = '#d22f2f'; ctx.fillRect(-12, -32, 24, 8); ctx.fillRect(-12, -32, 26, 4);
    ctx.fillStyle = '#222'; ctx.fillRect(-4, -20, 4, 4); ctx.fillRect(2, -20, 4, 4);
    ctx.restore();
  }

  requestAnimationFrame(loop);
})();
