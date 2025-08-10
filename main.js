import { TILE, resolveCollisions, collectCoins, TRAFFIC_LIGHT, isJumpBlocked } from './src/game/physics.js';
import { advanceLight } from './src/game/trafficLight.js';
/* v1.4.8 */
const VERSION = (window.__APP_VERSION__ || "1.4.8");

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const gameWrap = document.getElementById('game-wrap');

  const sounds = {
    jump: new Audio('assets/sounds/jump.wav'),
    impact: new Audio('assets/sounds/impact.wav'),
    slide: new Audio('assets/sounds/slide.wav'),
    clear: new Audio('assets/sounds/clear.wav'),
    coin: new Audio('assets/sounds/coin.wav'),
    fail: new Audio('assets/sounds/fail.wav'),
  };
  function playSound(name) {
    const s = sounds[name];
    if (s) {
      s.currentTime = 0;
      s.play();
    }
  }

  // Logger（記憶體緩衝，不自動清除）
  const Logger = (() => {
    const BUF_MAX = 400;
    const buf = [];
    const nowISO = () => new Date().toISOString();
    async function copy() { try{ await navigator.clipboard.writeText(buf.join('\n')); }catch(e){} }
    function clear() { buf.length = 0; }
    function push(level, evt, data){
      const rec = { ts: nowISO(), level, evt };
      if (data && typeof data === 'object' && Object.keys(data).length) rec.data = data;
      buf.push(JSON.stringify(rec)); if (buf.length>BUF_MAX) buf.shift();
    }
    return { copy, clear, push,
      info:(e,d)=>push('INFO',e,d), debug:(e,d)=>push('DEBUG',e,d), error:(e,d)=>push('ERROR',e,d) };
  })();
  document.getElementById('log-copy').addEventListener('click', ()=>Logger.copy());
  document.getElementById('log-clear').addEventListener('click', ()=>Logger.clear());
  Logger.info('app_start', { version: VERSION });

  // 讓 canvas 聚焦（鍵盤可用）
  canvas.setAttribute('tabindex', '0');
  function refocus(e){ try{ if(e) e.preventDefault(); canvas.focus(); }catch(_){} }
  window.addEventListener('load', ()=>{ refocus(); setVersionBadge(); });
  window.addEventListener('pointerdown', (e)=>{ refocus(e); }, {passive:false});

  function setVersionBadge(){
    const el = document.getElementById('version-pill'); if (el) el.textContent = `v${VERSION}`;
  }

  // === 常數 ===
  const GRAVITY = 0.88;
  const FRICTION = 0.8;
  const MOVE_SPEED = 0.7;
  const MAX_RUN = 5.2;
  const JUMP_VEL = -17.8;
  const SLIDE_SPEED = 9;
  const SLIDE_TIME = 200; // ms

  // === 關卡 ===
  const LEVEL_W = 100, LEVEL_H = 12;
  const level = Array.from({length:LEVEL_H}, (_,y)=>{
    const row = Array.from({length:LEVEL_W}, ()=>0);
    if (y >= LEVEL_H-2) row.fill(1);
    return row;
  });
  for (let x=10;x<16;x++) level[8][x]=2;
  for (let x=30;x<36;x++) level[9][x]=2;
  for (let x=46;x<49;x++) level[6][x]=2;
  for (let x=70;x<76;x++) level[9][x]=2;
  // 右邊終點線
  const GOAL_X = 90*TILE;

  // 金幣
  const coins = new Set();
  const addCoin = (cx,cy)=>{ level[cy][cx]=3; coins.add(`${cx},${cy}`); };
  addCoin(12,7); addCoin(33,8); addCoin(21,6); addCoin(31,8); addCoin(46,5); addCoin(72,8);

  // Keep a pristine copy of the level layout (coins/bricks) for restarting
  const initialLevel = level.map(row => row.slice());

  // 交通號誌
  let lights = {};
  function spawnLights(){
    // remove old lights
    for(const k in lights){
      const [lx,ly] = k.split(',').map(Number);
      if(level[ly][lx] === TRAFFIC_LIGHT) level[ly][lx] = 0;
    }
    lights = {};
    let placed = 0;
    while(placed < 3){
      const x = Math.floor(Math.random()*LEVEL_W);
      if(level[9][x] === 0 && level[10][x] === 1){
        level[9][x] = TRAFFIC_LIGHT;
        const states = ['red','yellow','green'];
        lights[`${x},9`] = { state: states[Math.floor(Math.random()*states.length)], timer:0 };
        placed++;
      }
    }
  }
  spawnLights();

  // 玩家與相機
  const player = { x: 3*TILE, y: 6*TILE, w:28, h:40, vx:0, vy:0, onGround:false, facing:1, sliding:0 };
  const camera = { x:0, y:0 };

  // 輸入
  const keys = { left:false, right:false, jump:false, action:false };
  window.addEventListener('keydown', (e)=>{
    const c = e.code || e.key;
    if (c==='ArrowLeft'){ e.preventDefault(); keys.left=true; }
    if (c==='ArrowRight'){ e.preventDefault(); keys.right=true; }
    if (c==='KeyZ' || c==='Space'){ e.preventDefault(); pressJump('kb'); }
    if (c==='KeyX'){ e.preventDefault(); keys.action=true; }
  }, {passive:false});
  window.addEventListener('keyup', (e)=>{
    const c = e.code || e.key;
    if (c==='ArrowLeft') keys.left=false;
    if (c==='ArrowRight') keys.right=false;
    if (c==='KeyZ' || c==='Space') releaseJump();
    if (c==='KeyX') keys.action=false;
  });

  // 觸控
  const bindHold = (id, prop) => {
    const el = document.getElementById(id); if (!el) return;
    const on = () => { keys[prop]=true; el.classList.add('hold'); if (prop==='jump') pressJump('touch'); };
    const off = () => { if (prop==='jump') releaseJump(); keys[prop]=false; el.classList.remove('hold'); };
    const start = e=>{ e.preventDefault(); on(); }, end = e=>{ e.preventDefault(); off(); };
    el.addEventListener('pointerdown', start, {passive:false});
    el.addEventListener('pointerup', end, {passive:false});
    el.addEventListener('pointerleave', end, {passive:false});
    el.addEventListener('touchstart', start, {passive:false});
    el.addEventListener('touchend', end, {passive:false});
    el.addEventListener('touchcancel', end, {passive:false});
  };
  bindHold('left','left'); bindHold('right','right'); bindHold('jump','jump'); bindHold('action','action');

  // 跳躍緩衝 & 土狼時間
  let jumpBufferMs=0, coyoteMs=0;
  const JUMP_BUFFER_MAX=120, COYOTE_MAX=100;
  let dbgPress=0, dbgFired=0;
  function pressJump(src){ jumpBufferMs=JUMP_BUFFER_MAX; keys.jump=true; dbgPress++; Logger.debug('jump_press',{src}); }
  function releaseJump(){ keys.jump=false; }

  // 工具
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
  let fpsLast=performance.now(), fpsCnt=0, fpsVal=0;
  function updFps(t){ fpsCnt++; if (t-fpsLast>=250){ const now=performance.now(); fpsVal=Math.round(1000*fpsCnt/(now-fpsLast)); fpsLast=now; fpsCnt=0; if(dbg.fpsEl) dbg.fpsEl.textContent = `${fpsVal}`; } }
  // 分數 & 金幣
  let score=0; const scoreEl = document.getElementById('score');
  // 計時器
  let timeLeftMs = 60000;
  const timerEl = document.getElementById('timer');
  // 完關 / 失敗
  let stageCleared = false;
  let stageFailed = false;
  const stageClearEl = document.getElementById('stage-clear');
  const stageFailEl = document.getElementById('stage-fail');
  function triggerClearEffect(){
    if (!stageClearEl) return;
    const fx = document.createElement('img');
    fx.src = 'assets/clear-star.svg';
    fx.alt = '';
    fx.className = 'clear-effect';
    stageClearEl.appendChild(fx);
    setTimeout(()=>fx.remove(),1500);
  }
  function triggerSlideEffect(x, y, facing){
    if (!gameWrap) return;
    const fx = document.createElement('img');
    fx.src = 'assets/slide-dust.svg';
    fx.alt = '';
    fx.className = 'slide-effect';
    fx.style.left = `${x}px`;
    fx.style.top = `${y}px`;
    fx.style.setProperty('--sx', facing);
    gameWrap.appendChild(fx);
    setTimeout(()=>fx.remove(),500);
  }
  function triggerFailEffect(){
    if (!gameWrap) return;
    const fx = document.createElement('div');
    fx.className = 'fail-effect';
    gameWrap.appendChild(fx);
    setTimeout(()=>fx.remove(),1000);
  }
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) btnRestart.addEventListener('click', ()=> restartStage());
  const btnRestartFail = document.getElementById('btn-restart-fail');
  if (btnRestartFail) btnRestartFail.addEventListener('click', ()=> restartStage());
  function maybeClear(){
    if (!stageCleared && !stageFailed && player.x >= GOAL_X){
      stageCleared = true;
      if (stageClearEl) {
        stageClearEl.hidden = false;
        triggerClearEffect();
      }
      playSound('clear');
      Logger.info('stage_clear', {score});
    }
  }
  function restartStage(){
    // 重設玩家與狀態，但不清除 LOG（依你的需求）
    player.x = 3*TILE; player.y = 6*TILE; player.vx=0; player.vy=0; player.onGround=false; player.sliding=0;
    camera.x=0; stageCleared=false; stageFailed=false;
    if (stageClearEl) stageClearEl.hidden = true;
    if (stageFailEl) stageFailEl.hidden = true;
    score=0; if (scoreEl) scoreEl.textContent = score;
    timeLeftMs = 60000; if (timerEl) timerEl.textContent = 60;

    // Restore level layout and coin positions
    coins.clear();
    for(let y=0;y<LEVEL_H;y++){
      for(let x=0;x<LEVEL_W;x++){
        level[y][x] = initialLevel[y][x];
        if (initialLevel[y][x] === 3) coins.add(`${x},${y}`);
      }
    }
    spawnLights();
  }

  // 主要迴圈
  let last=0;
  function loop(t){
    const dt = Math.min(32, t-last); last=t;
    update(dt/16.6667);
    render();
    updFps(t);
    requestAnimationFrame(loop);
  }

  function update(dt){
    const dtMs = dt*16.6667;
    if (!stageCleared && !stageFailed) {
      timeLeftMs = Math.max(0, timeLeftMs - dtMs);
      if (timerEl) timerEl.textContent = Math.ceil(timeLeftMs / 1000);
      if (timeLeftMs <= 0) {
        stageFailed = true;
        if (stageFailEl) {
          stageFailEl.hidden = false;
          triggerFailEffect();
        }
        playSound('fail');
        Logger.info('stage_fail', {score});
      }
    }

    if (player.sliding > 0) {
      player.sliding = Math.max(0, player.sliding - dtMs);
      player.vx = player.facing * SLIDE_SPEED;
    } else {
      if (keys.left) player.vx -= MOVE_SPEED*dt;
      if (keys.right) player.vx += MOVE_SPEED*dt;
      player.vx = Math.max(Math.min(player.vx, MAX_RUN), -MAX_RUN);
      if (keys.action && player.onGround) {
        player.sliding = SLIDE_TIME;
        player.vx = player.facing * SLIDE_SPEED;
        triggerSlideEffect(player.x - camera.x, player.y - camera.y + player.h/2, player.facing);
        playSound('slide');
        keys.action = false;
      }
    }

    // 土狼/緩衝
    if (player.onGround) coyoteMs = COYOTE_MAX; else coyoteMs = Math.max(0, coyoteMs - dtMs);
    jumpBufferMs = Math.max(0, jumpBufferMs - dtMs);

    if (jumpBufferMs>0 && (player.onGround || coyoteMs>0)){
      if (!isJumpBlocked(player, lights)) {
        player.vy = JUMP_VEL;
        player.onGround = false; jumpBufferMs=0; coyoteMs=0;
        playSound('jump');
        dbgFired++; Logger.info('jump_fired', {vy:player.vy});
      } else {
        jumpBufferMs = 0;
        Logger.info('jump_blocked', { reason: 'red_light' });
      }
    }

    // ★ 正確重力：不要再 *60
    player.vy += GRAVITY * dt;
    if (player.vy>24) player.vy=24;

    if (player.onGround && player.sliding <= 0 && !keys.left && !keys.right){
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < .05) player.vx = 0;
    }

    if (player.vx !== 0) player.facing = player.vx>0 ? 1 : -1;

    // update traffic lights
    for (const key in lights) {
      advanceLight(lights[key], dtMs);
    }

    const collisionEvents = {};
    resolveCollisions(player, level, lights, collisionEvents);
    const gained = collectCoins(player, level, coins);
    if (collisionEvents.impact) playSound('impact');
    if (gained) {
      score += gained;
      if (scoreEl) scoreEl.textContent = score;
      playSound('coin');
    }
    maybeClear();

    // 相機（限制左界，避免掉出畫外；右側保留 0~關卡寬）
    camera.x = Math.max(0, Math.min(player.x - canvas.width/2, LEVEL_W*TILE - canvas.width));
    camera.y = 0;

    // 更新 HUD（數字不跳動：四捨五入/固定小數）
    const round = (n)=>Math.round(n);
    if (dbg.posEl) dbg.posEl.textContent = `${round(player.x)}, ${round(player.y)}`;
    if (dbg.velEl) dbg.velEl.textContent = `${player.vx.toFixed(2)}, ${player.vy.toFixed(2)}`;
    if (dbg.groundEl) dbg.groundEl.textContent = player.onGround ? '✔' : '—';
    if (dbg.coyoteEl) dbg.coyoteEl.textContent = `${Math.ceil(coyoteMs)}`;
    if (dbg.bufferEl) dbg.bufferEl.textContent = `${Math.ceil(jumpBufferMs)}`;
    const k = `${keys.left?'L':''}${keys.right?'R':''}${keys.jump?'/J':''}${keys.action?'/X':''}`;
    if (dbg.keysEl) dbg.keysEl.textContent = k || '—';
    if (dbg.pressEl) dbg.pressEl.textContent = `${dbgPress}`;
    if (dbg.firedEl) dbg.firedEl.textContent = `${dbgFired}`;
  }

  function render(){
    // 背景雲
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<6;i++){
      const cx = (i*300 - (camera.x*.4)%300), cy = 60 + (i%2)*40;
      drawCloud(cx,cy); drawCloud(cx+150, cy+15);
    }
    // 世界
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    for(let y=0;y<LEVEL_H;y++){
      for(let x=0;x<LEVEL_W;x++){
        const t=level[y][x], px=x*TILE, py=y*TILE;
        if (t===1) drawGround(px,py);
        if (t===2) drawBrick(px,py);
        if (t===3) drawCoin(px+TILE/2, py+TILE/2);
        if (t===TRAFFIC_LIGHT) drawTrafficLight(px,py, lights[`${x},${y}`]?.state);
      }
    }
    // 左界牆（避免落出左邊）
    ctx.fillStyle='rgba(0,0,0,.15)';
    ctx.fillRect(-TILE, -TILE, TILE, LEVEL_H*TILE+2*TILE);
    // 右側終點線
    ctx.fillStyle='rgba(255,255,255,.65)';
    ctx.fillRect(GOAL_X, 0, 6, LEVEL_H*TILE);

    drawPlayer(player);
    ctx.restore();

    // 地面外框
    ctx.fillStyle = '#72bf53';
    ctx.fillRect(0, canvas.height-28, canvas.width, 28);
  }

  function drawGround(x,y){
    ctx.fillStyle='#8b5a2b'; ctx.fillRect(x,y,TILE,TILE);
    ctx.fillStyle='#976939'; for(let i=0;i<2;i++) ctx.fillRect(x, y+i*24, TILE, 2);
    ctx.fillStyle='#6b3f17'; ctx.fillRect(x, y+32, TILE, 16);
  }
  function drawBrick(x,y){
    ctx.fillStyle='#b84a2b'; ctx.fillRect(x,y,TILE,TILE);
    ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=2;
    for(let r=0;r<3;r++) for(let c=0;c<3;c++) ctx.strokeRect(x+c*16+1, y+r*16+1, 14,14);
  }
  function drawCoin(cx,cy){
    ctx.save(); ctx.translate(cx,cy);
    const t=(performance.now()/200)%(Math.PI*2), scaleX=Math.abs(Math.cos(t))*.8+.2;
    ctx.scale(scaleX,1);
    ctx.beginPath(); ctx.fillStyle='#ffd400'; ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffea80'; ctx.fillRect(-3,-6,6,12); ctx.restore();
  }
  function drawTrafficLight(x,y,state){
    ctx.fillStyle='#555';
    ctx.fillRect(x+20,y+TILE-24,8,24); // pole
    const colors = { red: '#e22', yellow: '#ff0', green: '#2ecc40' };
    ctx.fillStyle = colors[state] || '#2ecc40';
    ctx.beginPath(); ctx.arc(x+24,y+12,8,0,Math.PI*2); ctx.fill();
  }
  function drawCloud(x,y){
    ctx.fillStyle='rgba(255,255,255,.9)';
    ctx.beginPath(); ctx.arc(x,y,24,0,Math.PI*2); ctx.arc(x+24,y+6,18,0,Math.PI*2); ctx.arc(x-24,y+6,18,0,Math.PI*2); ctx.fill();
  }
  function drawPlayer(p){
    ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.facing,1);
    ctx.fillStyle='#3b3b3b'; ctx.fillRect(-12,18,10,8); ctx.fillRect(2,18,10,8);
    ctx.fillStyle='#e83f3f'; ctx.fillRect(-14,-8,28,24);
    ctx.fillStyle='#f0c090'; ctx.fillRect(-12,-28,24,20);
    ctx.fillStyle='#d22f2f'; ctx.fillRect(-12,-32,24,8); ctx.fillRect(-12,-32,26,4);
    ctx.fillStyle='#222'; ctx.fillRect(-4,-20,4,4); ctx.fillRect(2,-20,4,4);
    ctx.restore();
  }

  // 啟動
  requestAnimationFrame(loop);
})();
