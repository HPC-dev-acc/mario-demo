import { render } from './render.js';
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
