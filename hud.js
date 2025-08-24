export function showHUD() {
  ['hud-top-center', 'top-right', 'touch-left', 'touch-right'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = false;
  });
}
