import pkg from '../../package.json' assert { type: 'json' };
import { TILE } from '../game/physics.js';

async function loadGame() {
  document.body.innerHTML = `
    <canvas id="game"></canvas>
    <div id="design-enable"></div>
    <div id="design-transparent"></div>
    <div id="design-save"></div>
  `;
  const canvas = document.getElementById('game');
  canvas.getContext = () => ({
    fillRect: () => {},
  });
  window.__APP_VERSION__ = pkg.version;
  global.requestAnimationFrame = jest.fn();
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
  await new Promise((r) => setTimeout(r, 0));
  return { hooks: window.__testHooks, canvas, audio };
}

test('design mode drag, transparency toggle and save', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const transBtn = document.getElementById('design-transparent');
  const saveBtn = document.getElementById('design-save');
  const obj = hooks.getObjects()[0];
  const startX = obj.x;
  const startY = obj.y;
  enableBtn.click();
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: startX * TILE + 1, clientY: startY * TILE + 1 }));
  canvas.dispatchEvent(new window.MouseEvent('pointermove', { clientX: (startX + 1) * TILE + 1, clientY: startY * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup'));
  expect(hooks.getObjects()[0].x).toBe(startX + 1);
  expect(hooks.getObjects()[0].y).toBe(startY);
  transBtn.click();
  expect(hooks.getObjects()[0].transparent).toBe(true);
  const createObjectURL = jest.fn(() => 'blob:1');
  global.URL.createObjectURL = createObjectURL;
  const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  saveBtn.click();
  expect(createObjectURL).toHaveBeenCalled();
  const blob = createObjectURL.mock.calls[0][0];
  expect(blob.size).toBeGreaterThan(0);
  clickSpy.mockRestore();
});
