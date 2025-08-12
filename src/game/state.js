import { TILE, TRAFFIC_LIGHT } from './physics.js';
import { BASE_W } from './width.js';
import objects from '../../assets/objects.js';

export function createGameState() {
  const LEVEL_W = 100, LEVEL_H = 12;
  const level = Array.from({ length: LEVEL_H }, (_, y) => {
    const row = Array.from({ length: LEVEL_W }, () => 0);
    if (y >= LEVEL_H - 5 && y < LEVEL_H - 3) row.fill(1);
    return row;
  });
  const coins = new Set();
  const lightConfigs = [];
  for (const obj of objects) {
    if (obj.type === 'brick') level[obj.y][obj.x] = 2;
    else if (obj.type === 'coin') {
      level[obj.y][obj.x] = 3;
      coins.add(`${obj.x},${obj.y}`);
    } else if (obj.type === 'light') {
      lightConfigs.push(obj);
    }
  }
  const GOAL_X = 90 * TILE;

  const initialLevel = level.map(row => row.slice());

  const state = { level, coins, initialLevel, lights: {}, player: null, camera: null, GOAL_X, LEVEL_W, LEVEL_H, spawnLights: null, playerSprites: null, trafficLightSprites: null };
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

  state.player = { x: 3 * TILE, y: 3 * TILE - 20, w: BASE_W, h: 120, baseH: 120, baseW: BASE_W, vx: 0, vy: 0, onGround: false, facing: 1, sliding: 0 };
  state.player.shadowY = state.player.y + state.player.h / 2;
  state.camera = { x: 0, y: 0 };

  return state;
}
