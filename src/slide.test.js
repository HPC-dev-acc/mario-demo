import { initUI } from './ui/index.js';

function setupDOM() {
  document.body.innerHTML = '<div id="stage"><canvas id="game"></canvas><div id="hud"></div></div>';
  return document.getElementById('game');
}

test('slide effect draws at feet', () => {
  jest.useFakeTimers();
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const playerY = 200;
  const playerH = 120;
  ui.triggerSlideEffect(150, playerY + playerH / 2, 1);
  const fx = document.querySelector('.slide-effect');
  expect(fx.style.top).toBe(`${playerY + playerH / 2 - 12}px`);
  jest.advanceTimersByTime(500);
  expect(document.querySelector('.slide-effect')).toBeNull();
  jest.useRealTimers();
});
