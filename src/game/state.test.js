import { createGameState } from './state.js';
import { TILE } from './physics.js';

test('createGameState returns initial values', () => {
  const state = createGameState();
  expect(state.level.length).toBe(state.LEVEL_H);
  expect(state.level[0].length).toBe(state.LEVEL_W);
  expect(state.player.x).toBe(3 * TILE);
  expect(state.coins.size).toBeGreaterThan(0);
});
