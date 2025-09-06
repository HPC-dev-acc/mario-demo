import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json')));

const envRelease = process.env.RELEASE_VERSION;
const releaseVersion = (envRelease || pkg.version).replace(/^v/, '');
const buildNumber = process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || '';
const gitSha = (process.env.GIT_SHA || process.env.GITHUB_SHA || '').slice(0, 7);

function writeIfChanged(filePath, content) {
  const current = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
  if (current !== content) {
    writeFileSync(filePath, content);
  }
}

const metaParts = [];
if (buildNumber) metaParts.push(buildNumber);
if (gitSha) metaParts.push(gitSha);
const appVersion = `v${releaseVersion}` + (metaParts.length ? `+build.${metaParts.join('.')}` : '');

const versionJs = `export const RELEASE_VERSION = '${releaseVersion}';\n` +
                   `export const BUILD_NUMBER = '${buildNumber}';\n` +
                   `export const GIT_SHA = '${gitSha}';\n` +
                   `window.__APP_VERSION__ = '${appVersion}';\n`;
writeIfChanged(path.join(__dirname, '..', 'version.js'), versionJs);

const htmlPath = path.join(__dirname, '..', 'index.html');
let html = readFileSync(htmlPath, 'utf8');
const verRe = '[A-Za-z0-9.+-]+';
const updated = html
  .replace(new RegExp(`(style\\.css\\?v=)${verRe}`), `$1${releaseVersion}`)
  .replace(new RegExp(`(version.js\\?v=)${verRe}`), `$1${releaseVersion}`)
  .replace(new RegExp(`(main.js\\?v=)${verRe}`), `$1${releaseVersion}`)
  .replace(new RegExp(`(manifest.json\\?v=)${verRe}`), `$1${releaseVersion}`)
  .replace(new RegExp(`(id="start-version"[^>]*>v)${verRe}`), `$1${releaseVersion}`)
  .replace(new RegExp(`(id="version-pill"[^>]*>v)${verRe}`), `$1${releaseVersion}`);
writeIfChanged(htmlPath, updated);

const manifestPath = path.join(__dirname, '..', 'manifest.json');
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.version = releaseVersion;
  writeIfChanged(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

