import pkg from '../../package.json' assert { type: 'json' };
import { TILE } from '../game/physics.js';

async function loadGame() {
  jest.resetModules();
  document.body.innerHTML = `
    <canvas id="game"></canvas>
    <button id="design-enable" aria-pressed="false">啟用</button>
    <div id="design-transparent"></div>
    <div id="design-save"></div>
  `;
  const canvas = document.getElementById('game');
  canvas.getContext = () => ({
    fillRect: () => {},
  });
  window.__APP_VERSION__ = pkg.version;
  global.requestAnimationFrame = jest.fn();
  window.requestAnimationFrame = global.requestAnimationFrame;
  const audio = {
    loadSounds: jest.fn(() => Promise.resolve()),
    play: jest.fn(),
    playMusic: jest.fn(),
    toggleMusic: jest.fn(),
    resumeAudio: jest.fn(),
  };
  jest.doMock('../audio.js', () => audio);
  jest.doMock('../sprites.js', () => ({
    loadPlayerSprites: () => Promise.resolve(),
    loadTrafficLightSprites: () => Promise.resolve({}),
  }));
  await import('../../main.js');
  await Promise.resolve();
  return { hooks: window.__testHooks, canvas, audio };
}

test('design mode enables and drags objects', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const obj = hooks.getObjects()[0];
  const startX = obj.x;
  const startY = obj.y;
  enableBtn.click();
  expect(enableBtn.classList.contains('active')).toBe(true);
  expect(enableBtn.getAttribute('aria-pressed')).toBe('true');
  expect(enableBtn.textContent).toBe('停用');
  expect(hooks.designIsEnabled()).toBe(true);
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: startX * TILE + 1, clientY: startY * TILE + 1 }));
  canvas.dispatchEvent(new window.MouseEvent('pointermove', { clientX: (startX + 1) * TILE + 1, clientY: startY * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup'));
  expect(hooks.getObjects()[0].x).toBe(startX + 1);
  expect(hooks.getObjects()[0].y).toBe(startY);
});

test('transparent toggle affects only the selected object', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const transBtn = document.getElementById('design-transparent');
  const [first, second] = hooks.getObjects();
  enableBtn.click();
  transBtn.click();
  expect(first.transparent).toBe(false);
  expect(second.transparent).toBe(false);
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: first.x * TILE + 1, clientY: first.y * TILE + 1 }));
  transBtn.click();
  expect(first.transparent).toBe(true);
  expect(second.transparent).toBe(false);
});

test('timer pauses while design mode is enabled', async () => {
  const { hooks } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  enableBtn.click();
  expect(hooks.designIsEnabled()).toBe(true);
  const before = hooks.getTimeLeft();
  hooks.runUpdate(60);
  hooks.runUpdate(60);
  expect(hooks.getTimeLeft()).toBe(before);
});
