import { updatePlayerWidth, BASE_W } from './width.js';
import { TILE } from './physics.js';

test('BASE_W is two-thirds of TILE', () => {
  expect(BASE_W).toBe(TILE * 2 / 3);
});

test('updatePlayerWidth assigns constant width', () => {
  const p = { running: false, blocked: false, onGround: false, sliding: 100, w: 0 };
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
  p.running = true; p.blocked = true; p.onGround = true; p.sliding = 0;
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
});
