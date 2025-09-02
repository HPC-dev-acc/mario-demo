import { TILE, COLL_TILE, resolveCollisions, collectCoins, TRAFFIC_LIGHT, findGroundY } from './src/game/physics.js';
import { showHUD } from './hud.js';
import { BASE_W, updatePlayerWidth } from './src/game/width.js';
import { advanceLight } from './src/game/trafficLight.js';
import { loadSounds, play, playMusic, toggleMusic, resumeAudio } from './src/audio.js';
import { createControls } from './src/controls.js';
import { createGameState, SPAWN_X, SPAWN_Y } from './src/game/state.js';
import { toLogical } from './src/game/serialize.js';
import objects from './assets/objects.custom.js';
import { enterSlide, exitSlide } from './src/game/slide.js';
import { render, CAMERA_OFFSET_Y } from './src/render.js';
import { updateCamera } from './src/game/camera.js';
import { loadPlayerSprites, loadTrafficLightSprites, loadNpcSprite, loadOlNpcSprite, loadStudentNpcSprite, loadOfficemanNpcSprite } from './src/sprites.js';
import { loadBackground, makeScaledBg } from './src/bg.js';
import { initUI } from './src/ui/index.js';
import { withTimeout } from './src/utils/withTimeout.js';
import { createNpc, updateNpc, isNpcOffScreen, MAX_NPCS, boxesOverlap } from './src/npc.js';
import { registerSW } from './src/registerSw.js';
const VERSION = window.__APP_VERSION__;

registerSW();

// 控制背景音樂的靜音狀態，供方向鎖使用
window.__BGM__ = {
  muted: false,
  mutedByGuard: false,
  mute(m) {
    const wantMuted = !!m;
    if (wantMuted) {
      if (!this.muted) {
        toggleMusic();
        this.muted = true;
      }
      this.mutedByGuard = true;
    } else {
      if (this.muted && this.mutedByGuard) {
        toggleMusic();
        this.muted = false;
      }
      this.mutedByGuard = false;
    }
  },
};

let orientationGuardLoaded = false;
function loadOrientationGuard() {
  if (!orientationGuardLoaded) {
    orientationGuardLoaded = true;
    import('./orientation-guard.js');
  }
}

let lastImpactAt = 0;
const IMPACT_COOLDOWN_MS = 120;
const NPC_SPAWN_MIN_MS = 4000;
const NPC_SPAWN_MAX_MS = 8000;

