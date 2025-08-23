import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json')));
const version = pkg.version;

// Helper to write a file only if its content would change
function writeIfChanged(filePath, content) {
  const current = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
  if (current !== content) {
    writeFileSync(filePath, content);
  }
}

// Generate version.js
writeIfChanged(
  path.join(__dirname, '..', 'version.js'),
  `window.__APP_VERSION__ = '${version}';\n`
);

// Update index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = readFileSync(htmlPath, 'utf8');
const updated = html
  .replace(/(style\.css\?v=)[0-9.]+/, `$1${version}`)
  .replace(/(version.js\?v=)[0-9.]+/, `$1${version}`)
  .replace(/(main.js\?v=)[0-9.]+/, `$1${version}`)
  .replace(/(manifest.json\?v=)[0-9.]+/, `$1${version}`)
  .replace(/(id="start-version"[^>]*>v)[0-9.]+/, `$1${version}`)
  .replace(/(id="version-pill"[^>]*>v)[0-9.]+/, `$1${version}`);
writeIfChanged(htmlPath, updated);

// Update manifest.json version
const manifestPath = path.join(__dirname, '..', 'manifest.json');
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.version = version;
  writeIfChanged(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}
