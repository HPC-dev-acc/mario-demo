import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';
import pkg from '../package.json' assert { type: 'json' };

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

let JSDOM;
beforeAll(async () => {
  ({ JSDOM } = await import('jsdom'));
});

test('index.html uses package.json version in query params and badges', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  expect(doc.querySelector('#start-version').textContent).toBe(`v${pkg.version}`);
  expect(doc.querySelector('#version-pill').textContent).toBe(`v${pkg.version}`);
  expect(doc.querySelector('link[rel="stylesheet"]').getAttribute('href')).toBe(`style.css?v=${pkg.version}`);
  expect(doc.querySelector('script[src^="version.js"]').getAttribute('src')).toBe(`version.js?v=${pkg.version}`);
  expect(doc.querySelector('script[type="module"]').getAttribute('src')).toBe(`main.js?v=${pkg.version}`);
});
