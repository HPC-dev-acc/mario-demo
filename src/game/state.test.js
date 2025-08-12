import { TILE, TRAFFIC_LIGHT } from './physics.js';
import { createGameState } from './state.js';
import { BASE_W } from './width.js';

test('createGameState returns initial values', () => {
  const state = createGameState();
  expect(state.level.length).toBe(state.LEVEL_H);
  expect(state.level[0].length).toBe(state.LEVEL_W);
  expect(state.player.x).toBe(3 * TILE);
  expect(state.player.y).toBe(3 * TILE - 20);
  expect(state.player.w).toBe(BASE_W);
  expect(state.player.h).toBe(120);
  expect(state.player.shadowY).toBe(state.player.y + state.player.h / 2);
  expect(state.coins.size).toBeGreaterThan(0);
  expect(state.level[state.LEVEL_H - 5].every(v => v === 1)).toBe(true);
  expect(state.level[state.LEVEL_H - 4].every(v => v === 1)).toBe(true);
  expect(state.level[state.LEVEL_H - 3].every(v => v === 0)).toBe(true);
});

test('spawnLights places lights at quarter points', () => {
  const state = createGameState();
  const expected = [state.LEVEL_W / 4, state.LEVEL_W / 2, (3 * state.LEVEL_W) / 4].map(Math.floor);
  expected.forEach(x => {
    expect(state.level[6][x]).toBe(TRAFFIC_LIGHT);
    expect(state.lights).toHaveProperty(`${x},6`);
  });
  expect(Object.keys(state.lights)).toHaveLength(3);
});
