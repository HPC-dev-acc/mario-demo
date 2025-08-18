import { createNpc, updateNpc, isNpcOffScreen, boxesOverlap } from './npc.js';

function makeState() {
  return { level: [[0,0]], collisions: [[0,0],[0,0]], lights: {}, gravity: 0 };
}

test('npc walks left when not paused', () => {
  const npc = createNpc(100, 0, 10, 10, null, () => 0.5);
  const state = makeState();
  updateNpc(npc, 16, state, { x:1000, y:0, w:10, h:10 });
  expect(npc.x).toBeLessThan(100);
});

test('npc no longer auto-pauses on player collision', () => {
  const npc = createNpc(0, 0, 10, 10, null, () => 0.5);
  const state = makeState();
  updateNpc(npc, 16, state, { x:0, y:0, w:10, h:10 });
  expect(npc.pauseTimer).toBe(0);
});

test('npc off-screen detection', () => {
  const npc = createNpc(10,0,10,10,null,()=>0.5);
  expect(isNpcOffScreen(npc, 30)).toBe(true);
});

test('npc state updates with movement', () => {
  const npc = createNpc(0,0,10,10,null,()=>0.5);
  const state = makeState();
  expect(npc.state).toBe('walk');
  npc.runTimer = 1000;
  updateNpc(npc,16,state);
  expect(npc.state).toBe('run');
  npc.pauseTimer = 1000;
  updateNpc(npc,16,state);
  expect(npc.state).toBe('idle');
});

test('boxesOverlap detects overlap correctly', () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  const b = { x: 5, y: 5, w: 10, h: 10 };
  const c = { x: 20, y: 20, w: 5, h: 5 };
  expect(boxesOverlap(a, b)).toBe(true);
  expect(boxesOverlap(a, c)).toBe(false);
});

test('npc collision box tracks position', () => {
  const npc = createNpc(50, 50, 10, 20, null, () => 0.5);
  const state = makeState();
  updateNpc(npc, 16, state);
  expect(npc.box.x).toBeCloseTo(npc.x - npc.w / 2);
  expect(npc.box.y).toBeCloseTo(npc.y - npc.h / 2);
  expect(npc.box.w).toBe(npc.w);
  expect(npc.box.h).toBe(npc.h);
});
