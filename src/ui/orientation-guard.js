(function () {
  // 建立樣式
  const style = document.createElement('style');
  style.textContent = `
    #orientation-overlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;
      background:rgba(10,10,10,.92);z-index:9999;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);
      touch-action:none}
    #orientation-overlay.active{display:flex}
    #orientation-overlay .oo-panel{color:#fff;text-align:center;padding:24px 28px;max-width:80vw;border-radius:12px;
      background:rgba(255,255,255,.06)}
    #orientation-overlay .oo-icon{font-size:48px;margin-bottom:12px}
    #orientation-overlay .oo-title{font-size:20px;font-weight:700;letter-spacing:.02em}
    #orientation-overlay .oo-sub{margin-top:6px;font-size:13px;opacity:.85}
  `;
  document.head.appendChild(style);

  // 建立遮罩
  const overlay = document.createElement('div');
  overlay.id = 'orientation-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="oo-panel">
      <div class="oo-icon" aria-hidden="true">🔄</div>
      <div class="oo-title">請將手機轉為橫向</div>
      <div class="oo-sub">Rotate your device to landscape</div>
    </div>`;
  document.body.appendChild(overlay);

  // 暫停與恢復鉤子
  function pauseGame() {
    window.__ORIENT_PAUSED__ = true;
    window.__ORIENT_BLOCK_INPUT__ = true;
    try { window.__BGM__ && window.__BGM__.mute && window.__BGM__.mute(true); } catch (e) {}
  }
  function resumeGame() {
    window.__ORIENT_PAUSED__ = false;
    window.__ORIENT_BLOCK_INPUT__ = false;
    try { window.__BGM__ && window.__BGM__.mute && window.__BGM__.mute(false); } catch (e) {}
  }

  // 曝露給全域
  window.__OrientationGuard__ = { pauseGame, resumeGame, overlay };

  // 偵測是否為橫向
  function isLandscape() {
    if (window.matchMedia) return window.matchMedia('(orientation: landscape)').matches;
    return window.innerWidth >= window.innerHeight;
  }

  // 主更新：切換遮罩與遊戲狀態
  function updateUI() {
    if (isLandscape()) {
      overlay.classList.remove('active');
      resumeGame();
      try { window.__resizeGameCanvas && window.__resizeGameCanvas(); } catch (e) {}
    } else {
      overlay.classList.add('active');
      pauseGame();
    }
  }

  // 去抖
  const recheck = () => {
    cancelAnimationFrame(recheck._rafId);
    recheck._rafId = requestAnimationFrame(updateUI);
  };

  // 事件
  window.addEventListener('orientationchange', recheck, { passive: true });
  window.addEventListener('resize', recheck, { passive: true });
  document.addEventListener('visibilitychange', recheck, { passive: true });

  // 初始化
  if (document.readyState === 'complete' || document.readyState === 'interactive') updateUI();
  else document.addEventListener('DOMContentLoaded', updateUI, { once: true });
})();
