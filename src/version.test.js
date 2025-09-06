import pkg from '../package.json' assert { type: 'json' };
import { RELEASE_VERSION } from '../version.js';
import { initUI } from './ui/index.js';

test('injects release version into window', () => {
  expect(RELEASE_VERSION).toBe(pkg.version);
  expect(window.__APP_VERSION__).toBe(`v${RELEASE_VERSION}`);
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
    version: RELEASE_VERSION,
  });
  window.dispatchEvent(new Event('load'));
  expect(document.getElementById('version-pill').textContent).toBe(`v${RELEASE_VERSION}`);
  expect(document.getElementById('start-version').textContent).toBe(`v${RELEASE_VERSION}`);
});

