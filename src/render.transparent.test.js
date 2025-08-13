import { render } from './render.js';
import { createGameState } from './game/state.js';
import { TILE, solidAt, Y_OFFSET } from './game/physics.js';

test('transparent bricks collide but render with alpha', () => {
  const objects = [{ type: 'brick', x: 1, y: 1, transparent: true }];
  const state = createGameState(objects);
  const alphas = [];
  let alpha = 1;
  const ctx = {
    canvas: { width: 256, height: 240, style: {} },
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
    set globalAlpha(v) {
      alpha = v;
      alphas.push(v);
    },
    get globalAlpha() {
      return alpha;
    },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
  };
  render(ctx, state);
  expect(solidAt(state.level, TILE + 1, TILE + 1 + Y_OFFSET)).toBe(2);
  expect(alphas).toContain(0.5);
});

