export function createControls(pressJump, releaseJump) {
  const keys = { left: false, right: false, jump: false, action: false };
  window.addEventListener('keydown', (e) => {
    const c = e.code || e.key;
    if (c === 'ArrowLeft' || c === 'KeyA') { e.preventDefault(); keys.left = true; }
    if (c === 'ArrowRight' || c === 'KeyD') { e.preventDefault(); keys.right = true; }
    if ((c === 'ArrowUp' || c === 'KeyW' || c === 'Space') && !keys.jump) {
      if (pressJump) pressJump('kbd');
      e.preventDefault();
    }
    if (c === 'KeyX' || c === 'KeyK' || c === 'KeyZ' || c === 'KeyJ') { e.preventDefault(); keys.action = true; }
  });
  window.addEventListener('keyup', (e) => {
    const c = e.code || e.key;
    if (c === 'ArrowLeft' || c === 'KeyA') keys.left = false;
    if (c === 'ArrowRight' || c === 'KeyD') keys.right = false;
    if (c === 'ArrowUp' || c === 'KeyW' || c === 'Space') {
      keys.jump = false;
      if (releaseJump) releaseJump();
    }
    if (c === 'KeyX' || c === 'KeyK' || c === 'KeyZ' || c === 'KeyJ') keys.action = false;
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
