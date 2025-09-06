export const RELEASE_VERSION = '2.20.4';
export const BUILD_NUMBER    = '';
export const GIT_SHA         = 'dc9337d';

if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = 'v2.20.4';
  const meta = [];
  if (BUILD_NUMBER) meta.push(BUILD_NUMBER);
  if (GIT_SHA) meta.push(GIT_SHA);
  window.__APP_BUILD_META__ = meta.length ? `build.${meta.join('.')}` : '';
}
