export function initUI(canvas, { resumeAudio, toggleMusic, version }) {
  const gameWrap = document.getElementById('game-wrap');

  const Logger = (() => {
    const BUF_MAX = 400;
    const buf = [];
    const nowISO = () => new Date().toISOString();
    async function copy() {
      try { await navigator.clipboard.writeText(buf.join('\n')); } catch (e) {}
    }
    function clear() { buf.length = 0; }
    function push(level, evt, data) {
      const rec = { ts: nowISO(), level, evt };
      if (data && typeof data === 'object' && Object.keys(data).length) rec.data = data;
      buf.push(JSON.stringify(rec)); if (buf.length > BUF_MAX) buf.shift();
    }
    return { copy, clear, push,
      info: (e, d) => push('INFO', e, d),
      debug: (e, d) => push('DEBUG', e, d),
      error: (e, d) => push('ERROR', e, d) };
  })();
  document.getElementById('log-copy')?.addEventListener('click', () => Logger.copy());
  document.getElementById('log-clear')?.addEventListener('click', () => Logger.clear());

  const settingsToggle = document.getElementById('settings-toggle');
  const settingsMenu = document.getElementById('settings-menu');
  if (settingsToggle && settingsMenu) {
    settingsToggle.addEventListener('click', () => {
      settingsMenu.classList.toggle('open');
    });
  }

  const bgmToggle = document.getElementById('bgm-toggle');
  if (bgmToggle) {
    bgmToggle.addEventListener('click', () => {
      const on = toggleMusic();
      bgmToggle.textContent = on ? 'Mute' : 'Unmute';
    });
  }

  canvas.setAttribute('tabindex', '0');
  function refocus(e) { try { if (e) e.preventDefault(); canvas.focus(); } catch (_) {} }
  function setVersionBadge() { const el = document.getElementById('version-pill'); if (el) el.textContent = `v${version}`; }
  window.addEventListener('load', () => { refocus(); setVersionBadge(); });
  window.addEventListener('pointerdown', (e) => { refocus(e); }, { passive: false });
  window.addEventListener('keydown', () => resumeAudio(), { once: true });
  window.addEventListener('pointerdown', () => resumeAudio(), { once: true });

  const dbg = {
    fpsEl: document.getElementById('dbg-fps'),
    posEl: document.getElementById('dbg-pos'),
    velEl: document.getElementById('dbg-vel'),
    groundEl: document.getElementById('dbg-ground'),
    coyoteEl: document.getElementById('dbg-coyote'),
    bufferEl: document.getElementById('dbg-buffer'),
    keysEl: document.getElementById('dbg-keys'),
    pressEl: document.getElementById('dbg-press'),
    firedEl: document.getElementById('dbg-fired'),
  };

  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const stageClearEl = document.getElementById('stage-clear');
  const stageFailEl = document.getElementById('stage-fail');

  function triggerClearEffect() {
    if (!stageClearEl) return;
    const fx = document.createElement('img');
    fx.src = 'assets/clear-star.svg';
    fx.alt = '';
    fx.className = 'clear-effect';
    stageClearEl.appendChild(fx);
    setTimeout(() => fx.remove(), 1500);
  }
  function triggerSlideEffect(x, y, facing) {
    if (!gameWrap) return;
    const fx = document.createElement('img');
    fx.src = 'assets/slide-dust.svg';
    fx.alt = '';
    fx.className = 'slide-effect';
    fx.style.left = `${x}px`;
    fx.style.top = `${y}px`;
    fx.style.setProperty('--sx', facing);
    gameWrap.appendChild(fx);
    setTimeout(() => fx.remove(), 500);
  }
  function triggerFailEffect() {
    if (!gameWrap) return;
    const fx = document.createElement('div');
    fx.className = 'fail-effect';
    gameWrap.appendChild(fx);
    setTimeout(() => fx.remove(), 1000);
  }
  function showStageClear() { if (stageClearEl) stageClearEl.hidden = false; }
  function showStageFail() { if (stageFailEl) stageFailEl.hidden = false; }
  function hideStageOverlays() { if (stageClearEl) stageClearEl.hidden = true; if (stageFailEl) stageFailEl.hidden = true; }

  return { Logger, dbg, scoreEl, timerEl, triggerClearEffect, triggerSlideEffect, triggerFailEffect, showStageClear, showStageFail, hideStageOverlays };
}
