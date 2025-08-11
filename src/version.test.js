import pkg from '../package.json';
import { VERSION } from './version.js';
import { initUI } from './ui/index.js';

test('displays package.json version', () => {
  document.body.innerHTML = `
    <canvas id="game"></canvas>
    <div id="version-pill"></div>
    <div id="start-version"></div>
  `;
  expect(VERSION).toBe(pkg.version);
  initUI(document.getElementById('game'), { resumeAudio: () => {}, toggleMusic: () => {}, version: VERSION });
  window.dispatchEvent(new Event('load'));
  expect(document.getElementById('version-pill').textContent).toBe(`v${pkg.version}`);
  expect(document.getElementById('start-version').textContent).toBe(`v${pkg.version}`);
});
