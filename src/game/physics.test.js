import { resolveCollisions, collectCoins, TILE, TRAFFIC_LIGHT, isJumpBlocked } from './physics.js';
import { BASE_W } from './width.js';

function makeLevel(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

test('entity does not pass through a wall', () => {
  const level = makeLevel(5, 5);
  level[2][3] = 1; // wall block to the right
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, level);
  expect(ent.vx).toBe(0);
  expect(ent.x).toBeLessThan(TILE * 3 - ent.w / 2);
});

test('horizontal collisions toggle blocked flag', () => {
  const level = makeLevel(5, 5);
  level[2][3] = 1; // wall block to the right
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, level);
  expect(ent.blocked).toBe(true);
  ent.x = TILE * 1;
  ent.vx = 0;
  resolveCollisions(ent, level);
  expect(ent.blocked).toBe(false);
});

test('traffic lights block only when red', () => {
  const level = makeLevel(5, 5);
  level[2][3] = TRAFFIC_LIGHT;
  const lights = { '3,2': { state: 'red' } };
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, level, lights);
  expect(ent.vx).toBe(0);

  // try again with green light
  ent.x = TILE * 2;
  ent.vx = 60;
  lights['3,2'].state = 'green';
  resolveCollisions(ent, level, lights);
  expect(ent.vx).not.toBe(0);

  // yellow light should also not block
  ent.x = TILE * 2;
  ent.vx = 60;
  lights['3,2'].state = 'yellow';
  resolveCollisions(ent, level, lights);
  expect(ent.vx).not.toBe(0);
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

test('jumping is blocked near red traffic light', () => {
  const lights = { '3,2': { state: 'red' } };
  const ent = { x: TILE * 3 + TILE / 2, y: TILE * 2 + TILE / 2 };
  expect(isJumpBlocked(ent, lights)).toBe(true);
  lights['3,2'].state = 'green';
  expect(isJumpBlocked(ent, lights)).toBe(false);
});

test('brick hit event triggers only on upward block collisions', () => {
  const level = makeLevel(3, 3);
  // place brick above the entity
  level[0][1] = 2;
  const ent = { x: TILE * 1 + TILE / 2, y: TILE * 1 + TILE / 2 + 20, w: BASE_W, h: 120, vx: 0, vy: -10, onGround: false };
  const events = {};
  resolveCollisions(ent, level, {}, events);
  expect(events.brickHit).toBe(true);

  // falling onto ground should not trigger brickHit
  const level2 = makeLevel(3, 3);
  level2[2][1] = 1;
  const ent2 = {
    x: TILE * 1 + TILE / 2,
    y: TILE * 2 - 41,
    w: BASE_W,
    h: 120,
    vx: 0,
    vy: 5,
    onGround: false,
  };
  const events2 = {};
  resolveCollisions(ent2, level2, {}, events2);
  expect(events2.brickHit).toBeUndefined();

  // hitting a wall sideways should also stay silent
  const level3 = makeLevel(3, 3);
  level3[1][2] = 1;
  const ent3 = { x: TILE * 1, y: TILE * 1, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  const events3 = {};
  resolveCollisions(ent3, level3, {}, events3);
  expect(events3.brickHit).toBeUndefined();
});
