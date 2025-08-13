import objects from '../assets/objects.custom.js';

test('objects custom y shifted up by two tiles', () => {
  const brick = objects.find(o => o.type === 'brick' && o.x === 45);
  expect(brick.y).toBe(3);
  const coin = objects.find(o => o.type === 'coin' && o.x === 12);
  expect(coin.y).toBe(4);
  const light = objects.find(o => o.type === 'light' && o.x === 15);
  expect(light.y).toBe(5);
});