(() => {
  const canvas = document.getElementById('game');
  const ctx    = canvas.getContext('2d');
  const LOGICAL_W = 960;
  const LOGICAL_H = 540;

    function getDpr() {
      return Math.max(1, Math.min(window.devicePixelRatio || 1, 4));
    }

    function applyDPR() {
      const rect = canvas.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;
      const dpr = getDpr();
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const scaleX = canvas.width / LOGICAL_W;
      const scaleY = canvas.height / LOGICAL_H;
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      canvas.style.imageRendering = 'pixelated';
      const cssScaleX = cssW / LOGICAL_W;
      const cssScaleY = cssH / LOGICAL_H;
      window.__cssScaleX = cssScaleX;
      window.__cssScaleY = cssScaleY;
      canvas.dataset.cssScaleX = cssScaleX;
      canvas.dataset.cssScaleY = cssScaleY;
      makeScaledBg(cssH, undefined, dpr);
    }

  window.addEventListener('resize', applyDPR);
  document.addEventListener('fullscreenchange', applyDPR);
  applyDPR();
  window.__resizeGameCanvas = applyDPR;
  function getLogicalViewSize() {
    return { viewW: LOGICAL_W, viewH: LOGICAL_H };
  }
  window.__getLogicalViewSize = getLogicalViewSize;

  function toGamePoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_W / rect.width;
    const scaleY = LOGICAL_H / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }
  window.toGamePoint = toGamePoint;

  const designObjects = objects.map(o => ({ ...o }));
  const state = createGameState(designObjects);
  const { level, coins, initialLevel, spawnLights, player, camera, GOAL_X, LEVEL_W, LEVEL_H, lights, transparent, indestructible } = state;
  const design = (function () {
    let enabled = false;
    let selected = null;
    let downX = 0, downY = 0;
    let maybeDeselect = false;
    function enable() {
      enabled = !enabled;
      if (enabled) {
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('keydown', onKey);
        canvas.classList.add('design-active');
      } else {
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('keydown', onKey);
        canvas.classList.remove('design-active');
        selected = null;
        state.selection = null;
      }
      return enabled;
    }
    function isEnabled() {
      return enabled;
    }
    function findObj(x, y) {
      return designObjects.find(o => o.x === x && o.y === y);
    }
    function onDown(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tileX = Math.floor((e.clientX - rect.left + camera.x) / TILE);
      const tileY = Math.floor((e.clientY - rect.top) / TILE);
      const obj = findObj(tileX, tileY) || null;
      if (obj === selected) {
        maybeDeselect = true;
      } else {
        selected = obj;
        maybeDeselect = false;
      }
      downX = e.clientX;
      downY = e.clientY;
      const collX = Math.floor((e.clientX - rect.left + camera.x) / COLL_TILE);
      const collY = Math.floor((e.clientY - rect.top) / COLL_TILE);
      const selX = Math.floor(collX / 2);
      const selY = Math.floor(collY / 2);
      const q = (collY % 2) * 2 + (collX % 2);
      const patt = state.patterns[`${selX},${selY}`];
      if (patt && patt.mask[Math.floor(q / 2)][q % 2]) state.selection = { x: selX, y: selY, q };
      else state.selection = null;
    }
    function onMove(e) {
      e.preventDefault();
      if (!selected) return;
      const rect = canvas.getBoundingClientRect();
      const tileX = Math.floor((e.clientX - rect.left + camera.x) / TILE);
      const tileY = Math.floor((e.clientY - rect.top) / TILE);
      if (tileX === selected.x && tileY === selected.y) return;
      maybeDeselect = false;
      moveSelected(selected, tileX, tileY);
    }
    function onUp(e) {
      e.preventDefault();
      if (maybeDeselect) {
        const dx = Math.abs(e.clientX - downX);
        const dy = Math.abs(e.clientY - downY);
        if (dx < 5 && dy < 5) {
          selected = null;
        }
      }
    }
    function onKey(e) {
      if (e.key === 'D') { toggleDestroyable(); return; }
      const k = e.key.toLowerCase();
      if (k === 'q') {
        rotateSelection();
        return;
      }
      if (!selected) return;
      let { x, y } = selected;
      switch (k) {
        case 'a':
          x -= 1;
          break;
        case 'd':
          x += 1;
          break;
        case 'w':
          y -= 1;
          break;
        case 's':
          y += 1;
          break;
        default:
          return;
      }
      moveSelected(selected, x, y);
    }
    function rotateSelection() {
      const sel = state.selection;
      if (!sel) return;
      const { x, y, q } = sel;
      const key = `${x},${y}`;
      const patt = state.patterns[key];
      if (!patt) return;
      const mask = patt.mask;
      const r = Math.floor(q / 2);
      const c = q % 2;
      if (!mask[r][c]) return;
      mask[r][c] = 0;
      const rotMap = [1, 3, 0, 2];
      const newQ = rotMap[q];
      const nr = Math.floor(newQ / 2);
      const nc = newQ % 2;
      mask[nr][nc] = 1;
      sel.q = newQ;
      const obj = designObjects.find(o => o.x === x && o.y === y && o.type === 'brick');
      if (obj) obj.collision = mask.flat();
      state.collisions = state.buildCollisions();
    }
    function moveSelected(obj, x, y) {
      if (x < 0 || y < 0 || x >= LEVEL_W || y >= LEVEL_H) return;
      if (level[y][x] !== 0) return;
      const oldKey = `${obj.x},${obj.y}`;
      const newKey = `${x},${y}`;
      if (obj.type === 'brick') {
        level[obj.y][obj.x] = 0;
        const patt = state.patterns[oldKey];
        delete state.patterns[oldKey];
        level[y][x] = 2;
        if (patt) state.patterns[newKey] = patt;
      } else if (obj.type === 'coin') {
        level[obj.y][obj.x] = 0;
        coins.delete(oldKey);
        level[y][x] = 3;
        coins.add(newKey);
      } else if (obj.type === 'light') {
        level[obj.y][obj.x] = 0;
        delete lights[oldKey];
        level[y][x] = TRAFFIC_LIGHT;
        lights[newKey] = {
          phase: 'green',
          state: 'green',
          timer: 0,
          blinkElapsed: 0,
        };
      }
      const wasTrans = transparent.has(oldKey);
      if (wasTrans) {
        transparent.delete(oldKey);
        transparent.add(newKey);
      }
      const wasLock = indestructible.has(oldKey);
      if (wasLock) {
        indestructible.delete(oldKey);
        indestructible.add(newKey);
      }
      const wasSel = state.selection && state.selection.x === obj.x && state.selection.y === obj.y;
      obj.x = x;
      obj.y = y;
      if (wasSel) {
        state.selection.x = x;
        state.selection.y = y;
      }
      state.collisions = state.buildCollisions();
    }
      function toggleTransparent() {
        if (!selected) return;
        const key = `${selected.x},${selected.y}`;
        selected.transparent = !selected.transparent;
        if (selected.transparent) transparent.add(key); else transparent.delete(key);
      }
    function toggleDestroyable() {
      if (!selected || selected.type !== 'brick') return;
      const key = `${selected.x},${selected.y}`;
      selected.destroyable = selected.destroyable === false;
      if (selected.destroyable === false) indestructible.add(key); else indestructible.delete(key);
    }
    function save() {
      const out = toLogical(designObjects);
      const data = JSON.stringify(out, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'objects.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
    function getSelected() {
      return selected;
    }
    function addBlock() {
      const hud = document.getElementById('hud-top-center');
      const hudRect = hud.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const px = camera.x + LOGICAL_W / 2;
      const py = camera.y + CAMERA_OFFSET_Y + (hudRect.bottom - canvasRect.top) + 4;
      const cx = Math.floor(px / COLL_TILE);
      const cy = Math.floor(py / COLL_TILE);
      const tx = Math.floor(cx / 2);
      const ty = Math.floor(cy / 2);
      const q = (cy % 2) * 2 + (cx % 2);
      level[ty][tx] = 2;
      const key = `${tx},${ty}`;
      const patt = state.patterns[key] || { mask: [
        [0, 0],
        [0, 0],
      ] };
      patt.mask[Math.floor(q / 2)][q % 2] = 1;
      state.patterns[key] = patt;
      const arr = patt.mask.flat();
      const existing = designObjects.find(o => o.x === tx && o.y === ty && o.type === 'brick');
      if (existing) existing.collision = arr; else designObjects.push({ type: 'brick', x: tx, y: ty, transparent: false, destroyable: true, collision: arr });
      state.collisions = state.buildCollisions();
    }
    return { enable, isEnabled, toggleTransparent, toggleDestroyable, save, getSelected, addBlock };
  })();
  const ui = initUI(canvas, {
    resumeAudio,
    toggleMusic,
    version: VERSION,
    design,
  });
  const { Logger, dbg, scoreEl, timerEl, triggerClearEffect, triggerSlideEffect, triggerFailEffect, triggerStartEffect, showStageClear, showStageFail, hideStageOverlays, startScreen, showPedDialog, hidePedDialog, syncDialogToPlayer } = ui;
  Logger.info('app_start', { version: VERSION });

  const GRAVITY = 0.88;
  const FRICTION = 0.8;
  const MOVE_SPEED = 0.7;
  const MAX_RUN = 5.2;
  const JUMP_VEL = -17.8;
  const SLIDE_SPEED = 9;
  const SLIDE_TIME = 200; // ms
  const STUN_TIME = 450;      // 玩家硬直（不可操作）時長（毫秒）
  const KNOCKBACK = 4.0;      // 側撞時初速
  const STOMP_BOUNCE = JUMP_VEL; // 踩到時的回彈高度與一般跳躍一致

  let keys;
  let jumpBufferMs=0, coyoteMs=0;
  let npcSpawnTimer = 0;
  const JUMP_BUFFER_MAX=120, COYOTE_MAX=100;
  let dbgPress=0, dbgFired=0;
  function pressJump(src){ jumpBufferMs=JUMP_BUFFER_MAX; keys.jump=true; dbgPress++; Logger.debug('jump_press',{src}); }
  function releaseJump(){ keys.jump=false; }
  keys = createControls(pressJump, releaseJump);

  let fpsLast=performance.now(), fpsCnt=0, fpsVal=0;
  function updFps(t){ fpsCnt++; if(t-fpsLast>=250){ const now=performance.now(); fpsVal=Math.round(1000*fpsCnt/(now-fpsLast)); fpsLast=now; fpsCnt=0; if(dbg.fpsEl) dbg.fpsEl.textContent=`${fpsVal}`; } }

  let score=0;
  let timeLeftMs = 60000;
  let stageCleared=false;
  let stageFailed=false;
  let pedDialogVisible = false;

  ['btn-start', 'btn-retry'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', showHUD);
  });

  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) btnRestart.addEventListener('click', () => { showHUD(); restartStage(); });
  const btnRestartFail = document.getElementById('btn-restart-fail');
  if (btnRestartFail) btnRestartFail.addEventListener('click', () => { showHUD(); restartStage(); });

  function maybeClear(){
    if (!stageCleared && !stageFailed && player.x >= GOAL_X){
      stageCleared = true;
      showStageClear();
      triggerClearEffect();
      play('clear');
      Logger.info('stage_clear', {score});
    }
  }

  function restartStage(){
    resumeAudio();
    playMusic();
    player.x = SPAWN_X; player.y = SPAWN_Y; player.shadowY = player.y + player.h/2;
    player.vx=0; player.vy=0; player.onGround=false; player.sliding=0; player.stunnedMs=0;
    player.h = player.baseH; player.w = player.baseW || BASE_W;
    camera.x=0; stageCleared=false; stageFailed=false;
    hideStageOverlays();
    score=0; if (scoreEl) scoreEl.textContent = score;
    timeLeftMs = 60000; if (timerEl) { timerEl.textContent = 60; timerEl.classList.remove('low-time'); }
    coins.clear();
    for(let y=0;y<LEVEL_H;y++){
      for(let x=0;x<LEVEL_W;x++){
        level[y][x] = initialLevel[y][x];
        if (initialLevel[y][x] === 3) coins.add(`${x},${y}`);
      }
    }
    spawnLights();
    state.npcs = [];
    npcSpawnTimer = 0;
    triggerStartEffect();
  }

  window.__testHooks = {
    restartStage,
    getState: () => state,
    getScore: () => score,
    getTimeLeft: () => timeLeftMs,
    setScore: (v) => { score = v; if (scoreEl) scoreEl.textContent = v; },
    setTimeLeft: (v) => { timeLeftMs = v; if (timerEl) { timerEl.textContent = Math.ceil(v/1000); if (v <= 10000) timerEl.classList.add('low-time'); else timerEl.classList.remove('low-time'); } },
    setStageCleared: (v) => { stageCleared = v; },
    setStageFailed: (v) => { stageFailed = v; },
    getStageCleared: () => stageCleared,
    getStageFailed: () => stageFailed,
    getScoreEl: () => scoreEl,
    getTimerEl: () => timerEl,
    designEnable: design.enable,
    designToggleTransparent: design.toggleTransparent,
    designToggleDestroyable: design.toggleDestroyable,
    designSave: design.save,
    designAddBlock: design.addBlock,
    designIsEnabled: design.isEnabled,
    designGetSelected: design.getSelected,
    getObjects: () => designObjects,
    getNpcSpawnTimer: () => npcSpawnTimer,
    setNpcSpawnTimer: (v) => { npcSpawnTimer = v; },
  };

  let last=0;
  function loop(t){
    if (window.__ORIENT_PAUSED__) {
      requestAnimationFrame(loop);
      return;
    }
    const dt = Math.min(32, t-last); last=t;
    update(dt/16.6667);
    render(ctx, state, design);
    syncDialogToPlayer(player, camera);
    updFps(t);
    requestAnimationFrame(loop);
  }

  function update(dt){
    const dtMs = dt*16.6667;
    if (!design.isEnabled() && !stageCleared && !stageFailed) {
      timeLeftMs = Math.max(0, timeLeftMs - dtMs);
      if (timerEl) {
        timerEl.textContent = Math.ceil(timeLeftMs / 1000);
        if (timeLeftMs <= 10000) timerEl.classList.add('low-time');
        else timerEl.classList.remove('low-time');
      }
      if (timeLeftMs <= 0) {
        stageFailed = true;
        showStageFail();
        triggerFailEffect();
        play('fail');
        Logger.info('stage_fail', {score});
      }
    }

    if (stageCleared || stageFailed) return;

    // 硬直計時（不可操作）
    if (player.stunnedMs > 0) {
      player.stunnedMs = Math.max(0, player.stunnedMs - dtMs);
    }

    if (player.redLightPaused) {
      player.sliding = 0;
      exitSlide(player);
      player.vx *= 0.8;
      if (Math.abs(player.vx) < 0.05) player.vx = 0;
    } else if (player.sliding > 0) {
      player.sliding = Math.max(0, player.sliding - dtMs);
      player.vx = player.facing * SLIDE_SPEED;
      if (player.sliding === 0) exitSlide(player);
    } else if (player.stunnedMs <= 0) {
      if (player.h !== player.baseH) exitSlide(player);
      if (keys.left)  player.vx -= MOVE_SPEED * dt;
      if (keys.right) player.vx += MOVE_SPEED * dt;
      player.vx = Math.max(Math.min(player.vx, MAX_RUN), -MAX_RUN);
      if (keys.action && player.onGround) {
        player.sliding = SLIDE_TIME;
        player.vx = player.facing * SLIDE_SPEED;
        enterSlide(player);
        triggerSlideEffect(
          player.x - camera.x,
          player.y - (camera.y + CAMERA_OFFSET_Y) + player.h / 2,
          player.facing
        );
        play('slide');
        keys.action = false;
      }
    } else {
      // 硬直中：逐步停下，鎖操作
      player.vx *= 0.85;
      if (Math.abs(player.vx) < 0.05) player.vx = 0;
    }
    player.running = player.stunnedMs <= 0 && !player.redLightPaused && (keys.left || keys.right);

    if (player.onGround) coyoteMs = COYOTE_MAX; else coyoteMs = Math.max(0, coyoteMs - dtMs);
    jumpBufferMs = Math.max(0, jumpBufferMs - dtMs);

    if (player.stunnedMs <= 0 && !player.redLightPaused && jumpBufferMs>0 && (player.onGround || coyoteMs>0)){
      player.vy = JUMP_VEL;
      player.onGround = false; jumpBufferMs=0; coyoteMs=0;
      play('jump');
      dbgFired++; Logger.info('jump_fired', {vy:player.vy});
    }

    player.vy += GRAVITY * dt;
    if (player.vy>24) player.vy=24;

    if (player.stunnedMs <= 0 && player.onGround && player.sliding <= 0 && !keys.left && !keys.right){
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < .05) player.vx = 0;
    }

    if (player.stunnedMs <= 0 && player.vx !== 0) player.facing = player.vx > 0 ? 1 : -1;

    for (const key in state.lights) {
      advanceLight(state.lights[key], dtMs);
    }

    const collisionEvents = {};
    const wasOnGround = player.onGround;
    resolveCollisions(player, level, state.collisions, state.lights, collisionEvents, state.indestructible);
    if (player.redLightPaused && !pedDialogVisible) {
      showPedDialog('wait');
      pedDialogVisible = true;
      syncDialogToPlayer(player, camera);
    } else if (!player.redLightPaused && pedDialogVisible) {
      hidePedDialog();
      pedDialogVisible = false;
    }
    if (player.onGround && !wasOnGround) {
      for (const npc of state.npcs) {
        npc.bounceCount = 0;
        npc.passThrough = false;
      }
    }
    player.shadowY = findGroundY(state.collisions, player.x, player.y + player.h / 2);
    updatePlayerWidth(player);
    const gained = collectCoins(player, level, coins);

    npcSpawnTimer -= dtMs;
    if (npcSpawnTimer <= 0 && state.npcs.length < MAX_NPCS) {
        const spawnX = camera.x + LOGICAL_W + player.w;
      const baseScale = player.baseH / 44;
      let type = 'default';
      let sprite = state.npcSprite;
      let sizeScale = 1;
      let opts;
      let facing;
      const specialTypes = [];
      if (state.olNpcSprite) specialTypes.push('ol');
      if (state.studentNpcSprite) specialTypes.push('student');
      if (state.officemanNpcSprite) specialTypes.push('officeman');
      if (specialTypes.length && Math.random() < 0.8) {
        type = specialTypes[Math.floor(Math.random() * specialTypes.length)];
        sprite = type === 'ol' ? state.olNpcSprite : type === 'student' ? state.studentNpcSprite : state.officemanNpcSprite;
        sizeScale = 6 / 5;
        const speed = type === 'ol' ? -2 : type === 'student' ? -1 : -1.5;
        opts = { fixedSpeed: speed };
        facing = 1;
      }
      const npcW = 48 * baseScale * sizeScale;
      const npcH = player.baseH * sizeScale;
      if (!state.npcs.some(n => n.type === type)) {
        const groundY = findGroundY(
          state.collisions,
          spawnX,
          state.collisions.length * COLL_TILE - 1,
          true,
        );
        const npc = createNpc(spawnX, groundY - npcH / 2, npcW, npcH, sprite, undefined, facing, opts, type);
        state.npcs.push(npc);
      }
      npcSpawnTimer = NPC_SPAWN_MIN_MS + Math.random() * (NPC_SPAWN_MAX_MS - NPC_SPAWN_MIN_MS);
    }

    for (const npc of state.npcs) {
      updateNpc(npc, dtMs, { level, collisions: state.collisions, lights: state.lights, gravity: GRAVITY }, player);
    }
    // 玩家 vs NPC 碰撞處理
    const pbox = { x: player.x - player.w/2, y: player.y - player.h/2, w: player.w, h: player.h };
    for (const npc of state.npcs) {
      if (npc.passThrough) continue;
      if (!boxesOverlap(npc.box, pbox)) continue;
      // 是否為「從上踩到」
      const fromAbove = player.vy > 0 && (player.y - npc.y) < -npc.h * 0.15;
      if (fromAbove) {
        const count = npc.bounceCount ?? 0;
        if (count >= 3) {
          npc.passThrough = true;
          continue;
        }
        npc.bounceCount = count + 1;
        // 玩家彈起、NPC idle 一下
        player.vy = STOMP_BOUNCE;
        play('jump');
        npc.pauseTimer = Math.max(npc.pauseTimer, 400); // 0.4s
        npc.state = 'bump';
        npc.bumped = true;
      } else {
        // 側撞／下方：一次性擊退並硬直（不可操作）
        const dir = player.x < npc.x ? -1 : 1; // 依相對位置決定擊退方向
        if (player.stunnedMs <= 0) {
          player.vx = dir * KNOCKBACK;
          player.stunnedMs = STUN_TIME;
          // 取消跳躍緩衝與土狼時間，避免立刻跳脫硬直
          jumpBufferMs = 0; coyoteMs = 0;
        }
        npc.vx = -dir * KNOCKBACK;
        npc.knockbackTimer = Math.max(npc.knockbackTimer || 0, 200);
        npc.pauseTimer = Math.max(npc.pauseTimer, 400);
        npc.state = 'bump';
        npc.bumped = true;
      }
    }
    state.npcs = state.npcs.filter(n => !isNpcOffScreen(n, camera.x));
    if (collisionEvents.brickHit) {
      const now = performance.now();
      if (now - lastImpactAt >= IMPACT_COOLDOWN_MS) {
        play('impact');
        lastImpactAt = now;
      }
    }
    if (gained) {
      score += gained;
      if (scoreEl) scoreEl.textContent = score;
      play('coin');
    }
    maybeClear();

    updateCamera(state);

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

  window.__testHooks.runUpdate = (dt) => update(dt);
  window.__testHooks.runRender = () => render(ctx, state, design);

  function beginGame(){
    loadOrientationGuard();
    triggerStartEffect();
    resumeAudio();
    loadSounds().then(() => playMusic());
    requestAnimationFrame(loop);
  }
  function preload(){
    startScreen.setStatus('Loading sprites...');
    withTimeout(Promise.all([
      loadBackground('assets/Background/background1.jpeg'),
      loadPlayerSprites(),
      loadTrafficLightSprites(),
      loadNpcSprite(),
      loadOlNpcSprite(),
      loadStudentNpcSprite(),
      loadOfficemanNpcSprite(),
    ]), 10000, 'Timed out loading sprites')
      .then(([_, playerSprites, trafficLightSprites, npcSprite, olNpcSprite, studentNpcSprite, officemanNpcSprite]) => {
        makeScaledBg(canvas.height / getDpr(), undefined, getDpr());
        state.playerSprites = playerSprites;
        state.trafficLightSprites = trafficLightSprites;
        state.npcSprite = npcSprite;
        state.olNpcSprite = olNpcSprite;
        state.studentNpcSprite = studentNpcSprite;
        state.officemanNpcSprite = officemanNpcSprite;
        startScreen.showStart(() => beginGame());
      }).catch((err) => {
        console.error('Failed to load resources', err);
        startScreen.showError(() => preload());
      });
  }
  preload();
})();

