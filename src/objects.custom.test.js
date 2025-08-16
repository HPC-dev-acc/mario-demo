import objects from '../assets/objects.custom.js';

test('objects are well-formed with numeric coordinates', () => {
  expect(Array.isArray(objects)).toBe(true);
  objects.forEach(o => {
    expect(o).toEqual(
      expect.objectContaining({
        type: expect.any(String),
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );
  });
});

test('includes brick, coin, and light objects', () => {
  ['brick', 'coin', 'light'].forEach(type => {
    expect(objects.some(o => o.type === type)).toBe(true);
  });
});

test('includes collision bricks with expected patterns', () => {
  const patterns = [
    { transparent: true, destroyable: false, collision: [0, 0, 1, 0] },
    { transparent: true, destroyable: false, collision: [1, 0, 0, 0] },
    { collision: [0, 0, 0, 1] },
  ];
  patterns.forEach(pattern => {
    expect(objects).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'brick', ...pattern })])
    );
  });
});
