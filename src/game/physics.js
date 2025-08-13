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
  if (t === TRAFFIC_LIGHT) {
    const state = lights[`${Math.floor(tx / 2)},${Math.floor(ty / 2)}`]?.state;
    return state === 'red' ? TRAFFIC_LIGHT : 0;
  }
  return t;
}

export function findGroundY(collisions, x, fromY, lights = {}) {
  const tx = worldToCollTile(x);
  let ty = Math.max(0, worldToCollTile(fromY));
  for (; ty < collisions.length; ty++) {
    const t = collisions[ty][tx];
    if (t === 0) continue;
    if (t === TRAFFIC_LIGHT) {
      const state = lights[`${Math.floor(tx / 2)},${Math.floor(ty / 2)}`]?.state;
      if (state !== 'red') continue;
    }
    if (t) {
      return ty * COLL_TILE;
    }
  }
  return collisions.length * COLL_TILE;
}

export function isJumpBlocked(ent, lights = {}) {
  const tx = worldToTile(ent.x);
  const ty = worldToTile(ent.y);
  for (const key in lights) {
    const [lx, ly] = key.split(',').map(Number);
    if (lights[key].state === 'red' && Math.abs(lx - tx) <= 1 && Math.abs(ly - ty) <= 1) {
      return true;
    }
  }
  return false;
}

export function resolveCollisions(ent, level, collisions, lights = {}, events = {}) {
  // Horizontal movement
  ent.x += ent.vx;
  ent.blocked = false;
  if (ent.vx < 0) {
    const left = ent.x - ent.w / 2;
    const top = ent.y - ent.h / 2 + 4;
    const bottom = ent.y + ent.h / 2 - 1;
    for (let y = top; y <= bottom; y += COLL_TILE) {
      if (solidAt(collisions, left, y, lights)) {
        const ty = worldToCollTile(y);
        let cx = worldToCollTile(left);
        while (cx < collisions[0].length && collisions[ty][cx]) cx++;
        ent.x = cx * COLL_TILE + ent.w / 2 + 0.01;
        ent.vx = 0;
        ent.blocked = true;
        break;
      }
    }
  } else if (ent.vx > 0) {
    const right = ent.x + ent.w / 2;
    const top = ent.y - ent.h / 2 + 4;
    const bottom = ent.y + ent.h / 2 - 1;
    for (let y = top; y <= bottom; y += COLL_TILE) {
      if (solidAt(collisions, right, y, lights)) {
        const ty = worldToCollTile(y);
        let cx = worldToCollTile(right);
        while (cx >= 0 && collisions[ty][cx]) cx--;
        ent.x = (cx + 1) * COLL_TILE - ent.w / 2 - 0.01;
        ent.vx = 0;
        ent.blocked = true;
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
    for (let x = left; x <= right; x += COLL_TILE) {
      if (solidAt(collisions, x, bottom, lights)) {
        const tx = worldToCollTile(x);
        let cy = worldToCollTile(bottom);
        while (cy >= 0 && collisions[cy][tx]) cy--;
        ent.y = (cy + 1) * COLL_TILE - ent.h / 2 - 0.01;
        ent.vy = 0;
        ent.onGround = true;
        break;
      }
    }
  } else if (ent.vy < 0) {
    const top = ent.y - ent.h / 2;
    const left = ent.x - ent.w / 2 + 6;
    const right = ent.x + ent.w / 2 - 6;
    for (let x = left; x <= right; x += COLL_TILE) {
      const tx = worldToTile(x);
      const ty = worldToTile(top);
      if (ty >= 0 && level[ty][tx] === 2) {
        level[ty][tx] = 0;
        const cy = ty * 2, cx = tx * 2;
        collisions[cy][cx] = collisions[cy][cx + 1] = collisions[cy + 1][cx] = collisions[cy + 1][cx + 1] = 0;
        ent.vy = 2;
        events.brickHit = true;
      }
      if (solidAt(collisions, x, top, lights)) {
        const tx = worldToCollTile(x);
        let cy = worldToCollTile(top);
        while (cy < collisions.length && collisions[cy][tx]) cy++;
        ent.y = cy * COLL_TILE + ent.h / 2 + 0.01;
        ent.vy = 0;
        break;
      }
    }
  } else {
    const bottom = ent.y + ent.h / 2;
    const left = ent.x - ent.w / 2 + 6;
    const right = ent.x + ent.w / 2 - 6;
    for (let x = left; x <= right; x += COLL_TILE) {
      if (solidAt(collisions, x, bottom, lights)) {
        const tx = worldToCollTile(x);
        let cy = worldToCollTile(bottom);
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

