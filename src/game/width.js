import { TILE } from './physics.js';

export const BASE_W = 84;
export const COLL_W = TILE;

export function updatePlayerWidth(player) {
  player.w = COLL_W;
  if (player.sliding <= 0 && !player.running && !player.blocked && player.onGround) {
    player.renderW = BASE_W * 2 / 3;
  } else {
    player.renderW = BASE_W;
  }
}
