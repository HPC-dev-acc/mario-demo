import { TILE, resolveCollisions, collectCoins, TRAFFIC_LIGHT, isJumpBlocked, findGroundY } from './src/game/physics.js';
import { BASE_W, updatePlayerWidth } from './src/game/width.js';
import { advanceLight } from './src/game/trafficLight.js';
import { loadSounds, play, playMusic, toggleMusic, resumeAudio } from './src/audio.js';
import { createControls } from './src/controls.js';
import { createGameState } from './src/game/state.js';
import { enterSlide, exitSlide } from './src/game/slide.js';
import { render, Y_OFFSET } from './src/render.js';
import { loadPlayerSprites, loadTrafficLightSprites } from './src/sprites.js';
import { initUI } from './src/ui/index.js';
import { withTimeout } from './src/utils/withTimeout.js';
const VERSION = window.__APP_VERSION__;

let lastImpactAt = 0;
const IMPACT_COOLDOWN_MS = 120;

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const ui = initUI(canvas, { resumeAudio, toggleMusic, version: VERSION });
  const { Logger, dbg, scoreEl, timerEl, triggerClearEffect, triggerSlideEffect, triggerFailEffect, triggerStartEffect, showStageClear, showStageFail, hideStageOverlays, startScreen } = ui;
  Logger.info('app_start', { version: VERSION });

  const state = createGameState();
  const { level, coins, initialLevel, spawnLights, player, camera, GOAL_X, LEVEL_W, LEVEL_H } = state;

  const GRAVITY = 0.88;
  const FRICTION = 0.8;
  const MOVE_SPEED = 0.7;
  const MAX_RUN = 5.2;
  const JUMP_VEL = -17.8;
  const SLIDE_SPEED = 9;
  const SLIDE_TIME = 200; // ms

  let keys;
  let jumpBufferMs=0, coyoteMs=0;
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

  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) btnRestart.addEventListener('click', ()=> restartStage());
  const btnRestartFail = document.getElementById('btn-restart-fail');
  if (btnRestartFail) btnRestartFail.addEventListener('click', ()=> restartStage());

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
    player.x = 3*TILE; player.y = 3*TILE - 20; player.shadowY = player.y + player.h/2; player.vx=0; player.vy=0; player.onGround=false; player.sliding=0; player.h = player.baseH; player.w = player.baseW || BASE_W;
    camera.x=0; stageCleared=false; stageFailed=false;
    hideStageOverlays();
    score=0; if (scoreEl) scoreEl.textContent = score;
    timeLeftMs = 60000; if (timerEl) timerEl.textContent = 60;
    coins.clear();
    for(let y=0;y<LEVEL_H;y++){
      for(let x=0;x<LEVEL_W;x++){
        level[y][x] = initialLevel[y][x];
        if (initialLevel[y][x] === 3) coins.add(`${x},${y}`);
      }
    }
    spawnLights();
    triggerStartEffect();
  }

  window.__testHooks = {
    restartStage,
    getState: () => state,
    getScore: () => score,
    getTimeLeft: () => timeLeftMs,
    setScore: (v) => { score = v; if (scoreEl) scoreEl.textContent = v; },
    setTimeLeft: (v) => { timeLeftMs = v; if (timerEl) timerEl.textContent = Math.ceil(v/1000); },
    setStageCleared: (v) => { stageCleared = v; },
    setStageFailed: (v) => { stageFailed = v; },
    getStageCleared: () => stageCleared,
    getStageFailed: () => stageFailed,
    getScoreEl: () => scoreEl,
    getTimerEl: () => timerEl,
  };

  let last=0;
  function loop(t){
    const dt = Math.min(32, t-last); last=t;
    update(dt/16.6667);
    render(ctx, state);
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
        showStageFail();
        triggerFailEffect();
        play('fail');
        Logger.info('stage_fail', {score});
      }
    }

    if (stageCleared || stageFailed) return;

    if (player.sliding > 0) {
      player.sliding = Math.max(0, player.sliding - dtMs);
      player.vx = player.facing * SLIDE_SPEED;
      if (player.sliding === 0) exitSlide(player);
    } else {
      if (player.h !== player.baseH) exitSlide(player);
      if (keys.left) player.vx -= MOVE_SPEED*dt;
      if (keys.right) player.vx += MOVE_SPEED*dt;
      player.vx = Math.max(Math.min(player.vx, MAX_RUN), -MAX_RUN);
      if (keys.action && player.onGround) {
        player.sliding = SLIDE_TIME;
        player.vx = player.facing * SLIDE_SPEED;
        enterSlide(player);
        triggerSlideEffect(
          player.x - camera.x,
          player.y - camera.y + player.h / 2 + Y_OFFSET,
          player.facing
        );
        play('slide');
        keys.action = false;
      }
    }
    player.running = keys.left || keys.right;

    if (player.onGround) coyoteMs = COYOTE_MAX; else coyoteMs = Math.max(0, coyoteMs - dtMs);
    jumpBufferMs = Math.max(0, jumpBufferMs - dtMs);

    if (jumpBufferMs>0 && (player.onGround || coyoteMs>0)){
      if (!isJumpBlocked(player, state.lights)) {
        player.vy = JUMP_VEL;
        player.onGround = false; jumpBufferMs=0; coyoteMs=0;
        play('jump');
        dbgFired++; Logger.info('jump_fired', {vy:player.vy});
      } else {
        jumpBufferMs = 0;
        Logger.info('jump_blocked', { reason: 'red_light' });
      }
    }

    player.vy += GRAVITY * dt;
    if (player.vy>24) player.vy=24;

    if (player.onGround && player.sliding <= 0 && !keys.left && !keys.right){
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < .05) player.vx = 0;
    }

    if (player.vx !== 0) player.facing = player.vx>0 ? 1 : -1;

    for (const key in state.lights) {
      advanceLight(state.lights[key], dtMs);
    }

    const collisionEvents = {};
    resolveCollisions(player, level, state.lights, collisionEvents);
    player.shadowY = findGroundY(level, player.x, player.y + player.h / 2, state.lights);
    updatePlayerWidth(player);
    const gained = collectCoins(player, level, coins);
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

    camera.x = Math.max(0, Math.min(player.x - canvas.width/2, LEVEL_W*TILE - canvas.width));
    camera.y = 0;

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

  function beginGame(){
    triggerStartEffect();
    resumeAudio();
    playMusic();
    requestAnimationFrame(loop);
  }
  function preload(){
    startScreen.setStatus('Loading sounds...');
    withTimeout(loadSounds(), 10000, 'Timed out loading sounds')
      .then(() => {
        startScreen.setStatus('Loading sprites...');
        return withTimeout(Promise.all([
          loadPlayerSprites(),
          loadTrafficLightSprites(),
        ]), 10000, 'Timed out loading sprites');
      })
      .then(([playerSprites, trafficLightSprites]) => {
        state.playerSprites = playerSprites;
        state.trafficLightSprites = trafficLightSprites;
        startScreen.showStart(() => beginGame());
      }).catch((err) => {
        console.error('Failed to load resources', err);
        startScreen.showError(() => preload());
      });
  }
  preload();
})();

