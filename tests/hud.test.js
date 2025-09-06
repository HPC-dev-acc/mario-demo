import { showHUD } from '../hud.js';

test('showHUD reveals HUD but not debug panel', () => {
  document.body.innerHTML = `
    <div id="hud-top-center" hidden></div>
    <div id="top-right" hidden></div>
    <div id="debug-panel" hidden></div>
    <div id="touch-left" hidden></div>
    <div id="touch-right" hidden></div>
  `;
  showHUD();
  ['hud-top-center','top-right','touch-left','touch-right'].forEach(id => {
    expect(document.getElementById(id).hidden).toBe(false);
  });
  expect(document.getElementById('debug-panel').hidden).toBe(true);
});
