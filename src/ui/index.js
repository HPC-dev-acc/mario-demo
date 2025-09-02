import { CAMERA_OFFSET_Y } from '../render.js';

export function initUI(canvas, { resumeAudio, toggleMusic, version, design } = {}) {
  const stage = document.getElementById('stage');
  const startPage = document.getElementById('start-page');
  const startStatus = document.getElementById('start-status');
  const startVersion = document.getElementById('start-version');
  const loadingProgress = document.getElementById('loading-progress');
  const btnStart = document.getElementById('btn-start');
  const btnRetry = document.getElementById('btn-retry');
  const btnRestart = document.getElementById('btn-restart');
  const btnRestartFail = document.getElementById('btn-restart-fail');
  const pedDialogEl = document.getElementById('ped-dialog');
  const pedDialogText = pedDialogEl?.querySelector('.ped-dialog__text');
  const langSelect = document.getElementById('lang-select');
  let currentLang = langSelect?.value || 'en';
  const scoreLabel = document.getElementById('score-label');
  const stagePill = document.getElementById('stage-pill');
  const timeLabel = document.getElementById('time-label');
  const settingsToggle = document.getElementById('settings-toggle');
  const langControls = document.getElementById('lang-controls');
  const devControls = document.getElementById('dev-controls');
  const logControls = document.getElementById('log-controls');
  const audioControls = document.getElementById('audio-controls');
  const designControls = document.getElementById('design-controls');
  const langLabelEl = langControls?.querySelector('strong');
  const devLabelEl = devControls?.querySelector('strong');
  const logLabelEl = logControls?.querySelector('strong');
  const audioLabelEl = audioControls?.querySelector('strong');
  const levelLabelEl = designControls?.querySelector('strong');
  const logCopy = document.getElementById('log-copy');
  const logClear = document.getElementById('log-clear');
  const bgmToggle = document.getElementById('bgm-toggle');
  const devToggle = document.getElementById('dev-toggle');
  const enableBtn = document.getElementById('design-enable');
  const transBtn = document.getElementById('design-transparent');
  const destroyBtn = document.getElementById('design-destroyable');
  const saveBtn = document.getElementById('design-save');
  const addBtn = document.getElementById('design-add');
  const infoPanel = document.querySelector('#top-right #info-panel');
  const docTitle = document.getElementById('doc-title');
  const docText = infoPanel?.querySelector('.doc');
  let bgmOn = true;
  let devOn = false;
  let designOn = false;
  const pedDialogMap = {
    wait: {
      en: 'Want to dash through, but can’t…',
      ja: '走り抜けたいけど、できない…',
      'zh-Hant': '想要衝過去，卻不能……',
      'zh-Hans': '想要冲过去，却不能……',
    },
  };
  let currentDialogKey = null;
  const uiText = {
    score: { en: 'Score', ja: 'スコア', 'zh-Hant': '分數', 'zh-Hans': '分数' },
    stage: { en: 'Stage 1-1', ja: 'ステージ 1-1', 'zh-Hant': '關卡 1-1', 'zh-Hans': '关卡 1-1' },
    time: { en: 'Time', ja: '時間', 'zh-Hant': '時間', 'zh-Hans': '时间' },
    settings: { en: 'Settings', ja: '設定', 'zh-Hant': '設定', 'zh-Hans': '设置' },
    lang: { en: 'LANG', ja: '言語', 'zh-Hant': '語言', 'zh-Hans': '语言' },
    dev: { en: 'DEV', ja: '開発', 'zh-Hant': '開發', 'zh-Hans': '开发' },
    log: { en: 'LOG', ja: 'ログ', 'zh-Hant': '記錄', 'zh-Hans': '日志' },
    copy: { en: 'Copy', ja: 'コピー', 'zh-Hant': '複製', 'zh-Hans': '复制' },
    clear: { en: 'Clear', ja: 'クリア', 'zh-Hant': '清除', 'zh-Hans': '清空' },
    bgm: { en: 'BGM', ja: 'BGM', 'zh-Hant': 'BGM', 'zh-Hans': 'BGM' },
    mute: { en: 'Mute', ja: 'ミュート', 'zh-Hant': '靜音', 'zh-Hans': '静音' },
    unmute: { en: 'Unmute', ja: 'ミュート解除', 'zh-Hant': '取消靜音', 'zh-Hans': '取消静音' },
    devOn: { en: 'On', ja: 'オン', 'zh-Hant': '開啟', 'zh-Hans': '开启' },
    devOff: { en: 'Off', ja: 'オフ', 'zh-Hant': '關閉', 'zh-Hans': '关闭' },
    level: { en: 'LEVEL', ja: 'レベル', 'zh-Hant': '關卡', 'zh-Hans': '关卡' },
    enable: { en: 'Enable', ja: '有効', 'zh-Hant': '啟用', 'zh-Hans': '启用' },
    disable: { en: 'Disable', ja: '無効', 'zh-Hant': '停用', 'zh-Hans': '停用' },
    transparent: { en: 'Transparent', ja: '透明化', 'zh-Hant': '透明化', 'zh-Hans': '透明化' },
    destroy: { en: 'Break', ja: '破壊', 'zh-Hant': '破壞', 'zh-Hans': '破坏' },
    save: { en: 'Save', ja: '保存', 'zh-Hant': '儲存', 'zh-Hans': '保存' },
    add: { en: 'Add', ja: '追加', 'zh-Hant': '新增', 'zh-Hans': '新增' },
    restart: { en: 'Restart', ja: '再スタート', 'zh-Hant': '重新開始', 'zh-Hans': '重新开始' },
    infoTitle: {
      en: 'Pixel Run Demo (Mario-style)',
      ja: 'ピクセルランデモ（マリオ風）',
      'zh-Hant': '像素跑跳示範（類瑪莉風格）',
      'zh-Hans': '像素跑跳示范（类玛莉风格）',
    },
    infoText: {
      en: 'PC: Use arrow keys to move, Z to jump, X for actions.<br/>Mobile: Tap the on-screen buttons.<br/>This open-source demo uses no Nintendo assets.<br/>Toggle BGM at the top right.',
      ja: 'PC：矢印キーで移動、Zでジャンプ、Xでアクション。<br/>スマホ／タブレット：画面上のボタンをタップ。<br/>このオープンソースのデモは任天堂素材を使用していません。<br/>右上でBGMを切り替えられます。',
      'zh-Hant': '電腦：方向鍵左右移動，Z 跳躍，X 動作。<br/>手機 / 平板：直接點選畫面上的虛擬按鈕。<br/>此為教學用開源範例，無使用任何任天堂素材。<br/>右上角可開關背景音樂。',
      'zh-Hans': '电脑：方向键左右移动，Z 跳跃，X 动作。<br/>手机 / 平板：直接点击画面上的虚拟按钮。<br/>此为教学用开源范例，无使用任何任天堂素材。<br/>右上角可开关背景音乐。',
    },
  };

  function applyLanguage() {
    if (scoreLabel) scoreLabel.textContent = uiText.score[currentLang];
    if (stagePill) stagePill.textContent = uiText.stage[currentLang];
    if (timeLabel) timeLabel.textContent = uiText.time[currentLang];
    settingsToggle?.setAttribute('aria-label', uiText.settings[currentLang]);
    if (langLabelEl) langLabelEl.textContent = uiText.lang[currentLang];
    if (devLabelEl) devLabelEl.textContent = uiText.dev[currentLang];
    if (logLabelEl) logLabelEl.textContent = uiText.log[currentLang];
    if (logCopy) logCopy.textContent = uiText.copy[currentLang];
    if (logClear) logClear.textContent = uiText.clear[currentLang];
    if (audioLabelEl) audioLabelEl.textContent = uiText.bgm[currentLang];
    if (bgmToggle) bgmToggle.textContent = uiText[bgmOn ? 'mute' : 'unmute'][currentLang];
    if (devToggle) devToggle.textContent = uiText[devOn ? 'devOff' : 'devOn'][currentLang];
    if (levelLabelEl) levelLabelEl.textContent = uiText.level[currentLang];
    if (enableBtn) enableBtn.textContent = uiText[designOn ? 'disable' : 'enable'][currentLang];
    if (transBtn) transBtn.textContent = uiText.transparent[currentLang];
    if (destroyBtn) destroyBtn.textContent = uiText.destroy[currentLang];
    if (saveBtn) saveBtn.textContent = uiText.save[currentLang];
    if (addBtn) addBtn.textContent = uiText.add[currentLang];
    if (docTitle) docTitle.textContent = uiText.infoTitle[currentLang];
    if (docText) docText.innerHTML = uiText.infoText[currentLang];
    if (btnRestart) btnRestart.textContent = uiText.restart[currentLang];
    if (btnRestartFail) btnRestartFail.textContent = uiText.restart[currentLang];
  }

  langSelect?.addEventListener('change', () => {
    currentLang = langSelect.value;
    document.documentElement.lang = currentLang;
    if (currentDialogKey && pedDialogText) {
      pedDialogText.textContent = pedDialogMap[currentDialogKey]?.[currentLang] || currentDialogKey;
    }
    applyLanguage();
  });
  document.documentElement.lang = currentLang;
  applyLanguage();
  let lastPlayer = null;
  let lastCamera = null;

  function showPedDialog(key) {
    if (!pedDialogEl) return;
    const text = pedDialogMap[key]?.[currentLang] || key;
    if (pedDialogText) pedDialogText.textContent = text;
    currentDialogKey = key;
    pedDialogEl.classList.remove('hidden');
  }

  function hidePedDialog() {
    pedDialogEl?.classList.add('hidden');
  }

  function worldToScreen(x, y, camera) {
    const scaleX = window.__cssScaleX || 1;
    const scaleY = window.__cssScaleY || 1;
    return {
      x: (x - camera.x) * scaleX,
      y: (y - camera.y - CAMERA_OFFSET_Y) * scaleY,
      scaleX,
      scaleY,
    };
  }

  function syncDialogToPlayer(player, camera) {
    if (!pedDialogEl || pedDialogEl.classList.contains('hidden')) return;
    if (!player || !camera) return;
    lastPlayer = player;
    lastCamera = camera;
    const { x, y, scaleY } = worldToScreen(player.x, player.y - player.h / 2, camera);
    pedDialogEl.style.left = `${x}px`;
    pedDialogEl.style.top = `${y - 28 * scaleY}px`;
  }

  window.addEventListener('resize', () => syncDialogToPlayer(lastPlayer, lastCamera));
  window.addEventListener('orientationchange', () => syncDialogToPlayer(lastPlayer, lastCamera));

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
  logCopy?.addEventListener('click', () => Logger.copy());
  logClear?.addEventListener('click', () => Logger.clear());

  const infoToggle = document.getElementById('info-toggle');
  const debugPanel = document.getElementById('debug-panel');
  if (infoToggle && infoPanel) {
    function closeInfo() {
      infoPanel.hidden = true;
      if (debugPanel) debugPanel.hidden = true;
    }
    infoToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const hidden = infoPanel.hidden;
      infoPanel.hidden = !hidden;
      if (debugPanel) debugPanel.hidden = infoPanel.hidden || !devOn;
    });
    document.addEventListener('click', (e) => {
      if (infoPanel.hidden) return;
      if (
        e.target instanceof Node &&
        !infoPanel.contains(e.target) &&
        e.target !== infoToggle &&
        (!debugPanel || !debugPanel.contains(e.target))
      ) {
        closeInfo();
      }
    });
  }

  const settingsMenu = document.getElementById('settings-menu');
  if (settingsToggle && settingsMenu) {
    function closeMenu() { settingsMenu.hidden = true; }
    settingsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenu.hidden = !settingsMenu.hidden;
    });
    document.addEventListener('click', (e) => {
      if (settingsMenu.hidden) return;
      if (e.target instanceof Node && !settingsMenu.contains(e.target) && e.target !== settingsToggle) {
        closeMenu();
      }
    });
  }
  if (bgmToggle) {
    bgmToggle.addEventListener('click', () => {
      const on = toggleMusic();
      bgmOn = on;
      if (window.__BGM__) {
        window.__BGM__.muted = !on;
        window.__BGM__.mutedByGuard = false;
      }
      bgmToggle.textContent = uiText[on ? 'mute' : 'unmute'][currentLang];
    });
  }

  const fullscreenToggle = document.getElementById('fullscreen-toggle');
  if (fullscreenToggle) {
    fullscreenToggle.addEventListener('click', () => {
      const target = stage?.parentElement || stage || canvas;
      if (!document.fullscreenElement) {
        target
          ?.requestFullscreen?.()
          .catch(() => {})
          .finally(() => {
            window.__resizeGameCanvas?.();
          });
        fullscreenToggle.textContent = '🞬';
      } else {
        document
          .exitFullscreen?.()
          .catch(() => {})
          .finally(() => {
            window.__resizeGameCanvas?.();
          });
        fullscreenToggle.textContent = '⛶';
      }
    });
  }

  document.addEventListener('fullscreenchange', () => {
    window.__resizeGameCanvas?.();
  });

  if (design) {
    enableBtn?.addEventListener('click', () => {
      const on = design.enable();
      designOn = on;
      enableBtn.classList.toggle('active', on);
      enableBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      enableBtn.textContent = uiText[on ? 'disable' : 'enable'][currentLang];
      if (addBtn) addBtn.hidden = !on;
    });
    transBtn?.addEventListener('click', () => design.toggleTransparent());
    destroyBtn?.addEventListener('click', () => design.toggleDestroyable());
    saveBtn?.addEventListener('click', () => design.save());
    addBtn?.addEventListener('click', () => design.addBlock());
  }

  devToggle?.addEventListener('click', () => {
    devOn = !devOn;
    devToggle.classList.toggle('active', devOn);
    devToggle.setAttribute('aria-pressed', devOn ? 'true' : 'false');
    devToggle.textContent = uiText[devOn ? 'devOff' : 'devOn'][currentLang];
    if (debugPanel) debugPanel.hidden = !devOn;
    if (logControls) logControls.hidden = !devOn;
    if (designControls) designControls.hidden = !devOn;
    if (!devOn && designOn && design?.enable) {
      design.enable();
      designOn = false;
      if (enableBtn) {
        enableBtn.classList.remove('active');
        enableBtn.setAttribute('aria-pressed', 'false');
        enableBtn.textContent = uiText.enable[currentLang];
      }
      if (addBtn) addBtn.hidden = true;
    }
  });

  canvas.setAttribute('tabindex', '0');
  function refocus(e) { try { if (e) e.preventDefault(); canvas.focus(); } catch (_) {} }
  function setVersionBadge() {
    const pill = document.getElementById('version-pill');
    if (pill) pill.textContent = `v${version}`;
    if (startVersion) startVersion.textContent = `v${version}`;
  }
  window.addEventListener('load', () => { refocus(); setVersionBadge(); });
  window.addEventListener('pointerdown', (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.matches('button, a, input, textarea, select, label')) return;
    refocus(e);
  }, { passive: false });
  window.addEventListener('keydown', () => resumeAudio(), { once: true });
  window.addEventListener('pointerdown', () => resumeAudio(), { once: true });

  function setStatus(msg) { if (startStatus) startStatus.textContent = msg; }
  function setProgress(val) { if (loadingProgress) loadingProgress.value = val; }
  function showLoading() {
    setStatus('Loading...');
    setProgress(0);
    if (loadingProgress) loadingProgress.hidden = false;
    if (btnStart) btnStart.hidden = true;
    if (btnRetry) btnRetry.hidden = true;
    if (startPage) startPage.hidden = false;
  }
  function showStart(onStart) {
    setStatus('');
    if (loadingProgress) loadingProgress.hidden = true;
    if (btnRetry) btnRetry.hidden = true;
    if (btnStart) {
      btnStart.hidden = false;
      btnStart.onclick = () => { if (startPage) startPage.hidden = true; onStart(); };
    }
  }
  function showError(onRetry) {
    setStatus('Failed to load resources');
    if (loadingProgress) loadingProgress.hidden = true;
    if (btnStart) btnStart.hidden = true;
    if (btnRetry) {
      btnRetry.hidden = false;
      btnRetry.onclick = () => { showLoading(); onRetry(); };
    }
    if (startPage) startPage.hidden = false;
  }
  const startScreen = { showLoading, showStart, showError, setStatus, setProgress };
  showLoading();

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
    if (!stage) return;
    const fx = document.createElement('img');
    fx.src = 'assets/slide-dust.svg';
    fx.alt = '';
    fx.className = 'slide-effect';
    const H_OFF = 12;
    const V_OFF = 12;
    const scaleX = window.__cssScaleX || 1;
    const scaleY = window.__cssScaleY || 1;
    fx.style.left = `${(x - facing * H_OFF) * scaleX}px`;
    fx.style.top = `${(y - V_OFF) * scaleY}px`;
    fx.style.width = `${48 * scaleX}px`;
    fx.style.height = `${24 * scaleY}px`;
    fx.style.setProperty('--sx', facing);
    stage.appendChild(fx);
    setTimeout(() => fx.remove(), 500);
  }
  function triggerFailEffect() {
    if (!stage) return;
    const fx = document.createElement('div');
    fx.className = 'fail-effect';
    stage.appendChild(fx);
    setTimeout(() => fx.remove(), 1000);
  }
  function triggerStartEffect() {
    if (!stage) return;
    const fx = document.createElement('div');
    fx.className = 'start-effect';
    fx.textContent = "Let's Go!";
    stage.appendChild(fx);
    setTimeout(() => fx.remove(), 1000);
  }
  function showStageClear() { if (stageClearEl) stageClearEl.hidden = false; }
  function showStageFail() { if (stageFailEl) stageFailEl.hidden = false; }
  function hideStageOverlays() { if (stageClearEl) stageClearEl.hidden = true; if (stageFailEl) stageFailEl.hidden = true; }

  return { Logger, dbg, scoreEl, timerEl, triggerClearEffect, triggerSlideEffect, triggerFailEffect, triggerStartEffect, showStageClear, showStageFail, hideStageOverlays, startScreen, showPedDialog, hidePedDialog, syncDialogToPlayer };
}
