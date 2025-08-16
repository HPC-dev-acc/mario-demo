import objects from '../assets/objects.custom.js';

test('objects custom y shifted up by two tiles', () => {
  const brick = objects.find(o => o.type === 'brick' && o.x === 45);
  expect(brick.y).toBe(3);
  const coin = objects.find(o => o.type === 'coin' && o.x === 12);
  expect(coin.y).toBe(4);
  const light = objects.find(o => o.type === 'light' && o.x === 15);
  expect(light.y).toBe(5);
});


test('includes new collision bricks', () => {
  const corner = objects.find(o => o.type === 'brick' && o.x === 38 && o.y === 4);
  expect(corner).toMatchObject({
    transparent: false,
    destroyable: false,
    collision: [1, 0, 0, 0]
  });
  const top = objects.find(o => o.type === 'brick' && o.x === 64 && o.y === 2);
  expect(top).toMatchObject({
    transparent: true,
    destroyable: false,
    collision: [1, 0, 0, 0]
  });
});
