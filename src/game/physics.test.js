import { resolveCollisions, collectCoins, TILE } from './physics.js';

function makeLevel(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

test('entity does not pass through a wall', () => {
  const level = makeLevel(5, 5);
  level[2][3] = 1; // wall block to the right
  const ent = { x: TILE * 2, y: TILE * 2, w: 28, h: 40, vx: 60, vy: 0, onGround: false };
  resolveCollisions(ent, level);
  expect(ent.vx).toBe(0);
  expect(ent.x).toBeLessThan(TILE * 3 - ent.w / 2);
});

test('collecting a coin adds score and removes coin', () => {
  const level = makeLevel(3, 3);
  level[1][1] = 3; // coin tile
  const coins = new Set(['1,1']);
  const ent = { x: TILE * 1 + TILE / 2, y: TILE * 1 + TILE / 2, w: 20, h: 20, vx: 0, vy: 0 };
  const gained = collectCoins(ent, level, coins);
  expect(gained).toBe(10);
  expect(level[1][1]).toBe(0);
  expect(coins.has('1,1')).toBe(false);
});
