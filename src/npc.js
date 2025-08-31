import { resolveCollisions, findGroundY } from './game/physics.js';

export const MAX_NPCS = 2;
const WALK_SPEED = 1.5;
const RUN_SPEED = 3.5;
const PAUSE_MIN = 400;
const PAUSE_MAX = 1200;
const NEXT_PAUSE_MIN = 2000;
const NEXT_PAUSE_MAX = 5000;
const RUN_MIN = 800;
const RUN_MAX = 1500;
const NEXT_RUN_MIN = 3000;
const NEXT_RUN_MAX = 6000;

function randRange(min, max, rand=Math.random) {
  return min + (max - min) * rand();
}

export function boxesOverlap(a, b) {
  return a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;
}

export function createNpc(x, y, w, h, sprite, rand=Math.random, facing=-1, opts={}, type='default') {
  const npc = {
    type,
    x, y, w, h,
    box: { x: x - w / 2, y: y - h / 2, w, h },
    vx: -WALK_SPEED,
    vy: 0,
    onGround: false,
    facing,
    pauseTimer: 0,
    knockbackTimer: 0,
    runTimer: 0,
    nextPause: randRange(NEXT_PAUSE_MIN, NEXT_PAUSE_MAX, rand),
    nextRun: randRange(NEXT_RUN_MIN, NEXT_RUN_MAX, rand),
    sprite,
    rand,
    state: 'walk',
    animTime: 0,
    bounceCount: 0,
    passThrough: false,
    bumped: false
  };
  if (opts.fixedSpeed !== undefined) {
    npc.fixedSpeed = opts.fixedSpeed;
    npc.nextPause = Infinity;
    npc.nextRun = Infinity;
    npc.runTimer = 0;
  }
  return npc;
}

export function updateNpc(npc, dtMs, state, player) {
  const rand = npc.rand || Math.random;
  npc.animTime += dtMs / 1000;
  if (npc.redLightPaused) {
    npc.vx = 0;
    npc.state = npc.bumped ? 'bump' : 'idle';
  } else if (npc.knockbackTimer > 0) {
    npc.knockbackTimer = Math.max(0, npc.knockbackTimer - dtMs);
    npc.vx *= 0.9;
    if (npc.knockbackTimer === 0) npc.vx = 0;
    npc.state = npc.bumped ? 'bump' : 'idle';
  } else if (npc.pauseTimer > 0) {
    npc.pauseTimer = Math.max(0, npc.pauseTimer - dtMs);
    npc.vx = 0;
    npc.state = npc.bumped ? 'bump' : 'idle';
  } else {
    npc.bumped = false;
    npc.nextPause -= dtMs;
    npc.nextRun -= dtMs;
    if (npc.fixedSpeed !== undefined) {
      npc.vx = npc.fixedSpeed;
      npc.state = 'walk';
    } else {
      if (npc.runTimer > 0) {
        npc.vx = -RUN_SPEED;
        npc.runTimer = Math.max(0, npc.runTimer - dtMs);
        npc.state = 'run';
      } else {
        npc.vx = -WALK_SPEED;
        npc.state = 'walk';
        if (npc.nextRun <= 0) {
          npc.runTimer = randRange(RUN_MIN, RUN_MAX, rand);
          npc.nextRun = randRange(NEXT_RUN_MIN, NEXT_RUN_MAX, rand);
        }
      }
      if (npc.nextPause <= 0) {
        npc.pauseTimer = randRange(PAUSE_MIN, PAUSE_MAX, rand);
        npc.nextPause = randRange(NEXT_PAUSE_MIN, NEXT_PAUSE_MAX, rand);
      }
    }
  }
  npc.vy += state.gravity * dtMs / 16.6667;
  resolveCollisions(npc, state.level, state.collisions, state.lights);
  npc.shadowY = findGroundY(state.collisions, npc.x, npc.y + npc.h / 2);
  npc.box.x = npc.x - npc.w / 2;
  npc.box.y = npc.y - npc.h / 2;
  npc.box.w = npc.w;
  npc.box.h = npc.h;
}

export function isNpcOffScreen(npc, cameraX) {
  return npc.x + npc.w/2 < cameraX;
}
