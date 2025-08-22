import { resolveCollisions, collectCoins, TILE, TRAFFIC_LIGHT, COLL_TILE, isNearRedLight } from './physics.js';
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

test('entity passes through a wall', () => {
  const world = makeWorld(5, 5);
  setBlock(world, 3, 2, 1); // wall block to the right
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.vx).toBe(50);
  expect(ent.x).toBeGreaterThan(TILE * 3 - ent.w / 2);
});

test('misaligned side collisions do not stop the entity', () => {
  const world = makeWorld(5, 5);
  setBlock(world, 3, 2, 1);
  const ent = { x: TILE * 2, y: TILE * 2 + COLL_TILE / 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.vx).toBe(50);
  expect(ent.x).toBeGreaterThan(TILE * 3 - ent.w / 2);
});

test('horizontal collisions no longer toggle blocked flag', () => {
  const world = makeWorld(5, 5);
  setBlock(world, 3, 2, 1); // wall block to the right
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.blocked).toBe(false);
  ent.x = TILE * 1;
  ent.vx = 0;
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.blocked).toBe(false);
});

test('traffic lights are always pass-through', () => {
  const world = makeWorld(5, 5);
  setBlock(world, 3, 2, TRAFFIC_LIGHT);
  const lights = { '3,2': { state: 'red' } };
  const ent = { x: TILE * 2, y: TILE * 2, w: BASE_W, h: 120, vx: 50, vy: 0, onGround: false };
  resolveCollisions(ent, world.level, world.collisions, lights);
  expect(ent.vx).not.toBe(0);
  ent.x = TILE * 2;
  ent.vx = 60;
  lights['3,2'].state = 'green';
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

test('isNearRedLight detects proximity', () => {
  const lights = { '3,2': { state: 'red' } };
  const ent = { x: TILE * 3 + TILE / 2, y: TILE * 2 + TILE / 2 };
  expect(isNearRedLight(ent, lights)).toBe(true);
  lights['3,2'].state = 'green';
  expect(isNearRedLight(ent, lights)).toBe(false);
});

test('resolveCollisions flags redLightPaused near red light', () => {
  const world = makeWorld(5,5);
  setBlock(world,3,2,TRAFFIC_LIGHT);
  const lights = { '3,2': { state: 'red' } };
  const ent = { x: TILE * 3 + TILE / 2, y: TILE * 2 + TILE / 2, w: BASE_W, h: 120, vx: 0, vy: 0 };
  resolveCollisions(ent, world.level, world.collisions, lights);
  expect(ent.redLightPaused).toBe(true);
  lights['3,2'].state = 'green';
  resolveCollisions(ent, world.level, world.collisions, lights);
  expect(ent.redLightPaused).toBe(false);
});

test('bricks remain intact when hit from below and no event is fired', () => {
  const world = makeWorld(3, 3);
  setBlock(world, 1, 0, 2);
  const ent = {
    x: TILE * 1 + TILE / 2,
    y: TILE * 1 + TILE / 2 + 20,
    w: BASE_W,
    h: 120,
    vx: 0,
    vy: -10,
    onGround: false,
  };
  const events = {};
  resolveCollisions(ent, world.level, world.collisions, {}, events);
  expect(events.brickHit).toBeUndefined();
  expect(world.level[0][1]).toBe(2);
  const cy = 0, cx = 2;
  expect(world.collisions[cy][cx]).toBe(1);
  expect(world.collisions[cy][cx + 1]).toBe(1);
  expect(world.collisions[cy + 1][cx]).toBe(1);
  expect(world.collisions[cy + 1][cx + 1]).toBe(1);
});

test('player moving upward through a block retains velocity and position until gravity reverses it', () => {
  const world = makeWorld(3, 3);
  setBlock(world, 1, 0, 1);
  const ent = {
    x: TILE * 1 + TILE / 2,
    y: TILE * 2 + TILE / 2,
    w: BASE_W,
    h: 120,
    vx: 0,
    vy: -20,
    onGround: false,
  };
  const startY = ent.y;
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.vy).toBe(-20);
  expect(ent.y).toBe(startY - 20);
  ent.vy = 10;
  const midY = ent.y;
  resolveCollisions(ent, world.level, world.collisions);
  expect(ent.y).toBe(midY + 10);
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
