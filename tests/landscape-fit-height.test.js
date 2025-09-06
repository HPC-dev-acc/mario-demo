import { jest } from '@jest/globals';

describe('landscape-fit-height', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.resetModules();
  });

  test('fits canvas to viewport height in mobile landscape', async () => {
    document.body.innerHTML = '<canvas width="100" height="100"></canvas>';
    Object.defineProperty(navigator, 'userAgent', { value: 'Android', configurable: true });
    Object.assign(window, {
      innerWidth: 600,
      innerHeight: 300,
      visualViewport: { width: 600, height: 300, addEventListener: jest.fn(), removeEventListener: jest.fn() },
    });
    global.requestAnimationFrame = (cb) => { cb(); return 1; };
    global.cancelAnimationFrame = () => {};
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });

    await import('../src/ui/landscape-fit-height.js');

    const canvas = document.querySelector('canvas');
    expect(canvas.style.height).toBe('300px');
    expect(canvas.style.width).toBe('300px');
    expect(document.getElementById('canvas-stage')).not.toBeNull();
  });

  test('restores original styles on non-mobile or portrait', async () => {
    document.body.innerHTML = '<canvas style="width:200px;height:200px;"></canvas>';
    Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0', configurable: true });
    Object.assign(window, {
      innerWidth: 300,
      innerHeight: 600,
      visualViewport: { width: 300, height: 600, addEventListener: jest.fn(), removeEventListener: jest.fn() },
    });
    global.requestAnimationFrame = (cb) => { cb(); return 1; };
    global.cancelAnimationFrame = () => {};
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });

    await import('../src/ui/landscape-fit-height.js');

    const canvas = document.querySelector('canvas');
    expect(canvas.style.width).toBe('200px');
    expect(canvas.style.height).toBe('200px');
  });

  test('moves UI elements into layer for unified scaling', async () => {
    document.body.innerHTML = `
      <canvas width="100" height="100"></canvas>
      <div id="hud-top-center"></div>
    `;
    Object.defineProperty(navigator, 'userAgent', { value: 'Android', configurable: true });
    Object.assign(window, {
      innerWidth: 600,
      innerHeight: 300,
      visualViewport: { width: 600, height: 300, addEventListener: jest.fn(), removeEventListener: jest.fn() },
    });
    global.requestAnimationFrame = (cb) => { cb(); return 1; };
    global.cancelAnimationFrame = () => {};
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });

    await import('../src/ui/landscape-fit-height.js');

    const layer = document.getElementById('ui-layer');
    const hud = document.getElementById('hud-top-center');
    expect(layer).not.toBeNull();
    expect(hud.parentElement).toBe(layer);
  });
});
