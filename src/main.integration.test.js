import pkg from '../package.json' assert { type: 'json' };
import { TILE, resolveCollisions, findGroundY } from './game/physics.js';
import { BASE_W } from './game/width.js';
import { SPAWN_X, SPAWN_Y, Y_OFFSET } from './game/state.js';
import { createNpc } from './npc.js';

const JUMP_VEL = -17.8; // mirror JUMP_VEL in main.js

async function loadGame() {
  document.body.innerHTML = '<div id="stage"><canvas id="game"></canvas><div id="hud"></div></div>';
  const canvas = document.getElementById('game');
  canvas.getContext = () => ({ setTransform: jest.fn() });
  window.__APP_VERSION__ = pkg.version;
  global.requestAnimationFrame = jest.fn();
  Object.defineProperty(document, 'fullscreenElement', { writable: true, configurable: true, value: null });

  const scoreEl = {
    _text: '',
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
  };
  const timerEl = {
    _text: '',
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
  };

  const audio = {
    loadSounds: jest.fn(() => Promise.resolve()),
    play: jest.fn(),
    playMusic: jest.fn(),
    toggleMusic: jest.fn(),
    resumeAudio: jest.fn(),
  };
  jest.doMock('../src/audio.js', () => audio);

    jest.doMock('../src/sprites.js', () => ({
      loadPlayerSprites: () => Promise.resolve(),
      loadTrafficLightSprites: () => Promise.resolve({}),
      loadNpcSprite: () => Promise.resolve({}),
    }));

  let startCallback;
  jest.doMock('../src/ui/index.js', () => ({
    initUI: () => ({
      Logger: { info: jest.fn(), debug: jest.fn() },
      dbg: {},
      scoreEl,
      timerEl,
      triggerClearEffect: jest.fn(),
      triggerSlideEffect: jest.fn(),
      triggerFailEffect: jest.fn(),
      triggerStartEffect: jest.fn(),
      showStageClear: jest.fn(),
      showStageFail: jest.fn(),
      hideStageOverlays: jest.fn(),
      startScreen: { setStatus: jest.fn(), showStart: jest.fn((cb) => { startCallback = cb; }), showError: jest.fn() },
    }),
  }));

  await import('../main.js');
  await new Promise((r) => setTimeout(r, 0));
  return { hooks: window.__testHooks, scoreEl, timerEl, audio, startCallback };
}

describe('audio loading', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('loadSounds waits for start interaction', async () => {
    const { audio, startCallback } = await loadGame();
    expect(audio.loadSounds).not.toHaveBeenCalled();
    startCallback();
    expect(audio.resumeAudio).toHaveBeenCalled();
    expect(audio.loadSounds).toHaveBeenCalled();
  });
});

describe('restartStage integration', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('resets state after clear', async () => {
    const { hooks, scoreEl, timerEl } = await loadGame();
    const state = hooks.getState();
    state.player.x = 500;
    state.player.y = 200;
    state.player.stunnedMs = 123;
    hooks.setScore(50);
    hooks.setTimeLeft(2000);
    hooks.setStageCleared(true);

    hooks.restartStage();

    expect(state.player.x).toBe(SPAWN_X);
    expect(state.player.y).toBe(SPAWN_Y);
    expect(state.player.w).toBe(BASE_W);
    expect(state.player.h).toBe(120);
    expect(state.player.shadowY).toBe(state.player.y + state.player.h / 2);
    expect(state.player.stunnedMs).toBe(0);
    expect(state.level[state.LEVEL_H - 5][0]).toBe(1);
    expect(state.level[state.LEVEL_H - 4][0]).toBe(1);
    expect(hooks.getScore()).toBe(0);
    expect(hooks.getTimeLeft()).toBe(60000);
    expect(scoreEl.textContent).toBe('0');
    expect(timerEl.textContent).toBe('60');
    expect(hooks.getStageCleared()).toBe(false);
    expect(hooks.getStageFailed()).toBe(false);
  });

  test('resets state after fail', async () => {
    const { hooks, scoreEl, timerEl } = await loadGame();
    const state = hooks.getState();
    state.player.x = 400;
    state.player.y = 100;
    state.player.stunnedMs = 123;
    hooks.setScore(30);
    hooks.setTimeLeft(1000);
    hooks.setStageFailed(true);

    hooks.restartStage();

    expect(state.player.x).toBe(SPAWN_X);
    expect(state.player.y).toBe(SPAWN_Y);
    expect(state.player.w).toBe(BASE_W);
    expect(state.player.h).toBe(120);
    expect(state.player.shadowY).toBe(state.player.y + state.player.h / 2);
    expect(state.player.stunnedMs).toBe(0);
    expect(state.level[state.LEVEL_H - 5][0]).toBe(1);
    expect(state.level[state.LEVEL_H - 4][0]).toBe(1);
    expect(hooks.getScore()).toBe(0);
    expect(hooks.getTimeLeft()).toBe(60000);
    expect(scoreEl.textContent).toBe('0');
    expect(timerEl.textContent).toBe('60');
    expect(hooks.getStageCleared()).toBe(false);
    expect(hooks.getStageFailed()).toBe(false);
  });

  test('clears npcs and spawn timer on restart', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    state.npcs.push(createNpc(100, 0, 10, 10, null));
    hooks.setNpcSpawnTimer(5000);
    hooks.restartStage();
    expect(state.npcs.length).toBe(0);
    expect(hooks.getNpcSpawnTimer()).toBe(0);
  });
});

