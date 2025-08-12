import { resolveCollisions, TILE } from './game/physics.js';
import { updatePlayerWidth, BASE_W } from './game/width.js';

function makeLevel(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

test('player shrinks after colliding with wall', () => {
  const level = makeLevel(5, 5);
  level[2][3] = 1; // wall block to the right
  level[3][2] = 1; // ground block below
  const player = { x: TILE * 2, y: TILE * 3 - 40, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: true, sliding: 0 };
  resolveCollisions(player, level);
  updatePlayerWidth(player);
  expect(player.vx).toBe(0);
  expect(player.w).toBe(BASE_W * 2 / 3);
});
