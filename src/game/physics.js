export const TILE = 48;
export const COLL_TILE = TILE / 2;
export const TRAFFIC_LIGHT = 4;

export const worldToTile = (px) => Math.floor(px / TILE);
export const worldToCollTile = (px) => Math.floor(px / COLL_TILE);

export function solidAt(collisions, x, y, lights = {}) {
  const tx = worldToCollTile(x);
  const ty = worldToCollTile(y);
  if (ty < 0 || ty >= collisions.length) return 0;
  if (tx < 0 || tx >= collisions[0].length) return 0;
  const t = collisions[ty][tx];
  if (t === TRAFFIC_LIGHT) return 0;
  return t;
}

export function findGroundY(collisions, x, fromY) {
  const tx = worldToCollTile(x);
  let ty = Math.max(0, worldToCollTile(fromY));
  for (; ty < collisions.length; ty++) {
    const t = collisions[ty][tx];
    if (t === 0 || t === TRAFFIC_LIGHT) continue;
    return ty * COLL_TILE;
  }
  return collisions.length * COLL_TILE;
}

export function isNearRedLight(ent, lights = {}) {
  const ex = worldToTile(ent.x);
  const ey = worldToTile(ent.y);
  for (const key in lights) {
    const [lx, ly] = key.split(',').map(Number);
    const light = lights[key];
    if (light.state === 'red' && Math.abs(lx - ex) <= 1 && Math.abs(ly - ey) <= 1) {
      return true;
    }
  }
  return false;
}

export function resolveCollisions(ent, level, collisions, lights = {}, events = {}, indestructible = new Set()) {
  ent.redLightPaused = isNearRedLight(ent, lights);
  if (ent.redLightPaused) {
    ent.vx *= 0.8;
    if (Math.abs(ent.vx) < 0.05) ent.vx = 0;
  }
  // Horizontal movement (side collisions pass through)
  ent.x += ent.vx;
  ent.blocked = false;

  // Vertical movement
  ent.y += ent.vy;
  const wasGround = ent.onGround;
  ent.onGround = false;
  if (ent.vy > 0) {
    const bottom = ent.y + ent.h / 2;
    const left = ent.x - ent.w / 2 + 6;
    const right = ent.x + ent.w / 2 - 6;
    for (let x = left; x <= right; x += COLL_TILE) {
      if (solidAt(collisions, x, bottom, lights)) {
        const centerTx = worldToCollTile(ent.x);
        const centerCy = worldToCollTile(bottom);
        if (collisions[centerCy]?.[centerTx] === TRAFFIC_LIGHT) continue;
        const tx = worldToCollTile(x);
        let cy = centerCy;
        while (cy >= 0 && collisions[cy][tx]) cy--;
        ent.y = (cy + 1) * COLL_TILE - ent.h / 2 - 0.01;
        ent.vy = 0;
        ent.onGround = true;
        break;
      }
    }
  } else if (ent.vy === 0) {
    const bottom = ent.y + ent.h / 2;
    const left = ent.x - ent.w / 2 + 6;
    const right = ent.x + ent.w / 2 - 6;
    for (let x = left; x <= right; x += COLL_TILE) {
      if (solidAt(collisions, x, bottom, lights)) {
        const centerTx = worldToCollTile(ent.x);
        const centerCy = worldToCollTile(bottom);
        if (collisions[centerCy]?.[centerTx] === TRAFFIC_LIGHT) continue;
        const tx = worldToCollTile(x);
        let cy = centerCy;
        while (cy >= 0 && collisions[cy][tx]) cy--;
        ent.y = (cy + 1) * COLL_TILE - ent.h / 2 - 0.01;
        ent.onGround = true;
        break;
      }
    }
    const top = ent.y - ent.h / 2;
    if (!ent.onGround) {
      for (let x = left; x <= right; x += COLL_TILE) {
        if (solidAt(collisions, x, top, lights)) {
          const tx = worldToCollTile(x);
          let cy = worldToCollTile(top);
          while (cy < collisions.length && collisions[cy][tx]) cy++;
          ent.y = cy * COLL_TILE + ent.h / 2 + 0.01;
          break;
        }
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
        if (
          Math.abs(ent.x - rx) < ent.w / 2 &&
          Math.abs(ent.y - ry) < ent.h / 2
        ) {
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

