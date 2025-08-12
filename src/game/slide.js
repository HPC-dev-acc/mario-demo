export function enterSlide(player) {
  if (!player.baseH) player.baseH = player.h;
  const newH = player.baseH * 0.75;
  const delta = (player.h - newH) / 2;
  player.h = newH;
  player.y += delta;
}

export function exitSlide(player) {
  if (!player.baseH) return;
  const oldH = player.h;
  player.h = player.baseH;
  const delta = (player.h - oldH) / 2;
  player.y -= delta;
}
