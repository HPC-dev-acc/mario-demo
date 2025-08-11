import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json')));
const version = pkg.version;

// Generate version.js
writeFileSync(path.join(__dirname, '..', 'version.js'), `window.__APP_VERSION__ = '${version}';\n`);

// Update index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = readFileSync(htmlPath, 'utf8');
html = html
  .replace(/(style\.css\?v=)[0-9.]+/, `$1${version}`)
  .replace(/(version.js\?v=)[0-9.]+/, `$1${version}`)
  .replace(/(main.js\?v=)[0-9.]+/, `$1${version}`)
  .replace(/(id="start-version"[^>]*>v)[0-9.]+/, `$1${version}`)
  .replace(/(id="version-pill"[^>]*>v)[0-9.]+/, `$1${version}`);
writeFileSync(htmlPath, html);
