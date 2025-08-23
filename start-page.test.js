import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

let JSDOM;
beforeAll(async () => {
  ({ JSDOM } = await import('jsdom'));
});

test('start button is visible by default in index.html', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const btnStart = doc.getElementById('btn-start');
  const btnRetry = doc.getElementById('btn-retry');
  expect(btnStart).not.toBeNull();
  expect(btnStart.hasAttribute('hidden')).toBe(false);
  expect(btnRetry).not.toBeNull();
  expect(btnRetry.hasAttribute('hidden')).toBe(true);
});

test('style.css enables pointer events on start page', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toMatch(/#start-page\s*{[^}]*pointer-events:\s*auto;/m);
});
