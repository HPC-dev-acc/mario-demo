export const TILE = 48;
export const TRAFFIC_LIGHT = 4;

export const worldToTile = (px) => Math.floor(px / TILE);

export function solidAt(level, x, y, lights = {}) {
  const tx = worldToTile(x);
  const ty = worldToTile(y);
  if (ty < 0 || ty >= level.length) return 0;
  if (tx < 0 || tx >= level[0].length) return 0;
  const t = level[ty][tx];
  if (t === TRAFFIC_LIGHT) {
    const state = lights[`${tx},${ty}`]?.state;
    return state === 'red' ? TRAFFIC_LIGHT : 0;
  }
  return t === 1 || t === 2 ? t : 0;
}

export function resolveCollisions(ent, level, lights = {}) {
  // Horizontal movement
  ent.x += ent.vx;
  if (ent.vx < 0) {
    const left = ent.x - ent.w / 2;
    const top = ent.y - ent.h / 2 + 4;
    const bottom = ent.y + ent.h / 2 - 1;
    for (let y = top; y <= bottom; y += TILE / 2) {
      if (solidAt(level, left, y, lights)) {
        ent.x = Math.floor(left / TILE) * TILE + TILE + ent.w / 2 + 0.01;
        ent.vx = 0;
        break;
      }
    }
  } else if (ent.vx > 0) {
    const right = ent.x + ent.w / 2;
    const top = ent.y - ent.h / 2 + 4;
    const bottom = ent.y + ent.h / 2 - 1;
    for (let y = top; y <= bottom; y += TILE / 2) {
      if (solidAt(level, right, y, lights)) {
        ent.x = Math.floor(right / TILE) * TILE - ent.w / 2 - 0.01;
        ent.vx = 0;
        break;
      }
    }
  }

  // Vertical movement
  ent.y += ent.vy;
  const wasGround = ent.onGround;
  ent.onGround = false;
  if (ent.vy > 0) {
    const bottom = ent.y + ent.h / 2;
    const left = ent.x - ent.w / 2 + 6;
    const right = ent.x + ent.w / 2 - 6;
    for (let x = left; x <= right; x += TILE / 2) {
      if (solidAt(level, x, bottom, lights)) {
        ent.y = Math.floor(bottom / TILE) * TILE - ent.h / 2 - 0.01;
        ent.vy = 0;
        ent.onGround = true;
        break;
      }
    }
  } else if (ent.vy < 0) {
    const top = ent.y - ent.h / 2;
    const left = ent.x - ent.w / 2 + 6;
    const right = ent.x + ent.w / 2 - 6;
    for (let x = left; x <= right; x += TILE / 2) {
      const tx = worldToTile(x);
      const ty = worldToTile(top);
      if (ty >= 0 && level[ty][tx] === 2) {
        level[ty][tx] = 0;
        ent.vy = 2;
      }
      if (solidAt(level, x, top, lights)) {
        ent.y = Math.floor(top / TILE) * TILE + TILE + ent.h / 2 + 0.01;
        ent.vy = 0;
        break;
      }
    }
  }

  // Keep entity within horizontal level bounds
  const minX = ent.w / 2;
  const maxX = level[0].length * TILE - ent.w / 2;
  if (ent.x < minX) {
    ent.x = minX;
    ent.vx = 0;
  }
  if (ent.x > maxX) {
    ent.x = maxX;
    ent.vx = 0;
  }

  if (!wasGround && ent.onGround) {
    // ground entered
  }
  if (wasGround && !ent.onGround) {
    // ground left
  }
}

export function collectCoins(ent, level, coins) {
  const cx = worldToTile(ent.x);
  const cy = worldToTile(ent.y);
  let gained = 0;
  for (let y = cy - 1; y <= cy + 1; y++) {
    for (let x = cx - 1; x <= cx + 1; x++) {
      if (y < 0 || y >= level.length || x < 0 || x >= level[0].length) continue;
      if (level[y][x] === 3) {
        const rx = x * TILE + TILE / 2;
        const ry = y * TILE + TILE / 2;
        if (Math.abs(ent.x - rx) < 26 && Math.abs(ent.y - ry) < 26) {
          level[y][x] = 0;
          coins.delete(`${x},${y}`);
          ent.vy = Math.min(ent.vy, -3);
          gained += 10;
        }
      }
    }
  }
  return gained;
}

