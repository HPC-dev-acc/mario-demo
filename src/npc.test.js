import { createNpc, updateNpc, isNpcOffScreen } from './npc.js';

function makeState() {
  return { level: [[0,0]], collisions: [[0,0],[0,0]], lights: {}, gravity: 0 };
}

test('npc walks left when not paused', () => {
  const npc = createNpc(100, 0, 10, 10, null, () => 0.5);
  const state = makeState();
  updateNpc(npc, 16, state, { x:1000, y:0, w:10, h:10 });
  expect(npc.x).toBeLessThan(100);
});

test('npc pauses on player collision', () => {
  const npc = createNpc(0, 0, 10, 10, null, () => 0.5);
  const state = makeState();
  updateNpc(npc, 16, state, { x:0, y:0, w:10, h:10 });
  expect(npc.pauseTimer).toBeGreaterThan(0);
});

test('npc off-screen detection', () => {
  const npc = createNpc(10,0,10,10,null,()=>0.5);
  expect(isNpcOffScreen(npc, 30)).toBe(true);
});
