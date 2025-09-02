import { TILE } from './physics.js';

export const BASE_W = TILE * 2 / 3;

export function updatePlayerWidth(player) {
  player.w = BASE_W;
}
