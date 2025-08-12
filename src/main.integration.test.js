import pkg from '../package.json' assert { type: 'json' };
import { TILE, resolveCollisions, findGroundY } from './game/physics.js';

async function loadGame() {
  document.body.innerHTML = '<canvas id="game"></canvas>';
  const canvas = document.getElementById('game');
  canvas.getContext = () => ({});
  window.__APP_VERSION__ = pkg.version;
  global.requestAnimationFrame = jest.fn();

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

  jest.doMock('../src/audio.js', () => ({
    loadSounds: () => Promise.resolve(),
    play: jest.fn(),
    playMusic: jest.fn(),
    toggleMusic: jest.fn(),
    resumeAudio: jest.fn(),
  }));

  jest.doMock('../src/sprites.js', () => ({
    loadPlayerSprites: () => Promise.resolve(),
  }));

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
      startScreen: { setStatus: jest.fn(), showStart: jest.fn(), showError: jest.fn() },
    }),
  }));

  await import('../main.js');
  return { hooks: window.__testHooks, scoreEl, timerEl };
}

describe('restartStage integration', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('resets state after clear', async () => {
    const { hooks, scoreEl, timerEl } = await loadGame();
    const state = hooks.getState();
    state.player.x = 500;
    state.player.y = 200;
    hooks.setScore(50);
    hooks.setTimeLeft(2000);
    hooks.setStageCleared(true);

    hooks.restartStage();

    expect(state.player.x).toBe(3 * TILE);
    expect(state.player.y).toBe(3 * TILE - 20);
    expect(state.player.shadowY).toBe(state.player.y + state.player.h / 2);
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
    hooks.setScore(30);
    hooks.setTimeLeft(1000);
    hooks.setStageFailed(true);

    hooks.restartStage();

    expect(state.player.x).toBe(3 * TILE);
    expect(state.player.y).toBe(3 * TILE - 20);
    expect(state.player.shadowY).toBe(state.player.y + state.player.h / 2);
    expect(state.level[state.LEVEL_H - 5][0]).toBe(1);
    expect(state.level[state.LEVEL_H - 4][0]).toBe(1);
    expect(hooks.getScore()).toBe(0);
    expect(hooks.getTimeLeft()).toBe(60000);
    expect(scoreEl.textContent).toBe('0');
    expect(timerEl.textContent).toBe('60');
    expect(hooks.getStageCleared()).toBe(false);
    expect(hooks.getStageFailed()).toBe(false);
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
    for (let y = 5; y <= 8; y++) level[y][columnX] = 1;

    player.x = (columnX - 1) * TILE + TILE / 2;
    player.y = (state.LEVEL_H - 5) * TILE - player.h / 2;
    player.vx = 0;
    player.vy = 0;
    resolveCollisions(player, level, state.lights);
    player.shadowY = findGroundY(level, player.x, state.lights);
    const groundY = (state.LEVEL_H - 5) * TILE;
    expect(player.shadowY).toBe(groundY);

    player.x = columnX * TILE + TILE / 2;
    player.y = 5 * TILE - player.h / 2 - 10;
    resolveCollisions(player, level, state.lights);
    player.shadowY = findGroundY(level, player.x, state.lights);
    expect(player.shadowY).toBe(5 * TILE);
  });
});
