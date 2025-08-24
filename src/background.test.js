import fs from 'fs';
import { render } from './render.js';
import { initUI } from './ui/index.js';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

test('background repeats and moves with camera', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toContain('background-image: url("assets/Background/background1.jpeg");');
  expect(css).toContain('background-repeat: repeat-x;');

  const stage = { style: {} };
  const canvas = { style: {}, width: 960, height: 540, parentElement: stage };
  const ctx = {
    canvas,
    clearRect: () => {},
    save: () => {},
    translate: () => {},
    restore: () => {},
    fillRect: () => {},
    beginPath: () => {},
    arc: () => {},
    ellipse: () => {},
    fill: () => {},
    strokeRect: () => {},
    scale: () => {},
    drawImage: () => {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
  };
  const state = {
    level: [],
    lights: {},
    player: { x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, w: 0, h: 0 },
    camera: { x: 0, y: 0 },
    GOAL_X: 0,
    LEVEL_W: 0,
    LEVEL_H: 0,
    playerSprites: {},
  };

  render(ctx, state);
  expect(stage.style.backgroundPosition).toBe('0px 0px');
  state.camera.x = 50;
  render(ctx, state);
  expect(stage.style.backgroundPosition).toBe('-50px 0px');
  canvas.clientWidth = 1920;
  render(ctx, state);
  expect(stage.style.backgroundPosition).toBe('-100px 0px');
});

test('16:10 window keeps objects aligned with background', () => {
  document.body.innerHTML =
    '<div id="stage"><canvas id="game"></canvas><div id="ped-dialog"></div></div>';
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('game');
  const dialog = document.getElementById('ped-dialog');
  dialog.classList.remove('hidden');
  canvas.dataset.cssScaleX = '1.5';
  canvas.dataset.cssScaleY = (900 / 540).toString();
  window.__cssScaleX = 1.5;
  window.__cssScaleY = 900 / 540;
  const ctx = {
    canvas,
    clearRect: () => {},
    save: () => {},
    translate: () => {},
    restore: () => {},
    fillRect: () => {},
    beginPath: () => {},
    arc: () => {},
    ellipse: () => {},
    fill: () => {},
    strokeRect: () => {},
    scale: () => {},
    drawImage: () => {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
  };
  const state = {
    level: [],
    lights: {},
    player: { x: 0, y: 0, h: 50 },
    camera: { x: 50, y: 0 },
    GOAL_X: 0,
    LEVEL_W: 0,
    LEVEL_H: 0,
    playerSprites: {},
  };
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  render(ctx, state);
  ui.syncDialogToPlayer(state.player, state.camera);
  expect(stage.style.backgroundPosition).toBe('-75px 0px');
  expect(dialog.style.left).toBe('-75px');
  delete window.__cssScaleX;
  delete window.__cssScaleY;
});
