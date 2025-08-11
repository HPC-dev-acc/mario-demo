import { loadPlayerSprites } from './sprites.js';

describe('loadPlayerSprites', () => {
  const OriginalImage = global.Image;
  afterEach(() => {
    global.Image = OriginalImage;
  });

  test('loads all frames', async () => {
    const loaded = [];
    global.Image = class {
      set src(v) { loaded.push(v); if (this.onload) setTimeout(() => this.onload()); }
    };
    const sprites = await loadPlayerSprites();
    expect(Object.keys(sprites)).toEqual(['idle', 'run', 'jump', 'slide']);
    expect(loaded).toHaveLength(40);
  });

  test('rejects on load error', async () => {
    global.Image = class {
      set src(v) { if (this.onerror) setTimeout(() => this.onerror(new Error('fail'))); }
    };
    await expect(loadPlayerSprites()).rejects.toThrow('Failed to load image');
  });
});
