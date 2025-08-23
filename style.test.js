import fs from 'fs';

const css = fs.readFileSync('style.css', 'utf8');

describe('style.css', () => {
  test('#stage has max size limits', () => {
    const stage = css.match(/#stage\s*{[^}]*}/);
    expect(stage).toBeTruthy();
    const rule = stage[0];
    expect(rule).toMatch(/max-width:\s*calc\(var\(--game-w\)\s*\*\s*1px\)/);
    expect(rule).toMatch(/max-height:\s*calc\(var\(--game-h\)\s*\*\s*1px\)/);
  });

  test('.pill has border and background', () => {
    const pill = css.match(/\.pill\s*{[^}]*}/);
    expect(pill).toBeTruthy();
    const rule = pill[0];
    expect(rule).toMatch(/border:\s*1px solid/);
    expect(rule).toMatch(/background:\s*#fff/);
  });
});
