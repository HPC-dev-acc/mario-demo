import { render, drawPlayer, Y_OFFSET } from './render.js';
import { createGameState } from './game/state.js';
import { TILE } from './game/physics.js';

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

test('render applies vertical offset', () => {
  const state = createGameState();
  state.camera.y = 10;
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
  expect(ctx.translate).toHaveBeenCalledWith(-state.camera.x, -state.camera.y + Y_OFFSET);
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

test('render does not draw goal line', () => {
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
  const xs = ctx.fillRect.mock.calls.map(c => c[0]);
  expect(xs).not.toContain(state.GOAL_X);
});

test('render omits ground tiles', () => {
  const state = {
    level: [[1]],
    lights: {},
    player: { x: 0, y: 0, w: 40, h: 40, facing: 1, sliding: 0, onGround: true, shadowY: 20 },
    camera: { x: 0, y: 0 },
    GOAL_X: 0,
    LEVEL_W: 1,
    LEVEL_H: 1,
    playerSprites: null,
  };
  const ctx = {
    canvas: { width: TILE, height: TILE },
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
    drawImage: jest.fn(),
    fillStyle: '',
  };
  render(ctx, state);
  expect(ctx.fillRect).not.toHaveBeenCalledWith(0, 0, TILE, TILE);
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
  const p = { x: 0, y: 0, shadowY: 24, facing: 1, w: 48, h: 48, vx: 0, vy: 0, onGround: true, sliding: 0, running: false, blocked: false };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.idle[0]);
  ctx.drawImage.mockClear();
  p.vx = 1; p.running = true;
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.run[0]);
  ctx.drawImage.mockClear();
  p.vx = 0; p.onGround = false; p.running = false;
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.jump[0]);
  ctx.drawImage.mockClear();
  p.onGround = true; p.sliding = 1; p.running = true;
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
  const p = { x: 0, y: 0, shadowY: 16, facing: 1, w: 48, h: 32, vx: 0, vy: 0, onGround: true, sliding: 0 };
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
  const p = { x: 0, y: 0, shadowY: 25, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
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
  const p = { x: 0, y: 0, shadowY: 25, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.ellipse).toHaveBeenCalledWith(p.x, p.shadowY, p.w / 2, p.h / 8, 0, 0, Math.PI * 2);
  const [, , rx, ry] = ctx.ellipse.mock.calls[0];
  expect(rx).toBeGreaterThan(ry);
  expect(fillStyle).toBe('rgba(0,0,0,0.3)');
  expect(ctx.fill).toHaveBeenCalled();
});

test('shadow position is unaffected by player y changes', () => {
  const img = {};
  const sprites = { idle: [img] };
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    fillStyle: '',
  };
  const p = { x: 5, y: 10, shadowY: 35, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  const first = ctx.ellipse.mock.calls[0];
  p.y += 20; // move player without updating shadowY
  drawPlayer(ctx, p, sprites, 0);
  const second = ctx.ellipse.mock.calls[1];
  expect(second[0]).toBe(first[0]);
  expect(second[1]).toBe(first[1]);
});
