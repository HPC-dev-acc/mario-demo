import { resolveCollisions, collectCoins, TILE, TRAFFIC_LIGHT, isJumpBlocked, COLL_TILE } from './physics.js';
import { BASE_W } from './width.js';

function makeWorld(w, h) {
  const level = Array.from({ length: h }, () => Array(w).fill(0));
  const collisions = Array.from({ length: h * 2 }, () => Array(w * 2).fill(0));
  return { level, collisions };
}
function setBlock(world, x, y, val) {
  world.level[y][x] = val;
  const base = val === TRAFFIC_LIGHT ? TRAFFIC_LIGHT : val ? 1 : 0;
  const cy = y * 2, cx = x * 2;
  world.collisions[cy][cx] = world.collisions[cy][cx + 1] = world.collisions[cy + 1][cx] = world.collisions[cy + 1][cx + 1] = base;
}

test('entity does not pass through a wall', () => {
  const world = makeWorld(5, 5);
  setBlock(world, 3, 2, 1); // wall block to the right
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.vx).toBe(0);
  expect(ent.x).toBeLessThan(TILE * 3 - ent.w / 2);
});

test('horizontal collisions toggle blocked flag', () => {
  const world = makeWorld(5, 5);
  setBlock(world, 3, 2, 1); // wall block to the right
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.blocked).toBe(true);
  ent.x = TILE * 1;
  ent.vx = 0;
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.blocked).toBe(false);
});

test('traffic lights block only when red', () => {
  const world = makeWorld(5, 5);
  setBlock(world, 3, 2, TRAFFIC_LIGHT);
  const lights = { '3,2': { state: 'red' } };
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, world.level, world.collisions, lights);
  expect(ent.vx).toBe(0);

  // try again with green light
  ent.x = TILE * 2;
  ent.vx = 60;
  lights['3,2'].state = 'green';
  resolveCollisions(ent, world.level, world.collisions, lights);
  expect(ent.vx).not.toBe(0);

  // yellow light should also not block
  ent.x = TILE * 2;
  ent.vx = 60;
  lights['3,2'].state = 'yellow';
  resolveCollisions(ent, world.level, world.collisions, lights);
  expect(ent.vx).not.toBe(0);
});

test('collecting a coin adds score and removes coin', () => {
  const world = makeWorld(3, 3);
  world.level[1][1] = 3; // coin tile
  const coins = new Set(['1,1']);
  const ent = { x: TILE * 1 + TILE / 2, y: TILE * 1 + TILE / 2, w: 20, h: 20, vx: 0, vy: 0 };
  const gained = collectCoins(ent, world.level, coins);
  expect(gained).toBe(10);
  expect(world.level[1][1]).toBe(0);
  expect(coins.has('1,1')).toBe(false);
});

test('coin collection uses entity dimensions for detection', () => {
  const coinX = TILE * 1 + TILE / 2;
  const coinY = TILE * 1 + TILE / 2;
  const positions = [
    { x: coinX + 30, y: coinY },
    { x: coinX - 30, y: coinY },
    { x: coinX, y: coinY + 50 },
    { x: coinX, y: coinY - 50 },
    { x: coinX + 30, y: coinY + 50 },
  ];
  for (const pos of positions) {
    const world = makeWorld(3, 3);
    world.level[1][1] = 3;
    const coins = new Set(['1,1']);
    const ent = { x: pos.x, y: pos.y, w: BASE_W, h: 120, vx: 0, vy: 0 };
    const gained = collectCoins(ent, world.level, coins);
    expect(gained).toBe(10);
  }
});

test('jumping is blocked near red traffic light', () => {
  const lights = { '3,2': { state: 'red' } };
  const ent = { x: TILE * 3 + TILE / 2, y: TILE * 2 + TILE / 2 };
  expect(isJumpBlocked(ent, lights)).toBe(true);
  lights['3,2'].state = 'green';
  expect(isJumpBlocked(ent, lights)).toBe(false);
});

test('brick hit event triggers only on upward block collisions', () => {
  const world = makeWorld(3, 3);
  // place brick above the entity
  setBlock(world, 1, 0, 2);
  const ent = { x: TILE * 1 + TILE / 2, y: TILE * 1 + TILE / 2 + 20, w: BASE_W, h: 120, vx: 0, vy: -10, onGround: false };
  const events = {};
  resolveCollisions(ent, world.level, world.collisions, {}, events);
  expect(events.brickHit).toBe(true);

  // falling onto ground should not trigger brickHit
  const world2 = makeWorld(3, 3);
  setBlock(world2, 1, 2, 1);
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
  resolveCollisions(ent2, world2.level, world2.collisions, {}, events2);
  expect(events2.brickHit).toBeUndefined();

  // hitting a wall sideways should also stay silent
  const world3 = makeWorld(3, 3);
  setBlock(world3, 2, 1, 1);
  const ent3 = { x: TILE * 1, y: TILE * 1, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  const events3 = {};
  resolveCollisions(ent3, world3.level, world3.collisions, {}, events3);
  expect(events3.brickHit).toBeUndefined();
});

test('non-destroyable bricks remain intact', () => {
  const world = makeWorld(3, 3);
  setBlock(world, 1, 0, 2);
  const ent = { x: TILE * 1 + TILE / 2, y: TILE * 1 + TILE / 2 + 20, w: BASE_W, h: 120, vx: 0, vy: -10, onGround: false };
  const events = {};
  const indestructible = new Set(['1,0']);
  resolveCollisions(ent, world.level, world.collisions, {}, events, indestructible);
  expect(events.brickHit).toBeUndefined();
  expect(world.level[0][1]).toBe(2);
});

test('supports half-tile collisions', () => {
  const world = makeWorld(1, 1);
  world.collisions[1][0] = 1;
  world.collisions[1][1] = 1;
  const ent = { x: COLL_TILE, y: 0, w: 20, h: 20, vx: 0, vy: 30, onGround: false };
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.onGround).toBe(true);
  expect(ent.y).toBeCloseTo(COLL_TILE - ent.h / 2 - 0.01);
});
