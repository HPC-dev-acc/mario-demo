import objects from '../../assets/objects.js';
import { TRAFFIC_LIGHT } from './physics.js';
import { createGameState, Y_OFFSET } from './state.js';

test('loads objects.js into game state', () => {
  expect(Array.isArray(objects)).toBe(true);
  const state = createGameState();
  const brickCount = objects.filter(o => o.type === 'brick').length;
  const coinCount = objects.filter(o => o.type === 'coin').length;
  const lightCount = objects.filter(o => o.type === 'light').length;

  let bricks = 0;
  for (const row of state.level) bricks += row.filter(v => v === 2).length;
  expect(bricks).toBe(brickCount);
  expect(state.coins.size).toBe(coinCount);
  expect(Object.keys(state.lights)).toHaveLength(lightCount);

  const sampleCoin = objects.find(o => o.type === 'coin');
  expect(state.level[sampleCoin.y + Y_OFFSET][sampleCoin.x]).toBe(3);
  expect(state.coins.has(`${sampleCoin.x},${sampleCoin.y + Y_OFFSET}`)).toBe(true);

  const sampleLight = objects.find(o => o.type === 'light');
  expect(state.level[sampleLight.y + Y_OFFSET][sampleLight.x]).toBe(TRAFFIC_LIGHT);
  expect(state.lights).toHaveProperty(`${sampleLight.x},${sampleLight.y + Y_OFFSET}`);
});
