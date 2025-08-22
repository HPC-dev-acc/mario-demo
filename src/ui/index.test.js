import { initUI } from './index.js';

  function setupDOM() {
    document.body.innerHTML = `
      <div id="start-page">
        <div id="start-status"></div>
        <div id="start-version"></div>
        <button id="btn-start" hidden>START</button>
        <button id="btn-retry" hidden>Retry</button>
      </div>
      <div id="game-col">
        <div id="top-right">
          <button id="info-toggle" class="pill">ℹ</button>
          <div id="version-pill"></div>
        </div>
        <div id="hud-top-center">
          <button id="fullscreen-toggle" class="pill">⛶</button>
        </div>
        <div id="info-panel" hidden></div>
      <div id="game-wrap"><canvas id="game"></canvas><div id="ped-dialog" class="ped-dialog hidden"><div class="ped-dialog__content"></div></div></div>
      </div>`;
    return document.getElementById('game');
  }

test('initUI exposes Logger', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  expect(typeof ui.Logger.info).toBe('function');
});

test('start button hidden before preload complete', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  expect(document.getElementById('btn-start').hidden).toBe(true);
});

test('shows version on start page', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  window.dispatchEvent(new Event('load'));
  expect(document.getElementById('start-version').textContent).toBe('v0');
});

test('start button click hides start page', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  let started = false;
  ui.startScreen.showStart(() => { started = true; });
  const btn = document.getElementById('btn-start');
  expect(btn.hidden).toBe(false);
  btn.click();
  expect(started).toBe(true);
  expect(document.getElementById('start-page').hidden).toBe(true);
  expect(getComputedStyle(document.getElementById('start-page')).display).toBe('none');
});

test('preload error shows retry and allows retry', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  let retried = false;
  ui.startScreen.showError(() => { retried = true; });
  const retry = document.getElementById('btn-retry');
  expect(retry.hidden).toBe(false);
  expect(document.getElementById('start-status').textContent).toMatch(/Failed/);
  retry.click();
  expect(retried).toBe(true);
  expect(document.getElementById('start-status').textContent).toBe('Loading...');
});

test('does not refocus when clicking interactive elements', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const spy = jest.spyOn(canvas, 'focus');
  const btn = document.getElementById('btn-start');
  btn.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
  expect(spy).not.toHaveBeenCalled();
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
  expect(spy).toHaveBeenCalled();
});

test('start button pointerdown not canceled and click hides start page', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  let started = false;
  ui.startScreen.showStart(() => { started = true; });
  const btn = document.getElementById('btn-start');
  const dispatched = btn.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
  expect(dispatched).toBe(true);
  btn.click();
  expect(started).toBe(true);
  expect(document.getElementById('start-page').hidden).toBe(true);
});

test('triggerStartEffect inserts and removes element', () => {
  jest.useFakeTimers();
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.triggerStartEffect();
  const el = document.querySelector('.start-effect');
  expect(el).not.toBeNull();
  expect(el.textContent).toBe("Let's Go!");
  jest.advanceTimersByTime(1000);
  expect(document.querySelector('.start-effect')).toBeNull();
  jest.useRealTimers();
});

test('triggerSlideEffect positions dust at player feet and removes it', () => {
  jest.useFakeTimers();
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.triggerSlideEffect(100, 200, 1);
  const fx = document.querySelector('.slide-effect');
  expect(fx).not.toBeNull();
  expect(fx.style.left).toBe('88px');
  expect(fx.style.top).toBe('188px');
  jest.advanceTimersByTime(500);
  expect(document.querySelector('.slide-effect')).toBeNull();
  jest.useRealTimers();
});

test('triggerSlideEffect scales position and size with cssScale', () => {
  jest.useFakeTimers();
  window.__cssScale = 2;
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.triggerSlideEffect(100, 200, -1);
  const fx = document.querySelector('.slide-effect');
  expect(fx).not.toBeNull();
  expect(fx.style.left).toBe('224px');
  expect(fx.style.top).toBe('376px');
  expect(fx.style.width).toBe('96px');
  expect(fx.style.height).toBe('48px');
  jest.advanceTimersByTime(500);
  expect(document.querySelector('.slide-effect')).toBeNull();
  delete window.__cssScale;
  jest.useRealTimers();
});

test('info toggle shows and hides info panel', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const panel = document.getElementById('info-panel');
  const toggle = document.getElementById('info-toggle');
  expect(panel.hidden).toBe(true);
  toggle.click();
  expect(panel.hidden).toBe(false);
  toggle.click();
  expect(panel.hidden).toBe(true);
});

  test('fullscreen toggle requests and exits fullscreen', () => {
    const canvas = setupDOM();
    const root = document.getElementById('game-col');
    root.requestFullscreen = jest.fn().mockResolvedValue();
    document.exitFullscreen = jest.fn().mockResolvedValue();
    initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
    const btn = document.getElementById('fullscreen-toggle');
    btn.click();
    expect(root.requestFullscreen).toHaveBeenCalled();
    expect(btn.textContent).toBe('🞬');
    document.fullscreenElement = root;
    btn.click();
    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(btn.textContent).toBe('⛶');
    document.fullscreenElement = null;
  });

  test('fullscreen toggle schedules canvas resize', () => {
    const canvas = setupDOM();
    window.__resizeGameCanvas = jest.fn();
    jest.useFakeTimers();
    initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
    const btn = document.getElementById('fullscreen-toggle');
    btn.click();
    jest.runAllTimers();
    expect(window.__resizeGameCanvas).toHaveBeenCalled();
    jest.useRealTimers();
    delete window.__resizeGameCanvas;
  });

test('showPedDialog toggles visibility and syncs to player', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.showPedDialog('wait');
  const dialog = document.getElementById('ped-dialog');
  expect(dialog.classList.contains('hidden')).toBe(false);
  const player = { x: 100, y: 200, h: 50 };
  const camera = { x: 0, y: 0 };
  ui.syncDialogToPlayer(player, camera);
  expect(dialog.style.left).toBe('100px');
  expect(dialog.style.top).toBe(`${200 - 25 - 28}px`);
  ui.hidePedDialog();
  expect(dialog.classList.contains('hidden')).toBe(true);
});
