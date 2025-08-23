import fs from 'fs';

test('style.css defines ui-scale variable', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toMatch(/--ui-scale/);
});
