import fs from 'fs';
import { render } from './render.js';
import { initUI } from './ui/index.js';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

test('background repeats, centers vertically, and moves with camera', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toContain('background-image: url("assets/Background/background1.jpeg");');
  expect(css).toContain('background-repeat: repeat-x;');

  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 540 });
  const stage = { style: {} };
  const canvas = { style: {}, width: 960, height: 540, clientHeight: 540, parentElement: stage, dataset: { cssScaleX: '1' } };
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
  expect(stage.style.backgroundPosition).toBe('0px calc(0px - 0px)');
  expect(stage.style.backgroundSize).toBe(`auto ${canvas.clientHeight}px`);
  expect(document.body.style.backgroundSize).toBe(`auto ${canvas.clientHeight}px`);
  state.camera.x = 50;
  render(ctx, state);
  expect(stage.style.backgroundPosition).toBe('-50px calc(0px - 0px)');
  state.camera.y = 25;
  render(ctx, state);
  expect(stage.style.backgroundPosition).toBe('-50px calc(0px - 25px)');
  canvas.dataset.cssScaleX = '2';
  render(ctx, state);
  expect(stage.style.backgroundPosition).toBe('-100px calc(0px - 50px)');
});

test('uses cssScaleX from dataset when provided', () => {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 540 });
  const stage = { style: {} };
  const canvas = { style: {}, width: 960, height: 540, clientHeight: 540, parentElement: stage, dataset: { cssScaleX: '2' } };
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
    camera: { x: 50, y: 0 },
    GOAL_X: 0,
    LEVEL_W: 0,
    LEVEL_H: 0,
    playerSprites: {},
  };
  render(ctx, state);
  expect(stage.style.backgroundPosition).toBe('-100px calc(0px - 0px)');
});

test('16:10 viewport keeps 16:9 canvas and aligns background', () => {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
  document.body.innerHTML = '<div id="stage"></div><div id="ped-dialog"></div>';
  const dialog = document.getElementById('ped-dialog');
  dialog.classList.remove('hidden');
  const stage = { style: {} };
  const scale = 1440 / 960;
  const canvas = {
    style: {},
    width: 960,
    height: 540,
    clientWidth: 1440,
    clientHeight: 810,
    parentElement: stage,
    dataset: { cssScaleX: scale.toString(), cssScaleY: scale.toString() },
  };
  window.__cssScaleX = scale;
  window.__cssScaleY = scale;
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
  const ui = initUI(document.createElement('canvas'), {
    resumeAudio: () => {},
    toggleMusic: () => true,
    version: '0',
  });
  render(ctx, state);
  expect(canvas.clientWidth / canvas.clientHeight).toBeCloseTo(16 / 9, 5);
  expect(stage.style.backgroundSize).toBe(`auto ${canvas.clientHeight}px`);
  ui.syncDialogToPlayer(state.player, state.camera);
  expect(stage.style.backgroundPosition).toBe('-75px calc(45px - 0px)');
  expect(parseFloat(dialog.style.left)).toBeCloseTo(-75, 1);
  delete window.__cssScaleX;
  delete window.__cssScaleY;
});
