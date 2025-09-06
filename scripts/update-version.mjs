import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json')));

const envRelease = process.env.RELEASE_VERSION;
const rawRelease = (envRelease || pkg.version).replace(/^v/, '');
const releaseVersion = rawRelease.split('+')[0];
const buildNumber = process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || '';
let gitSha = (process.env.GIT_SHA || process.env.GITHUB_SHA || '').slice(0, 7);
if (!gitSha) {
  try {
    gitSha = execSync('git rev-parse --short=7 HEAD', {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .toString()
      .trim();
  } catch {}
}
if (!gitSha) gitSha = 'devsha';

function writeIfChanged(filePath, content) {
  const current = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
  if (current !== content) {
    writeFileSync(filePath, content);
  }
}

const appVersion = `v${releaseVersion}`;

const versionJs = [
  `export const RELEASE_VERSION = '${releaseVersion}';`,
  `export const BUILD_NUMBER    = '${buildNumber}';`,
  `export const GIT_SHA         = '${gitSha}';`,
  '',
  `if (typeof window !== 'undefined') {`,
  `  window.__APP_VERSION__ = '${appVersion}';`,
  '  const meta = [];',
  '  if (BUILD_NUMBER) meta.push(BUILD_NUMBER);',
  '  if (GIT_SHA) meta.push(GIT_SHA);',
  "  window.__APP_BUILD_META__ = meta.length ? `build.${meta.join('.')}` : '';",
  '}',
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

