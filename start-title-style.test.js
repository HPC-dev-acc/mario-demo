import fs from 'fs';

test('start page title has large styled font', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toMatch(/#start-page\s*\.title\s*{[^}]*font-size:\s*72px;[^}]*text-shadow:[^}]*}/m);
});
