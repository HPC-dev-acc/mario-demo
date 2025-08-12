import { updatePlayerWidth, BASE_W } from './width.js';

test('BASE_W matches expected pixel width', () => {
  expect(BASE_W).toBe(84);
});

test('player width shrinks when idle and restores when moving', () => {
  const p = { onGround: true, sliding: 0, vx: 0, w: BASE_W };
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W * 2 / 3);
  p.vx = 1;
  updatePlayerWidth(p);
  expect(p.w).toBe(BASE_W);
});
