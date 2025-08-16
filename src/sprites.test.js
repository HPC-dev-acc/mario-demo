import { loadPlayerSprites, loadTrafficLightSprites, loadNpcSprite } from './sprites.js';

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
    expect(loaded[0]).toMatch(/\/assets\/sprites\/player\/Idle__000\.png$/);
  });

  test('rejects on load error', async () => {
    global.Image = class {
      set src(v) { if (this.onerror) setTimeout(() => this.onerror(new Error('fail'))); }
    };
    await expect(loadPlayerSprites()).rejects.toThrow('Failed to load image');
  });
});

test('loadTrafficLightSprites resolves with proper paths', async () => {
  const loaded = [];
  global.Image = class {
    set src(v) { loaded.push(v); if (this.onload) setTimeout(() => this.onload()); }
  };
  await expect(loadTrafficLightSprites()).resolves.toBeDefined();
  expect(loaded).toHaveLength(3);
  expect(loaded[0]).toMatch(/\/assets\/sprites\/Infra\/redlight\.PNG$/);
});

test('loadNpcSprite provides frame data', async () => {
  const loaded = [];
  global.Image = class { set src(v) { loaded.push(v); if (this.onload) setTimeout(() => this.onload()); } };
  const sprite = await loadNpcSprite();
  expect(loaded[0]).toMatch(/\/assets\/sprites\/Character1.png$/);
  expect(sprite).toMatchObject({ frameWidth: 48, frameHeight: 44 });
  expect(sprite.animations).toMatchObject({
    idle: { frames: [304,305,307,308,309,311] },
    walk: { frames: [240,241,243,244,245,247,248,249] },
    run:  { frames: [256,257,259,260,261,263] },
  });
});
