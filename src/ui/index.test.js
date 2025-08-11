import { initUI } from './index.js';

function setupDOM() {
  document.body.innerHTML = `
    <div id="start-page">
      <div id="start-status"></div>
      <div id="start-version"></div>
      <button id="btn-start" hidden>START</button>
      <button id="btn-retry" hidden>Retry</button>
    </div>
    <div id="version-pill"></div>
    <canvas id="game"></canvas>`;
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
