import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';


global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

let JSDOM;
beforeAll(async () => { ({ JSDOM } = await import('jsdom')); });

test('index.html includes splash screen logo', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const dom = new JSDOM(html);
  const logo = dom.window.document.querySelector('#splash .logo');
  expect(logo).not.toBeNull();
  expect(logo.textContent.trim()).toBe('HPC GAMES');
});

test('style.css styles splash screen', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toMatch(/#splash\s*{[^}]*background:\s*#000;[^}]*pointer-events:\s*none;[^}]*animation:[^}]*}/m);
});

test('splash logo font size scales with viewport', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  expect(css).toMatch(/#splash\s*\.logo\s*{[^}]*font-size:\s*clamp\(32px,\s*10vw,\s*64px\);/m);
});

