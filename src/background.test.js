import { makeScaledBg, drawTiledBg } from './bg.js';
import { render } from './render.js';

test('drawTiledBg tiles image relative to camera.x', () => {
  const img = document.createElement('canvas');
  img.width = 50; img.height = 25;
  HTMLCanvasElement.prototype.getContext = () => ({ drawImage: () => {} });
  makeScaledBg(25, img);
  const calls = [];
  const ctx = { canvas: { width: 120, height: 25 }, drawImage: (...args) => calls.push(args) };
  drawTiledBg(ctx, 30);
  expect(calls.length).toBe(3);
  expect(calls[0][1]).toBe(-30);
});

test('render leaves DOM backgrounds untouched', () => {
  const stage = { style: {} };
  const canvas = { width: 100, height: 100, parentElement: stage, dataset: { cssScaleX: '1', cssScaleY: '1' } };
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
    LEVEL_W: 0,
    LEVEL_H: 0,
    playerSprites: {},
    npcs: [],
  };
  render(ctx, state);
  expect(stage.style.transform).toBeUndefined();
  expect(document.body.style.backgroundImage).toBe('');
});
