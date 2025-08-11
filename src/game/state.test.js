import { createGameState } from './state.js';
import { TILE } from './physics.js';

test('createGameState returns initial values', () => {
  const state = createGameState();
  expect(state.level.length).toBe(state.LEVEL_H);
  expect(state.level[0].length).toBe(state.LEVEL_W);
  expect(state.player.x).toBe(3 * TILE);
  expect(state.player.y).toBe(6 * TILE - 20);
  expect(state.player.w).toBe(56);
  expect(state.player.h).toBe(80);
  expect(state.coins.size).toBeGreaterThan(0);
});
