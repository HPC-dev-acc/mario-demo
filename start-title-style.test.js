import fs from 'fs';

test('start page title scales responsively with drop shadow', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toMatch(/#start-page\s*\.title\s*{[^}]*font-size:\s*clamp\(32px,\s*12vw,\s*72px\);[^}]*text-shadow:[^}]*}/m);
});
