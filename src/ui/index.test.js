import { initUI } from './index.js';

test('initUI exposes Logger', () => {
  document.body.innerHTML = '<canvas id="game"></canvas>';
  const canvas = document.getElementById('game');
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  expect(typeof ui.Logger.info).toBe('function');
});
