import { TILE, TRAFFIC_LIGHT } from './physics.js';

export function createGameState() {
  const LEVEL_W = 100, LEVEL_H = 12;
  const level = Array.from({ length: LEVEL_H }, (_, y) => {
    const row = Array.from({ length: LEVEL_W }, () => 0);
    if (y >= LEVEL_H - 2) row.fill(1);
    return row;
  });
  for (let x = 10; x < 16; x++) level[8][x] = 2;
  for (let x = 30; x < 36; x++) level[9][x] = 2;
  for (let x = 46; x < 49; x++) level[6][x] = 2;
  for (let x = 70; x < 76; x++) level[9][x] = 2;
  const GOAL_X = 90 * TILE;

  const coins = new Set();
  const addCoin = (cx, cy) => { level[cy][cx] = 3; coins.add(`${cx},${cy}`); };
  addCoin(12, 7); addCoin(33, 8); addCoin(21, 6); addCoin(31, 8); addCoin(46, 5); addCoin(72, 8);

    const initialLevel = level.map(row => row.slice());

    const state = { level, coins, initialLevel, lights: {}, player: null, camera: null, GOAL_X, LEVEL_W, LEVEL_H, spawnLights: null, playerSprites: null };
  state.spawnLights = function spawnLights() {
    for (const k in state.lights) {
      const [lx, ly] = k.split(',').map(Number);
      if (level[ly][lx] === TRAFFIC_LIGHT) level[ly][lx] = 0;
    }
    state.lights = {};
    let placed = 0;
    while (placed < 3) {
      const x = Math.floor(Math.random() * LEVEL_W);
      if (level[9][x] === 0 && level[10][x] === 1) {
        level[9][x] = TRAFFIC_LIGHT;
        const states = ['red', 'yellow', 'green'];
        state.lights[`${x},9`] = { state: states[Math.floor(Math.random() * states.length)], timer: 0 };
        placed++;
      }
    }
  };
  state.spawnLights();

  state.player = { x: 3 * TILE, y: 6 * TILE - 20, w: 56, h: 80, baseH: 80, vx: 0, vy: 0, onGround: false, facing: 1, sliding: 0 };
  state.camera = { x: 0, y: 0 };

  return state;
}
