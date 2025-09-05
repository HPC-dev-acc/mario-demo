import { initUI } from './index.js';

  function setupDOM() {
    document.body.innerHTML = `
      <div id="game-root">
      <div id="stage">
        <canvas id="game"></canvas>
        <div id="hud">
          <div id="start-page">
            <div id="start-status"></div>
            <div id="start-version"></div>
            <progress id="loading-progress" value="0" max="100"></progress>
            <button id="btn-start">START</button>
            <button id="btn-retry" hidden>Retry</button>
          </div>
      <div id="debug-panel" hidden></div>
      <div id="top-right" hidden>
        <button id="info-toggle" class="pill">ℹ</button>
        <div id="version-pill"></div>
        <button id="settings-toggle" class="pill">⚙</button>
        <div id="settings-menu" hidden>
          <div id="lang-controls" class="pill">
            <strong>LANG</strong>
            <select id="lang-select">
              <option value="en" selected>English</option>
              <option value="ja">日本語</option>
              <option value="zh-Hant">繁體中文</option>
              <option value="zh-Hans">简体中文</option>
            </select>
          </div>
          <div id="dev-controls" class="pill">
            <strong>DEV</strong>
            <button id="dev-toggle" class="mini" aria-pressed="false">On</button>
          </div>
          <div id="log-controls" class="pill" hidden>
            <strong>LOG</strong>
            <button id="log-copy" class="mini">Copy</button>
            <button id="log-clear" class="mini">Clear</button>
          </div>
          <div id="audio-controls" class="pill">
            <strong>BGM</strong>
            <button id="bgm-toggle" class="mini">Mute</button>
          </div>
          <div id="design-controls" class="pill" hidden>
            <strong>LEVEL</strong>
            <button id="design-enable" class="mini" aria-pressed="false">Enable</button>
            <button id="design-transparent" class="mini">Transparent</button>
            <button id="design-destroyable" class="mini">Break</button>
            <button id="design-save" class="mini">Save</button>
            <button id="design-add" class="mini" hidden>Add</button>
          </div>
          <div id="npc-controls" class="pill" hidden>
            <strong>NPC</strong>
            <button id="npc1" class="mini">NPC1</button>
            <button id="npc2" class="mini">NPC2</button>
          </div>
        </div>
        <div id="info-panel" hidden>
          <h1 id="doc-title"></h1>
          <p class="doc"></p>
        </div>
      </div>
      <div id="hud-top-center" hidden>
        <button id="fullscreen-toggle" class="pill">⛶</button>
        <div id="score-pill" class="pill"><span id="score-label"></span> <span id="score">0</span></div>
        <div id="stage-pill" class="pill"></div>
        <div id="time-pill" class="pill"><span id="time-label"></span> <span id="timer">60</span></div>
      </div>
      <div id="ped-dialog" class="ped-dialog hidden"><div class="ped-dialog__content"><img src="assets/red-person.svg" class="ped-dialog__icon" alt=""><span class="ped-dialog__text"></span></div></div>
      <div id="stage-clear" hidden><div class="title"></div><button id="btn-restart">Restart</button></div>
      <div id="stage-fail" hidden><div class="title"></div><button id="btn-restart-fail">Restart</button></div>
        </div>
      </div>
      </div>`;
    return document.getElementById('game');
  }

test('initUI exposes Logger', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  expect(typeof ui.Logger.info).toBe('function');
});

test('start button hidden before preload complete', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  expect(document.getElementById('btn-start').hidden).toBe(true);
});

test('progress bar updates during loading', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.startScreen.setProgress(30);
  const bar = document.getElementById('loading-progress');
  expect(bar.hidden).toBe(false);
  expect(bar.value).toBe(30);
  ui.startScreen.showStart(() => {});
  expect(bar.hidden).toBe(true);
});

test('shows version on start page', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  window.dispatchEvent(new Event('load'));
  expect(document.getElementById('start-version').textContent).toBe('v0');
});

test('start button click hides start page', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  let started = false;
  ui.startScreen.showStart(() => { started = true; });
  const btn = document.getElementById('btn-start');
  expect(btn.hidden).toBe(false);
  btn.click();
  expect(started).toBe(true);
  expect(document.getElementById('start-page').hidden).toBe(true);
  expect(getComputedStyle(document.getElementById('start-page')).display).toBe('none');
});

test('preload error shows retry and allows retry', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  let retried = false;
  ui.startScreen.showError(() => { retried = true; });
  const retry = document.getElementById('btn-retry');
  expect(retry.hidden).toBe(false);
  expect(document.getElementById('start-status').textContent).toMatch(/Failed/);
  retry.click();
  expect(retried).toBe(true);
  expect(document.getElementById('start-status').textContent).toBe('Loading...');
});

test('does not refocus when clicking interactive elements', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const spy = jest.spyOn(canvas, 'focus');
  const btn = document.getElementById('btn-start');
  btn.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
  expect(spy).not.toHaveBeenCalled();
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
  expect(spy).toHaveBeenCalled();
});

