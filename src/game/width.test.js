import { updatePlayerWidth, BASE_W } from './width.js';

test('BASE_W matches expected pixel width', () => {
  expect(BASE_W).toBe(84);
});

test('player width shrinks when idle on ground and restores when running', () => {
  const p = { running: false, blocked: false, onGround: true, w: BASE_W };
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W * 2 / 3);
  p.running = true;
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
});

test('player width stays base when jumping vertically', () => {
  const p = { running: false, blocked: false, onGround: false, w: BASE_W };
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
});

test('blocked players maintain base width even while running', () => {
  const p = { running: true, blocked: true, onGround: true, w: BASE_W };
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
});

test('player width stays base during slide', () => {
  const p = { running: false, blocked: false, onGround: true, w: BASE_W, sliding: 100 };
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
});
