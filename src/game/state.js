import { TILE, TRAFFIC_LIGHT, Y_OFFSET } from './physics.js';
import { BASE_W } from './width.js';
import objects from '../../assets/objects.js';

export function createGameState(customObjects = objects) {
  const LEVEL_W = 100, LEVEL_H = 12;
  const level = Array.from({ length: LEVEL_H }, (_, y) => {
    const row = Array.from({ length: LEVEL_W }, () => 0);
    if (y >= LEVEL_H - 5 && y < LEVEL_H - 3) row.fill(1);
    return row;
  });
  const coins = new Set();
  const lightConfigs = [];
  const transparent = new Set();
  for (const obj of customObjects) {
    const { type, x, y, transparent: isTransparent = false } = obj;
    if (isTransparent) transparent.add(`${x},${y}`);
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

  const state = { level, coins, initialLevel, lights: {}, player: null, camera: null, GOAL_X, LEVEL_W, LEVEL_H, spawnLights: null, playerSprites: null, trafficLightSprites: null, transparent };
  state.spawnLights = function spawnLights() {
    for (const k in state.lights) {
      const [lx, ly] = k.split(',').map(Number);
      if (level[ly][lx] === TRAFFIC_LIGHT) level[ly][lx] = 0;
    }
    state.lights = {};
    for (const { x, y } of lightConfigs) {
      level[y][x] = TRAFFIC_LIGHT;
      state.lights[`${x},${y}`] = { state: 'red', timer: 0 };
    }
  };
  state.spawnLights();

  state.player = { x: 3 * TILE, y: 3 * TILE - 20 + Y_OFFSET, w: BASE_W, h: 120, baseH: 120, baseW: BASE_W, vx: 0, vy: 0, onGround: false, facing: 1, sliding: 0 };
  state.player.shadowY = state.player.y + state.player.h / 2;
  state.camera = { x: 0, y: 0 };

  return state;
}