test('start button pointerdown not canceled and click hides start page', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  let started = false;
  ui.startScreen.showStart(() => { started = true; });
  const btn = document.getElementById('btn-start');
  const dispatched = btn.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
  expect(dispatched).toBe(true);
  btn.click();
  expect(started).toBe(true);
  expect(document.getElementById('start-page').hidden).toBe(true);
});

test('triggerStartEffect inserts and removes element', () => {
  jest.useFakeTimers();
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.triggerStartEffect();
  const el = document.querySelector('.start-effect');
  expect(el).not.toBeNull();
  expect(el.textContent).toBe("Let's Go!");
  jest.advanceTimersByTime(1000);
  expect(document.querySelector('.start-effect')).toBeNull();
  jest.useRealTimers();
});

test('triggerSlideEffect positions dust at player feet and removes it', () => {
  jest.useFakeTimers();
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.triggerSlideEffect(100, 200, 1);
  const fx = document.querySelector('.slide-effect');
  expect(fx).not.toBeNull();
  expect(fx.style.left).toBe('88px');
  expect(fx.style.top).toBe('188px');
  jest.advanceTimersByTime(500);
  expect(document.querySelector('.slide-effect')).toBeNull();
  jest.useRealTimers();
});

test('triggerSlideEffect scales position and size with cssScaleX/Y', () => {
  jest.useFakeTimers();
  window.__cssScaleX = 2;
  window.__cssScaleY = 3;
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.triggerSlideEffect(100, 200, -1);
  const fx = document.querySelector('.slide-effect');
  expect(fx).not.toBeNull();
  expect(fx.style.left).toBe('224px');
  expect(fx.style.top).toBe('564px');
  expect(fx.style.width).toBe('96px');
  expect(fx.style.height).toBe('72px');
  jest.advanceTimersByTime(500);
  expect(document.querySelector('.slide-effect')).toBeNull();
  delete window.__cssScaleX;
  delete window.__cssScaleY;
  jest.useRealTimers();
});

test('triggerStompEffect centers star and removes it', () => {
  jest.useFakeTimers();
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.triggerStompEffect(100, 200);
  const fx = document.querySelector('.stomp-effect');
  expect(fx).not.toBeNull();
  expect(fx.style.left).toBe('88px');
  expect(fx.style.top).toBe('188px');
  jest.advanceTimersByTime(300);
  expect(document.querySelector('.stomp-effect')).toBeNull();
  jest.useRealTimers();
});

test('triggerStompEffect scales with cssScaleX/Y', () => {
  jest.useFakeTimers();
  window.__cssScaleX = 2;
  window.__cssScaleY = 3;
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.triggerStompEffect(100, 200);
  const fx = document.querySelector('.stomp-effect');
  expect(fx).not.toBeNull();
  expect(fx.style.left).toBe('176px');
  expect(fx.style.top).toBe('564px');
  expect(fx.style.width).toBe('48px');
  expect(fx.style.height).toBe('72px');
  jest.advanceTimersByTime(300);
  expect(document.querySelector('.stomp-effect')).toBeNull();
  delete window.__cssScaleX;
  delete window.__cssScaleY;
  jest.useRealTimers();
});

test('info toggle shows and hides info panel', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const panel = document.getElementById('info-panel');
  const toggle = document.getElementById('info-toggle');
  expect(panel.hidden).toBe(true);
  toggle.click();
  expect(panel.hidden).toBe(false);
  toggle.click();
  expect(panel.hidden).toBe(true);
});

test('debug panel toggles with info button only when dev mode is on', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const debug = document.getElementById('debug-panel');
  const infoBtn = document.getElementById('info-toggle');
  const versionPill = document.getElementById('version-pill');
  const devToggle = document.getElementById('dev-toggle');
  expect(debug.hidden).toBe(true);
  infoBtn.click();
  expect(debug.hidden).toBe(true);
  devToggle.click();
  infoBtn.click();
  expect(debug.hidden).toBe(false);
  versionPill.click();
  expect(debug.hidden).toBe(true);
});

test('developer toggle shows debug, log, design, and npc controls', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const devToggle = document.getElementById('dev-toggle');
  const debug = document.getElementById('debug-panel');
  const logControls = document.getElementById('log-controls');
  const designControls = document.getElementById('design-controls');
  const npcControls = document.getElementById('npc-controls');
  expect(debug.hidden).toBe(true);
  expect(logControls.hidden).toBe(true);
  expect(designControls.hidden).toBe(true);
  expect(npcControls.hidden).toBe(true);
  devToggle.click();
  expect(debug.hidden).toBe(false);
  expect(logControls.hidden).toBe(false);
  expect(designControls.hidden).toBe(false);
  expect(npcControls.hidden).toBe(false);
  devToggle.click();
  expect(debug.hidden).toBe(true);
  expect(logControls.hidden).toBe(true);
  expect(designControls.hidden).toBe(true);
  expect(npcControls.hidden).toBe(true);
});

