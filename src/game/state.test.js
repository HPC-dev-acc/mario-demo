import { TILE, TRAFFIC_LIGHT } from './physics.js';
import { createGameState, Y_OFFSET, SPAWN_X, SPAWN_Y } from './state.js';
import { BASE_W } from './width.js';
import objects from '../../assets/objects.custom.js';

test('createGameState returns initial values', () => {
  const state = createGameState();
  expect(state.level.length).toBe(state.LEVEL_H);
  expect(state.level[0].length).toBe(state.LEVEL_W);
  expect(state.player.x).toBe(SPAWN_X);
  expect(state.player.y).toBe(SPAWN_Y);
  expect(state.player.w).toBe(BASE_W);
  expect(state.player.h).toBe(120);
  expect(state.player.shadowY).toBe(state.player.y + state.player.h / 2);
  expect(state.coins.size).toBeGreaterThan(0);
  expect(state.level[state.LEVEL_H - 5].every(v => v !== 0)).toBe(true);
  expect(state.level[state.LEVEL_H - 4].every(v => v !== 0)).toBe(true);
  expect(state.level[state.LEVEL_H - 3].every(v => v === 0)).toBe(true);
});

test('spawnLights places lights from object definitions', () => {
  const state = createGameState();
  const lights = objects.filter(o => o.type === 'light');
  lights.forEach(({ x, y }) => {
    const ly = y + Y_OFFSET;
    expect(state.level[ly][x]).toBe(TRAFFIC_LIGHT);
    expect(state.lights).toHaveProperty(`${x},${ly}`);
  });
  expect(Object.keys(state.lights)).toHaveLength(lights.length);
});

test('world is shifted down by Y_OFFSET tiles', () => {
  const state = createGameState();
  for (let y = 0; y < Y_OFFSET; y++) {
    expect(state.level[y].every(v => v === 0)).toBe(true);
  }
  const sample = objects.find(o => o.type === 'brick');
  expect(state.level[sample.y + Y_OFFSET][sample.x]).toBe(2);
});
