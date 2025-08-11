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
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
  };
  expect(() => render(ctx, state)).not.toThrow();
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
    drawImage: jest.fn(), restore: jest.fn(),
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
