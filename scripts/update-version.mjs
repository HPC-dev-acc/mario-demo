import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json')));

const envRelease = process.env.RELEASE_VERSION;
const rawRelease = (envRelease || pkg.version).replace(/^v/, '');
const releaseVersion = rawRelease.split('+')[0];
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
const buildMeta = metaParts.length ? `build.${metaParts.join('.')}` : '';
const appVersion = `v${releaseVersion}`;

const versionJs = [
  `export const RELEASE_VERSION = '${releaseVersion}';`,
  `export const BUILD_NUMBER    = '${buildNumber}';`,
  `export const GIT_SHA         = '${gitSha}';`,
  `if (typeof window !== 'undefined') {`,
  `  window.__APP_VERSION__ = '${appVersion}';`,
  `  window.__APP_BUILD_META__ = '${buildMeta}';`,
  `}`,
  '',
].join('\n');
writeIfChanged(path.join(__dirname, '..', 'version.js'), versionJs);

const htmlPath = path.join(__dirname, '..', 'index.html');
let html = readFileSync(htmlPath, 'utf8');
const verRe = '[A-Za-z0-9.+-]+';
const updated = html
  .replace(new RegExp(`(style\\.css\\?v=)${verRe}`), `$1${releaseVersion}`)
  .replace(
    new RegExp(
      `<script\\s+(?:type="module"\\s+)?src="version.js\\?v=${verRe}"><\\/script>`
    ),
    `<script type="module" src="version.js?v=${releaseVersion}"></script>`
  )
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

