import { updatePlayerWidth, BASE_W } from './width.js';

test('BASE_W matches expected pixel width', () => {
  expect(BASE_W).toBe(84);
});

test('player width shrinks when idle and restores when running', () => {
  const p = { running: false, blocked: false, w: BASE_W };
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W * 2 / 3);
  p.running = true;
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
});

test('blocked players maintain base width even while running', () => {
  const p = { running: true, blocked: true, w: BASE_W };
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
});
