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

export function createNpc(x, y, w, h, sprite, rand=Math.random) {
  return {
    x, y, w, h,
    vx: -WALK_SPEED,
    vy: 0,
    onGround: false,
    facing: -1,
    pauseTimer: 0,
    runTimer: 0,
    nextPause: randRange(NEXT_PAUSE_MIN, NEXT_PAUSE_MAX, rand),
    nextRun: randRange(NEXT_RUN_MIN, NEXT_RUN_MAX, rand),
    sprite,
    rand,
    state: 'walk',
    animTime: 0
  };
}

export function updateNpc(npc, dtMs, state, player) {
  const rand = npc.rand || Math.random;
  npc.animTime += dtMs / 1000;
  if (npc.pauseTimer > 0) {
    npc.pauseTimer = Math.max(0, npc.pauseTimer - dtMs);
    npc.vx = 0;
    npc.state = 'idle';
  } else {
    npc.nextPause -= dtMs;
    npc.nextRun -= dtMs;
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
  npc.vy += state.gravity * dtMs / 16.6667;
  resolveCollisions(npc, state.level, state.collisions, state.lights);
  npc.shadowY = findGroundY(state.collisions, npc.x, npc.y + npc.h / 2, state.lights);
  if (player && Math.abs(player.x - npc.x) < (player.w + npc.w)/2 && Math.abs(player.y - npc.y) < (player.h + npc.h)/2) {
    npc.pauseTimer = randRange(PAUSE_MIN, PAUSE_MAX, rand);
    npc.state = 'idle';
  }
}

export function isNpcOffScreen(npc, cameraX) {
  return npc.x + npc.w/2 < cameraX;
}
