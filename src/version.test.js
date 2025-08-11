import pkg from '../package.json' assert { type: 'json' };
import { VERSION } from './version.js';
import { initUI } from './ui/index.js';

test('exports package.json version', () => {
  expect(VERSION).toBe(pkg.version);
});

test('displays package.json version', () => {
  document.body.innerHTML = `
    <canvas id="game"></canvas>
    <div id="version-pill"></div>
    <div id="start-version"></div>
  `;
  initUI(document.getElementById('game'), {
    resumeAudio: () => {},
    toggleMusic: () => {},
    version: VERSION,
  });
  window.dispatchEvent(new Event('load'));
  expect(document.getElementById('version-pill').textContent).toBe(`v${pkg.version}`);
  expect(document.getElementById('start-version').textContent).toBe(`v${pkg.version}`);
});

