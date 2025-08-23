export function showHUD() {
  ['hud-top-center', 'top-right', 'debug-panel', 'touch-left', 'touch-right'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = false;
  });
}
