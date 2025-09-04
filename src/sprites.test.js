import { loadPlayerSprites, loadTrafficLightSprites, loadNpcSprite, loadOlNpcSprite, loadStudentNpcSprite, loadOfficemanNpcSprite } from './sprites.js';

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
  expect(loaded[0]).toMatch(/\/assets\/sprites\/Infra\/darksign\.png$/);
});

test('loadNpcSprite provides frame data', async () => {
  const loaded = [];
  global.Image = class { set src(v) { loaded.push(v); if (this.onload) setTimeout(() => this.onload()); } };
  const sprite = await loadNpcSprite();
  expect(loaded[0]).toMatch(/\/assets\/sprites\/Character1.png$/);
  expect(sprite).toMatchObject({ frameWidth: 64, frameHeight: 64, columns: 12 });
  expect(sprite.animations).toMatchObject({
    idle: { frames: [0] },
    walk: { frames: [0,1,2,3,4,5] },
    run:  { frames: [0,1,2,3,4,5] },
  });
});

test('loadOlNpcSprite loads walk, bump, and idle frames', async () => {
  const OriginalImage = global.Image;
  const loaded = [];
  global.Image = class { set src(v) { loaded.push(v); if (this.onload) setTimeout(() => this.onload()); } };
  const sprite = await loadOlNpcSprite();
  expect(Object.keys(sprite)).toEqual(['walk','bump','idle']);
  expect(sprite.idle.frames).toHaveLength(13);
  expect(loaded[0]).toMatch(/\/assets\/sprites\/OL\/walk_000\.png$/);
  global.Image = OriginalImage;
});

test('loadStudentNpcSprite loads walk, bump, and idle frames', async () => {
  const OriginalImage = global.Image;
  const loaded = [];
  global.Image = class { set src(v) { loaded.push(v); if (this.onload) setTimeout(() => this.onload()); } };
  const sprite = await loadStudentNpcSprite();
  expect(Object.keys(sprite)).toEqual(['walk','bump','idle']);
  expect(sprite.idle.frames).toHaveLength(13);
  expect(loaded[0]).toMatch(/\/assets\/sprites\/Student\/walk_000\.png$/);
  global.Image = OriginalImage;
});

test('loadOfficemanNpcSprite loads walk, bump, and idle frames', async () => {
  const OriginalImage = global.Image;
  const loaded = [];
  global.Image = class { set src(v) { loaded.push(v); if (this.onload) setTimeout(() => this.onload()); } };
  const sprite = await loadOfficemanNpcSprite();
  expect(Object.keys(sprite)).toEqual(['walk','bump','idle']);
  expect(sprite.idle.frames).toHaveLength(19);
  expect(loaded[0]).toMatch(/\/assets\/sprites\/officeman\/walk_000\.png$/);
  global.Image = OriginalImage;
});
