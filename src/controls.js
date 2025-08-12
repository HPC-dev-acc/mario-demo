export function createControls(pressJump, releaseJump) {
  const keys = { left: false, right: false, jump: false, action: false };
  window.addEventListener('keydown', (e) => {
    const c = e.code;
    const k = e.key?.toLowerCase();
    if (c === 'ArrowLeft' || k === 'a') { e.preventDefault(); keys.left = true; }
    if (c === 'ArrowRight' || k === 'd') { e.preventDefault(); keys.right = true; }
    if ((c === 'ArrowUp' || c === 'Space' || k === 'w' || k === 'z') && !keys.jump) {
      if (pressJump) pressJump('kbd');
      e.preventDefault();
    }
    if (k === 'x' || k === 'k' || k === 'j') { e.preventDefault(); keys.action = true; }
  });
  window.addEventListener('keyup', (e) => {
    const c = e.code;
    const k = e.key?.toLowerCase();
    if (c === 'ArrowLeft' || k === 'a') keys.left = false;
    if (c === 'ArrowRight' || k === 'd') keys.right = false;
    if (c === 'ArrowUp' || c === 'Space' || k === 'w' || k === 'z') {
      keys.jump = false;
      if (releaseJump) releaseJump();
    }
    if (k === 'x' || k === 'k' || k === 'j') keys.action = false;
  });
  const bindHold = (id, prop) => {
    const el = document.getElementById(id); if (!el) return;
    const on = () => { keys[prop] = true; el.classList.add('hold'); if (prop === 'jump' && typeof pressJump === 'function') pressJump('touch'); };
    const off = () => { if (prop === 'jump' && releaseJump) releaseJump(); keys[prop] = false; el.classList.remove('hold'); };
    const start = e => { e.preventDefault(); on(); }, end = e => { e.preventDefault(); off(); };
    el.addEventListener('pointerdown', start, { passive: false });
    el.addEventListener('pointerup', end, { passive: false });
    el.addEventListener('pointerleave', end, { passive: false });
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('touchcancel', end, { passive: false });
  };
  bindHold('left', 'left'); bindHold('right', 'right'); bindHold('jump', 'jump'); bindHold('action', 'action');
  return keys;
}
