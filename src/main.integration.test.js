import pkg from '../package.json' assert { type: 'json' };
import { TILE } from './game/physics.js';

describe('restartStage integration', () => {
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
        showStageClear: jest.fn(),
        showStageFail: jest.fn(),
        hideStageOverlays: jest.fn(),
        startScreen: { setStatus: jest.fn(), showStart: jest.fn(), showError: jest.fn() },
      }),
    }));

    await import('../main.js');
    return { hooks: window.__testHooks, scoreEl, timerEl };
  }

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
    expect(state.player.y).toBe(6 * TILE - 20);
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
    expect(state.player.y).toBe(6 * TILE - 20);
    expect(hooks.getScore()).toBe(0);
    expect(hooks.getTimeLeft()).toBe(60000);
    expect(scoreEl.textContent).toBe('0');
    expect(timerEl.textContent).toBe('60');
    expect(hooks.getStageCleared()).toBe(false);
    expect(hooks.getStageFailed()).toBe(false);
  });
});
