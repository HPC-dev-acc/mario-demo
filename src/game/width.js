export const BASE_W = 84;

export function updatePlayerWidth(player) {
  if (player.onGround && player.sliding <= 0 && player.vx === 0) {
    player.w = BASE_W * 2 / 3;
  } else {
    player.w = BASE_W;
  }
}
