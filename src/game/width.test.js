import { updatePlayerWidth, BASE_W, COLL_W } from './width.js';
import { TILE } from './physics.js';

test('base and collision widths match expected pixel values', () => {
  expect(BASE_W).toBe(84);
  expect(COLL_W).toBe(TILE);
});

test('player render width shrinks when idle on ground while collision width stays one tile', () => {
  const p = { running: false, blocked: false, onGround: true, w: COLL_W, renderW: BASE_W, sliding: 0 };
  updatePlayerWidth(p);
  expect(p.renderW).toBe(BASE_W * 2 / 3);
  expect(p.w).toBe(COLL_W);
  p.running = true;
  updatePlayerWidth(p);
  expect(p.renderW).toBe(BASE_W);
  expect(p.w).toBe(COLL_W);
});

test('player width stays one tile when jumping vertically', () => {
  const p = { running: false, blocked: false, onGround: false, w: COLL_W, renderW: BASE_W };
  updatePlayerWidth(p);
  expect(p.renderW).toBe(BASE_W);
  expect(p.w).toBe(COLL_W);
});

test('blocked players maintain one-tile width even while running', () => {
  const p = { running: true, blocked: true, onGround: true, w: COLL_W, renderW: BASE_W };
  updatePlayerWidth(p);
  expect(p.renderW).toBe(BASE_W);
  expect(p.w).toBe(COLL_W);
});

test('player width stays one tile during slide', () => {
  const p = { running: false, blocked: false, onGround: true, w: COLL_W, renderW: BASE_W, sliding: 100 };
  updatePlayerWidth(p);
  expect(p.renderW).toBe(BASE_W);
  expect(p.w).toBe(COLL_W);
});
