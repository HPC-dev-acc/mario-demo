export const BASE_W = 84;

export function updatePlayerWidth(player) {
  if (!player.running && !player.blocked) {
    player.w = BASE_W * 2 / 3;
  } else {
    player.w = BASE_W;
  }
}
