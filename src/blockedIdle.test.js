import { resolveCollisions, TILE } from './game/physics.js';
import { updatePlayerWidth, BASE_W } from './game/width.js';

function makeWorld(w, h) {
  const level = Array.from({ length: h }, () => Array(w).fill(0));
  const collisions = Array.from({ length: h * 2 }, () => Array(w * 2).fill(0));
  return { level, collisions };
}
function setBlock(world, x, y, val) {
  world.level[y][x] = val;
  const base = val ? 1 : 0;
  const cy = y * 2, cx = x * 2;
  world.collisions[cy][cx] = world.collisions[cy][cx + 1] = world.collisions[cy + 1][cx] = world.collisions[cy + 1][cx + 1] = base;
}

test('player keeps base width when blocked while running', () => {
  const world = makeWorld(5, 5);
  setBlock(world, 3, 2, 1); // wall block to the right
  setBlock(world, 2, 3, 1); // ground block below
  const player = {
    x: TILE * 2,
    y: TILE * 3 - 40,
    w: BASE_W,
    h: 120,
    vx: 50,
    vy: 0,
    onGround: true,
    sliding: 0,
    running: true,
  };
  resolveCollisions(player, world.level, world.collisions);
  updatePlayerWidth(player);
  expect(player.vx).toBe(0);
  expect(player.w).toBe(BASE_W);
});
