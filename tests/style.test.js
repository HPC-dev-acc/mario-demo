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

  test('#stage:fullscreen centers with letterboxing', () => {
    const rule = css.match(/#stage:fullscreen,\s*#game-root:fullscreen #stage\s*{[^}]*}/);
    expect(rule).toBeTruthy();
    const r = rule[0];
    expect(r).toMatch(/width:\s*min\(100vw,\s*100vh\s*\*\s*\(var\(--game-w\)\s*\/\s*var\(--game-h\)\)\)/);
    expect(r).toMatch(/height:\s*auto/);
    expect(r).toMatch(/margin:\s*auto/);
  });

  test('.pill has border and background', () => {
    const pill = css.match(/\.pill\s*{[^}]*}/);
    expect(pill).toBeTruthy();
    const rule = pill[0];
    expect(rule).toMatch(/border:\s*1px solid/);
    expect(rule).toMatch(/background:\s*#fff/);
  });

  test('touch controls hidden only on hover-capable devices', () => {
    const media = css.match(/@media\s*\(hover: hover\) and \(pointer: fine\)\s*{[\s\S]*?#touch-left,[\s\S]*?#touch-right[\s\S]*?{\s*display:\s*none\s*!important;\s*}[\s\S]*?}/);
    expect(media).toBeTruthy();
  });

  test('.touch-btn has responsive size', () => {
    const root = css.match(/:root\s*{[^}]*}/);
    expect(root).toBeTruthy();
    expect(root[0]).toMatch(/--touch-btn-size:\s*max\([^;]*px,[^;]*vw\)/);

    const btn = css.match(/\.touch-btn\s*{[^}]*}/);
    expect(btn).toBeTruthy();
    const rule = btn[0];
    expect(rule).toMatch(/width:\s*calc\(var\(--touch-btn-size\)\s*\*\s*var\(--ui-scale\)\)/);
    expect(rule).toMatch(/height:\s*calc\(var\(--touch-btn-size\)\s*\*\s*var\(--ui-scale\)\)/);
    expect(rule).toMatch(/font-size:\s*calc\(var\(--touch-btn-size\)\s*\/\s*2\s*\*\s*var\(--ui-scale\)\)/);
    expect(rule).toMatch(/opacity:\s*0?\.5/);
  });

  test('touch buttons are circular and pinned to screen corners', () => {
    const left = css.match(/#touch-left\s*{[^}]*}/);
    const right = css.match(/#touch-right\s*{[^}]*}/);
    expect(left).toBeTruthy();
    expect(right).toBeTruthy();
    expect(left[0]).toMatch(/left:\s*0/);
    expect(left[0]).toMatch(/bottom:\s*0/);
    expect(right[0]).toMatch(/right:\s*0/);
    expect(right[0]).toMatch(/bottom:\s*0/);

    const btn = css.match(/\.touch-btn\s*{[^}]*}/);
    expect(btn).toBeTruthy();
    expect(btn[0]).toMatch(/border-radius:\s*50%/);
  });

  test('#stage-clear and #stage-fail permit pointer events', () => {
    const stageClear = css.match(/#stage-clear\s*{[^}]*}/);
    const stageFail = css.match(/#stage-fail\s*{[^}]*}/);
    expect(stageClear).toBeTruthy();
    expect(stageFail).toBeTruthy();
    expect(stageClear[0]).toMatch(/pointer-events:\s*auto/);
    expect(stageFail[0]).toMatch(/pointer-events:\s*auto/);
  });

  test('#debug-panel has white background', () => {
    const rule = css.match(/#debug-panel\s*{[^}]*}/);
    expect(rule).toBeTruthy();
    expect(rule[0]).toMatch(/background:\s*rgba\(255,\s*255,\s*255/);
  });

  test('titles and restart buttons styled for clarity', () => {
    const titleRule = css.match(/#stage-clear\s*\.title,\s*#stage-fail\s*\.title\s*{[^}]*}/);
    expect(titleRule).toBeTruthy();
    expect(titleRule[0]).toMatch(/color:\s*#fff/);
    const btnRule = css.match(/#stage-clear button,\s*#stage-fail button\s*{[^}]*}/);
    expect(btnRule).toBeTruthy();
    expect(btnRule[0]).toMatch(/font-size:/);
  });

  test('ped dialog icon scales with text height', () => {
    const icon = css.match(/\.ped-dialog__icon\s*{[^}]*}/);
    expect(icon).toBeTruthy();
    expect(icon[0]).toMatch(/height:\s*1em/);
  });

  test('body and stage omit background images', () => {
    const body = css.match(/\nbody\s*{[^}]*}/);
    if (body) expect(body[0]).not.toMatch(/background-image/);

    const stage = css.match(/#stage\s*{[^}]*}/);
    expect(stage).toBeTruthy();
    expect(stage[0]).not.toMatch(/background-image/);
  });

  test('timer low-time animation is defined', () => {
    const rule = css.match(/#timer\.low-time\s*{[^}]*}/);
    expect(rule).toBeTruthy();
    expect(rule[0]).toMatch(/animation:\s*[^;]*timer-pulse/);
    const keyframes = css.match(/@keyframes\s*timer-pulse\s*{[\s\S]*?}/);
    expect(keyframes).toBeTruthy();
  });
});
