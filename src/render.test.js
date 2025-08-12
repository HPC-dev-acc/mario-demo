import { render, drawPlayer } from './render.js';
import { createGameState } from './game/state.js';

test('render runs without throwing', () => {
  const state = createGameState();
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
  };
  expect(() => render(ctx, state)).not.toThrow();
});

test('render does not call drawCloud', () => {
  const state = createGameState();
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
  };
  global.drawCloud = jest.fn();
  render(ctx, state);
  expect(global.drawCloud).not.toHaveBeenCalled();
  delete global.drawCloud;
});

test('render does not draw bottom green ground', () => {
  const state = createGameState();
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
  };
  render(ctx, state);
  expect(ctx.fillRect).not.toHaveBeenCalledWith(0, ctx.canvas.height - 28, ctx.canvas.width, 28);
});

test('drawPlayer chooses correct sprite', () => {
  const mk = (name) => ({ name });
  const sprites = {
    idle: [mk('idle')],
    run: [mk('run')],
    jump: [mk('jump')],
    slide: [mk('slide')],
  };
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    fillStyle: '',
  };
  const p = { x: 0, y: 0, facing: 1, w: 48, h: 48, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.idle[0]);
  ctx.drawImage.mockClear();
  p.vx = 1;
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.run[0]);
  ctx.drawImage.mockClear();
  p.vx = 0; p.onGround = false;
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.jump[0]);
  ctx.drawImage.mockClear();
  p.onGround = true; p.sliding = 1;
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.slide[0]);
});

test('drawPlayer centers sprite with correct size', () => {
  const img = {};
  const sprites = { idle: [img] };
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    fillStyle: '',
  };
  const p = { x: 0, y: 0, facing: 1, w: 48, h: 32, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage).toHaveBeenCalledWith(img, -p.w / 2, -p.h / 2, p.w, p.h);
});

test('drawPlayer scales image to player dimensions', () => {
  const img = {};
  const sprites = { idle: [img] };
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    fillStyle: '',
  };
  const p = { x: 0, y: 0, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  const call = ctx.drawImage.mock.calls[0];
  expect(call[3]).toBe(p.w);
  expect(call[4]).toBe(p.h);
});

test('drawPlayer draws a shadow beneath the player', () => {
  const img = {};
  const sprites = { idle: [img] };
  let fillStyle;
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    get fillStyle() { return fillStyle; },
    set fillStyle(v) { fillStyle = v; },
  };
  const p = { x: 0, y: 0, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.ellipse).toHaveBeenCalledWith(0, p.h / 2, p.w / 2, p.h / 4, 0, 0, Math.PI * 2);
  expect(fillStyle).toBe('rgba(0,0,0,0.3)');
  expect(ctx.fill).toHaveBeenCalled();
});