test('npc buttons trigger spawnNpc', () => {
  const canvas = setupDOM();
  const calls = [];
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0', spawnNpc: t => calls.push(t) });
  document.getElementById('dev-toggle').click();
  document.getElementById('npc1').click();
  document.getElementById('npc2').click();
  expect(calls).toEqual(['ol', 'trunk']);
});

test('settings menu toggles and closes on outside click', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const toggle = document.getElementById('settings-toggle');
  const menu = document.getElementById('settings-menu');
  expect(menu.hidden).toBe(true);
  toggle.click();
  expect(menu.hidden).toBe(false);
  toggle.click();
  expect(menu.hidden).toBe(true);
  toggle.click();
  document.body.click();
  expect(menu.hidden).toBe(true);
});

test('info panel closes on outside click', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const panel = document.getElementById('info-panel');
  const toggle = document.getElementById('info-toggle');
  const versionPill = document.getElementById('version-pill');
  toggle.click();
  expect(panel.hidden).toBe(false);
  versionPill.click();
  expect(panel.hidden).toBe(true);
});

  test('fullscreen toggle requests and exits fullscreen', async () => {
    const canvas = setupDOM();
    const root = document.getElementById('game-root');
    root.requestFullscreen = jest.fn().mockResolvedValue();
    document.exitFullscreen = jest.fn().mockResolvedValue();
    initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
    const btn = document.getElementById('fullscreen-toggle');
    btn.click();
    await Promise.resolve();
    expect(root.requestFullscreen).toHaveBeenCalled();
    expect(btn.textContent).toBe('🞬');
    document.fullscreenElement = root;
    btn.click();
    await Promise.resolve();
    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(btn.textContent).toBe('⛶');
    document.fullscreenElement = null;
  });

  test('fullscreen toggle resizes canvas after request', async () => {
    const canvas = setupDOM();
    const root = document.getElementById('game-root');
    root.requestFullscreen = jest.fn().mockResolvedValue();
    window.__resizeGameCanvas = jest.fn();
    initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
    const btn = document.getElementById('fullscreen-toggle');
    btn.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(window.__resizeGameCanvas).toHaveBeenCalled();
    delete window.__resizeGameCanvas;
  });

  test('fullscreenchange triggers canvas resize', () => {
    const canvas = setupDOM();
    window.__resizeGameCanvas = jest.fn();
    initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(window.__resizeGameCanvas).toHaveBeenCalled();
    delete window.__resizeGameCanvas;
  });

test('showPedDialog toggles visibility and syncs to player', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  ui.showPedDialog('wait');
  const dialog = document.getElementById('ped-dialog');
  expect(dialog.classList.contains('hidden')).toBe(false);
  const icon = dialog.querySelector('.ped-dialog__icon');
  expect(icon).not.toBeNull();
  expect(icon.getAttribute('src')).toContain('red-person.svg');
  expect(dialog.querySelector('.ped-dialog__text').textContent).toBe('Want to dash through, but can’t…');
  const player = { x: 100, y: 200, h: 50 };
  const camera = { x: 0, y: 0 };
  ui.syncDialogToPlayer(player, camera);
  expect(dialog.style.left).toBe('100px');
  expect(dialog.style.top).toBe(`${200 - 25 - 28}px`);
  ui.hidePedDialog();
  expect(dialog.classList.contains('hidden')).toBe(true);
});

test('language selection changes ped dialog text', () => {
  const canvas = setupDOM();
  const ui = initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const select = document.getElementById('lang-select');
  const expected = {
    en: 'Want to dash through, but can’t…',
    ja: '走り抜けたいけど、できない…',
    'zh-Hant': '想要衝過去，卻不能……',
    'zh-Hans': '想要冲过去，却不能……',
  };
  Object.entries(expected).forEach(([lang, text]) => {
    select.value = lang;
    select.dispatchEvent(new Event('change'));
    ui.showPedDialog('wait');
    expect(document.querySelector('.ped-dialog__text').textContent).toBe(text);
  });
});

test('language selection updates score and info text', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const select = document.getElementById('lang-select');
  select.value = 'ja';
  select.dispatchEvent(new Event('change'));
  expect(document.getElementById('score-label').textContent).toBe('スコア');
  expect(document.getElementById('doc-title').textContent).toBe('ピクセルランデモ（マリオ風）');
});

test('language selection updates restart buttons', () => {
  const canvas = setupDOM();
  initUI(canvas, { resumeAudio: () => {}, toggleMusic: () => true, version: '0' });
  const btn = document.getElementById('btn-restart');
  const btnFail = document.getElementById('btn-restart-fail');
  expect(btn.textContent).toBe('Restart');
  expect(btnFail.textContent).toBe('Restart');
  const select = document.getElementById('lang-select');
  select.value = 'ja';
  select.dispatchEvent(new Event('change'));
  expect(btn.textContent).toBe('再スタート');
  expect(btnFail.textContent).toBe('再スタート');
});