describe('shadowY behavior', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('moves to top of tall block when airborne', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const { level, player } = state;
    const columnX = 20;
    for (let y = 5 + Y_OFFSET; y <= 8 + Y_OFFSET; y++) level[y][columnX] = 1;
    state.collisions = state.buildCollisions();

    player.x = (columnX - 1) * TILE + TILE / 2;
    player.y = (state.LEVEL_H - 5) * TILE - player.h / 2;
    player.vx = 0;
    player.vy = 0;
    resolveCollisions(player, level, state.collisions, state.lights);
    player.shadowY = findGroundY(state.collisions, player.x, player.y + player.h / 2);
    const groundY = (state.LEVEL_H - 5) * TILE;
    expect(player.shadowY).toBe(groundY);

    player.x = columnX * TILE + TILE / 2;
    player.y = (5 + Y_OFFSET) * TILE - player.h / 2 - 10;
    resolveCollisions(player, level, state.collisions, state.lights);
    player.shadowY = findGroundY(state.collisions, player.x, player.y + player.h / 2);
    expect(player.shadowY).toBe((5 + Y_OFFSET) * TILE);
  });

  test('returns ground height when standing under a block', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const { level, player } = state;
    const columnX = 10;
    level[5 + Y_OFFSET][columnX] = 1; // block above
    state.collisions = state.buildCollisions();

    player.x = columnX * TILE + TILE / 2;
    player.y = (state.LEVEL_H - 5) * TILE - player.h / 2;
    resolveCollisions(player, level, state.collisions, state.lights);
    player.shadowY = findGroundY(state.collisions, player.x, player.y + player.h / 2);
    const groundY = (state.LEVEL_H - 5) * TILE;
    expect(player.shadowY).toBe(groundY);
  });
});

describe('canvas resizing', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('resizes canvas based on devicePixelRatio', async () => {
    await loadGame();
    const canvas = document.getElementById('game');
    expect(canvas.width).toBe(960);
    expect(canvas.height).toBe(540);
    window.devicePixelRatio = 2;
    window.__resizeGameCanvas();
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
    window.devicePixelRatio = 1;
    window.__resizeGameCanvas();
    expect(canvas.width).toBe(960);
    expect(canvas.height).toBe(540);
  });

  test('fullscreenchange triggers canvas resize', async () => {
    await loadGame();
    const canvas = document.getElementById('game');
    window.devicePixelRatio = 2;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
    window.devicePixelRatio = 1;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(canvas.width).toBe(960);
    expect(canvas.height).toBe(540);
  });

  test('resize sets canvas imageRendering to pixelated', async () => {
    await loadGame();
    const canvas = document.getElementById('game');
    canvas.style.imageRendering = 'auto';
    window.__resizeGameCanvas();
    expect(canvas.style.imageRendering).toBe('pixelated');
  });
});

describe('player and npc collision', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('side collision stuns player and knocks back npc', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 100; player.y = 0; player.vx = 0; player.vy = 0; player.facing = 1;
    const npc = createNpc(100, 0, player.w, player.h, null);
    state.npcs.push(npc);

    hooks.runUpdate(16);

    expect(player.stunnedMs).toBeGreaterThan(0);
    expect(player.facing).toBe(1);
    expect(npc.state).toBe('idle');
    expect(npc.pauseTimer).toBeGreaterThanOrEqual(400);
    expect(npc.knockbackTimer).toBeGreaterThan(0);
    expect(npc.vx).toBeGreaterThan(0);

    hooks.runUpdate(16);
    expect(npc.knockbackTimer).toBeGreaterThan(0);
    expect(npc.vx).toBeGreaterThan(0);
    
    expect(player.facing).toBe(1);
  });

  test('stomping npc bounces player with normal jump height', async () => {
    const { hooks, audio } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 0; player.y = 0; player.vy = 10;
    const npc = createNpc(0, 60, player.w, player.h, null);
    state.npcs.push(npc);

    hooks.runUpdate(16);

    expect(player.vy).toBe(JUMP_VEL);
    expect(player.stunnedMs).toBe(0);
    expect(npc.state).toBe('idle');
    expect(npc.pauseTimer).toBeGreaterThanOrEqual(400);
    expect(audio.play).toHaveBeenCalledWith('jump');
  });

  test('npc bounce count resets when player lands', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 0; player.y = 0;
    const npc = createNpc(0, 60, player.w, player.h, null);
    state.npcs.push(npc);

    // First stomp
    player.vy = 10;
    hooks.runUpdate(16);
    expect(npc.bounceCount).toBe(1);

    // Simulate landing on ground
    player.y = SPAWN_Y - 20;
    player.vy = 10;
    player.onGround = false;
    for (let i = 0; i < 60 && !player.onGround; i++) hooks.runUpdate(16);
    expect(player.onGround).toBe(true);
    expect(npc.bounceCount).toBe(0);

    // Stomp again after landing
    player.y = 0; player.vy = 10; npc.y = 60; npc.vy = 0;
    hooks.runUpdate(16);
    expect(npc.bounceCount).toBe(1);
  });

  test('player passes through npc after three stomps', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 0; player.y = 0;
    const npc = createNpc(0, 60, player.w, player.h, null);
    state.npcs.push(npc);

    for (let i = 0; i < 3; i++) {
      player.vy = 10;
      hooks.runUpdate(16);
      expect(player.vy).toBe(JUMP_VEL);
      player.y = 0;
      npc.y = 60;
      npc.vy = 0;
    }

    player.vy = 10;
    hooks.runUpdate(16);

    expect(npc.passThrough).toBe(true);
    expect(player.vy).toBeGreaterThan(0);
  });
});
