const BASE_CSS_W = 960;
const BASE_CSS_H = 540;

export function updateCamera(state) {
  const { player, camera, GOAL_X } = state;
  const getSize = window.__getLogicalViewSize || (() => ({ viewW: BASE_CSS_W, viewH: BASE_CSS_H }));
  const { viewW } = getSize();

  const LEFT_KEEP = 0.35;
  const RIGHT_KEEP = 0.65;

  const leftBound = camera.x + viewW * LEFT_KEEP;
  const rightBound = camera.x + viewW * RIGHT_KEEP;

  if (player.x < leftBound) {
    camera.x = player.x - viewW * LEFT_KEEP;
  } else if (player.x > rightBound) {
    camera.x = player.x - viewW * RIGHT_KEEP;
  }

  const maxCamX = Math.max(0, GOAL_X - viewW);
  if (camera.x < 0) camera.x = 0;
  if (camera.x > maxCamX) camera.x = maxCamX;

  camera.y = 0;
}
