import pkg from '../../package.json' assert { type: 'json' };
import { TILE } from '../game/physics.js';

async function loadGame() {
  jest.resetModules();
  document.body.innerHTML = `
    <div id="hud-top-center"></div>
    <canvas id="game" width="960" height="540"></canvas>
    <button id="design-enable" aria-pressed="false">啟用</button>
    <div id="design-transparent"></div>
    <div id="design-save"></div>
    <button id="design-add" hidden></button>
  `;
  const canvas = document.getElementById('game');
  const hud = document.getElementById('hud-top-center');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, right: 960, bottom: 540, width: 960, height: 540 });
  hud.getBoundingClientRect = () => ({ left: 0, top: 0, right: 960, bottom: 20, width: 960, height: 20 });
  const ctx = {
    canvas,
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    drawImage: jest.fn(),
    scale: jest.fn(),
    ellipse: jest.fn(),
  };
  canvas.getContext = () => ctx;
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
  return { hooks: window.__testHooks, canvas, audio, ctx };
}

test('design mode enables and drags objects', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  enableBtn.click();
  expect(enableBtn.classList.contains('active')).toBe(true);
  expect(enableBtn.getAttribute('aria-pressed')).toBe('true');
  expect(enableBtn.textContent).toBe('停用');
  expect(hooks.designIsEnabled()).toBe(true);
  const state = hooks.getState();
  const objs = hooks.getObjects();
  const obj = objs.find(o => state.level[o.y][o.x + 1] === 0);
  const startX = obj.x;
  const startY = obj.y;
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: startX * TILE + 1, clientY: startY * TILE + 1 }));
  canvas.dispatchEvent(new window.MouseEvent('pointermove', { clientX: (startX + 1) * TILE + 1, clientY: startY * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup'));
  expect(obj.x).toBe(startX + 1);
  expect(obj.y).toBe(startY);
});

test('selected object moves with WASD keys', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  enableBtn.click();
  const state = hooks.getState();
  const objs = hooks.getObjects();
  const obj = objs.find(o => state.level[o.y][o.x + 1] === 0);
  const startX = obj.x;
  const startY = obj.y;
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: startX * TILE + 1, clientY: startY * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup'));
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'd' }));
  expect(obj.x).toBe(startX + 1);
  expect(obj.y).toBe(startY);
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

test('getSelected returns object and render highlights it', async () => {
  const { hooks, canvas, ctx } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const obj = hooks.getObjects()[0];
  enableBtn.click();
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: obj.x * TILE + 1, clientY: obj.y * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { clientX: obj.x * TILE + 1, clientY: obj.y * TILE + 1 }));
  const sel = hooks.designGetSelected();
  expect(sel).toBe(obj);
  hooks.runRender();
  expect(ctx.strokeRect).toHaveBeenCalledWith(obj.x * TILE, obj.y * TILE, TILE, TILE);
});

test('clicking selected object again cancels selection', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const obj = hooks.getObjects()[0];
  enableBtn.click();
  const clientX = obj.x * TILE + 1;
  const clientY = obj.y * TILE + 1;
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX, clientY }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { clientX, clientY }));
  expect(hooks.designGetSelected()).toBe(obj);
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX, clientY }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { clientX, clientY }));
  expect(hooks.designGetSelected()).toBe(null);
});

test('add button inserts a 24px block centered below the HUD', async () => {
  const { hooks, ctx, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const addBtn = document.getElementById('design-add');
  const hud = document.getElementById('hud-top-center');
  expect(addBtn.hidden).toBe(true);
  enableBtn.click();
  expect(addBtn.hidden).toBe(false);
  addBtn.click();
  const state = hooks.getState();
  const hudRect = hud.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const px = state.camera.x + canvas.width / 2;
  const py = state.camera.y + (hudRect.bottom - canvasRect.top) + 4;
  const cx = Math.floor(px / (TILE / 2));
  const cy = Math.floor(py / (TILE / 2));
  const tx = Math.floor(cx / 2);
  const ty = Math.floor(cy / 2);
  const key = `${tx},${ty}`;
  const q = (cy % 2) * 2 + (cx % 2);
  const expected = [0,0,0,0]; expected[q] = 1;
  expect(state.patterns[key]).toEqual(expected);
  expect(state.collisions[cy][cx]).toBe(1);
  hooks.runRender();
  expect(ctx.fillRect.mock.calls.some(([x,y,w,h]) => x === tx * TILE && y === ty * TILE + TILE / 2 && w === TILE / 2 && h === TILE / 2)).toBe(true);
});

test('dragging an added 24px block preserves its pattern', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const addBtn = document.getElementById('design-add');
  const hud = document.getElementById('hud-top-center');
  enableBtn.click();
  addBtn.click();
  const state = hooks.getState();
  const hudRect = hud.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const px = state.camera.x + canvas.width / 2;
  const py = state.camera.y + (hudRect.bottom - canvasRect.top) + 4;
  const cx = Math.floor(px / (TILE / 2));
  const cy = Math.floor(py / (TILE / 2));
  const tx = Math.floor(cx / 2);
  const ty = Math.floor(cy / 2);
  const key = `${tx},${ty}`;
  const patt = state.patterns[key];
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: tx * TILE + 1, clientY: ty * TILE + 1 }));
  canvas.dispatchEvent(new window.MouseEvent('pointermove', { clientX: tx * TILE + 1, clientY: (ty + 1) * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup'));
  const newKey = `${tx},${ty + 1}`;
  expect(state.patterns[newKey]).toEqual(patt);
  expect(state.patterns[key]).toBeUndefined();
  expect(state.collisions[cy][cx]).toBe(0);
  expect(state.collisions[cy + 2][cx]).toBe(1);
});
