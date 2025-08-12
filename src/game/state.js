import { TILE, TRAFFIC_LIGHT } from './physics.js';
import { BASE_W } from './width.js';

export function createGameState() {
  const LEVEL_W = 100, LEVEL_H = 12;
  const level = Array.from({ length: LEVEL_H }, (_, y) => {
    const row = Array.from({ length: LEVEL_W }, () => 0);
    if (y >= LEVEL_H - 5 && y < LEVEL_H - 3) row.fill(1);
    return row;
  });
  for (let x = 10; x < 16; x++) level[5][x] = 2;
  for (let x = 30; x < 36; x++) level[6][x] = 2;
  for (let x = 46; x < 49; x++) level[3][x] = 2;
  for (let x = 70; x < 76; x++) level[6][x] = 2;
  const GOAL_X = 90 * TILE;

  const coins = new Set();
  const addCoin = (cx, cy) => { level[cy][cx] = 3; coins.add(`${cx},${cy}`); };
  addCoin(12, 4); addCoin(33, 5); addCoin(21, 3); addCoin(31, 5); addCoin(46, 2); addCoin(72, 5);

    const initialLevel = level.map(row => row.slice());

      const state = { level, coins, initialLevel, lights: {}, player: null, camera: null, GOAL_X, LEVEL_W, LEVEL_H, spawnLights: null, playerSprites: null, trafficLightSprites: null };
  state.spawnLights = function spawnLights() {
    for (const k in state.lights) {
      const [lx, ly] = k.split(',').map(Number);
      if (level[ly][lx] === TRAFFIC_LIGHT) level[ly][lx] = 0;
    }
    state.lights = {};
    const xs = [LEVEL_W / 4, LEVEL_W / 2, (3 * LEVEL_W) / 4].map(Math.floor);
    xs.forEach(x => {
      level[6][x] = TRAFFIC_LIGHT;
      const states = ['red', 'yellow', 'green'];
      state.lights[`${x},6`] = { state: states[Math.floor(Math.random() * states.length)], timer: 0 };
    });
  };
  state.spawnLights();

  state.player = { x: 3 * TILE, y: 3 * TILE - 20, w: BASE_W, h: 120, baseH: 120, baseW: BASE_W, vx: 0, vy: 0, onGround: false, facing: 1, sliding: 0 };
  state.player.shadowY = state.player.y + state.player.h / 2;
  state.camera = { x: 0, y: 0 };

  return state;
}
