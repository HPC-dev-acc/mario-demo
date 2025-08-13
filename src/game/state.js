import { TILE, TRAFFIC_LIGHT } from './physics.js';
import { BASE_W } from './width.js';
import objects from '../../assets/objects.js';

export const Y_OFFSET = 2;
export const SPAWN_X = 3 * TILE;
export const SPAWN_Y = (3 + Y_OFFSET) * TILE - 20;

export function createGameState(customObjects = objects.map(o => ({ ...o }))) {
  const LEVEL_W = 100, LEVEL_H = 12 + Y_OFFSET;
  const level = Array.from({ length: LEVEL_H }, (_, y) => {
    const row = Array.from({ length: LEVEL_W }, () => 0);
    if (y >= LEVEL_H - 5 && y < LEVEL_H - 3) row.fill(1);
    return row;
  });
  const coins = new Set();
  const lightConfigs = [];
  const transparent = new Set();
  const patterns = {};
  for (const obj of customObjects) {
    obj.y += Y_OFFSET;
    const { type, x, y, transparent: isTransparent = false, collision } = obj;
    if (isTransparent) transparent.add(`${x},${y}`);
    if (collision) patterns[`${x},${y}`] = collision;
    if (type === 'brick') level[y][x] = 2;
    else if (type === 'coin') {
      level[y][x] = 3;
      coins.add(`${x},${y}`);
    } else if (type === 'light') {
      lightConfigs.push(obj);
    }
  }
  const GOAL_X = 90 * TILE;

  const initialLevel = level.map(row => row.slice());

  function buildCollisions() {
    const grid = Array.from({ length: LEVEL_H * 2 }, () => Array(LEVEL_W * 2).fill(0));
    for (let y = 0; y < LEVEL_H; y++) {
      for (let x = 0; x < LEVEL_W; x++) {
        const t = level[y][x];
        if (t === 1 || t === 2 || t === TRAFFIC_LIGHT) {
          const base = t === TRAFFIC_LIGHT ? TRAFFIC_LIGHT : 1;
          const cy = y * 2, cx = x * 2;
          grid[cy][cx] = grid[cy][cx + 1] = grid[cy + 1][cx] = grid[cy + 1][cx + 1] = base;
        }
      }
    }
    for (const key in patterns) {
      const [x, y] = key.split(',').map(Number);
      const p = patterns[key];
      const cy = y * 2, cx = x * 2;
      grid[cy][cx] = p[0] ? 1 : 0;
      grid[cy][cx + 1] = p[1] ? 1 : 0;
      grid[cy + 1][cx] = p[2] ? 1 : 0;
      grid[cy + 1][cx + 1] = p[3] ? 1 : 0;
    }
    return grid;
  }

  const state = { level, coins, initialLevel, lights: {}, player: null, camera: null, GOAL_X, LEVEL_W, LEVEL_H, spawnLights: null, playerSprites: null, trafficLightSprites: null, transparent, collisions: null, patterns, buildCollisions };
  state.spawnLights = function spawnLights() {
    for (const k in state.lights) {
      const [lx, ly] = k.split(',').map(Number);
      if (level[ly][lx] === TRAFFIC_LIGHT) level[ly][lx] = 0;
    }
    state.lights = {};
    for (const { x, y } of lightConfigs) {
      level[y][x] = TRAFFIC_LIGHT;
      state.lights[`${x},${y}`] = { state: 'green', timer: 0 };
    }
    state.collisions = buildCollisions();
  };
  state.spawnLights();

  state.player = { x: SPAWN_X, y: SPAWN_Y, w: BASE_W, h: 120, baseH: 120, baseW: BASE_W, vx: 0, vy: 0, onGround: false, facing: 1, sliding: 0 };
  state.player.shadowY = state.player.y + state.player.h / 2;
  state.camera = { x: 0, y: 0 };

  return state;
}
