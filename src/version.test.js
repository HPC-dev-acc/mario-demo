import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
import '../version.js';
import { initUI } from './ui/index.js';

test('injects package.json version into window', () => {
  expect(window.__APP_VERSION__).toBe(pkg.version);
});

test('displays injected version', () => {
  document.body.innerHTML = `
    <canvas id="game"></canvas>
    <div id="version-pill"></div>
    <div id="start-version"></div>
  `;
  initUI(document.getElementById('game'), {
    resumeAudio: () => {},
    toggleMusic: () => {},
    version: window.__APP_VERSION__,
  });
  window.dispatchEvent(new Event('load'));
  expect(document.getElementById('version-pill').textContent).toBe(`v${pkg.version}`);
  expect(document.getElementById('start-version').textContent).toBe(`v${pkg.version}`);
});

