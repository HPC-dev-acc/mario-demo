import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

let JSDOM;
beforeAll(async () => {
  ({ JSDOM } = await import('jsdom'));
});

test('background1.jpeg is preloaded and applied to canvas', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const preload = doc.querySelector('link[rel="preload"][as="image"]');
  expect(preload).not.toBeNull();
  expect(preload.getAttribute('href')).toBe('assets/Background/background1.jpeg');

  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toMatch(/#game\{[^}]*background:url\("assets\/Background\/background1\.jpeg"\)[^}]*}/);
});

