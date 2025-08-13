import { createGameState } from './state.js';
import { toLogical } from './serialize.js';

test('exports then re-import keeps same render position with Y_OFFSET', () => {
  const objects = [
    { type: 'brick', x: 2, y: 3, destroyable: false },
    { type: 'coin', x: 5, y: 1, transparent: true },
  ];

  const src = objects.map(o => ({ ...o }));
  createGameState(src);
  const worldYs = src.map(o => o.y);

  const exported = toLogical(src);
  createGameState(exported);
  const worldYs2 = exported.map(o => o.y);

  expect(worldYs2).toEqual(worldYs);
  expect(exported.find(o => o.type === 'brick').destroyable).toBe(false);
});
