import { render } from './render.js';

test('player animation changes with state', () => {
  const mk = (name) => ({ name });
  const sprites = {
    idle: [mk('idle')],
    run: [mk('run')],
    jump: [mk('jump')],
    slide: [mk('slide')],
  };
  const state = {
    level: [[0]],
    lights: {},
    player: { x: 0, y: 0, facing: 1, w: 48, h: 48, vx: 0, vy: 0, onGround: true, sliding: 0 },
    camera: { x: 0, y: 0 },
    GOAL_X: 0,
    LEVEL_W: 1,
    LEVEL_H: 1,
    playerSprites: sprites,
  };
  const ctx = {
    canvas: { width: 100, height: 100 },
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
    drawImage: jest.fn(),
  };
  global.performance.now = () => 0;
  render(ctx, state);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.idle[0]);
  ctx.drawImage.mockClear();
  state.player.vx = 1;
  render(ctx, state);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.run[0]);
  ctx.drawImage.mockClear();
  state.player.vx = 0; state.player.onGround = false;
  render(ctx, state);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.jump[0]);
  ctx.drawImage.mockClear();
  state.player.onGround = true; state.player.sliding = 1;
  render(ctx, state);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.slide[0]);
});
