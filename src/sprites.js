const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  img.src = src;
});

const baseURL = new URL('.', import.meta.url);

export function loadPlayerSprites() {
  const frameCount = 10;
  const loadSeq = (name) => Promise.all(
    Array.from({ length: frameCount }, (_, i) => {
      const num = i.toString().padStart(3, '0');
      return loadImage(new URL(`../assets/sprites/player/${name}__${num}.png`, baseURL).href);
    })
  );
  return Promise.all([
    loadSeq('Idle'),
    loadSeq('Run'),
    loadSeq('Jump'),
    loadSeq('Slide'),
  ]).then(([idle, run, jump, slide]) => ({ idle, run, jump, slide }));
}

export function loadTrafficLightSprites() {
  const files = {
    dark:  'darksign.png',
    green: 'greensign.png',
    red:   'redsign.png',
  };
  return Promise.all(
    Object.entries(files).map(([k, name]) =>
      loadImage(new URL(`../assets/sprites/Infra/${name}`, baseURL).href)
        .then(img => [k, { img, sx: 0, sy: 0, sw: 1024, sh: 1536 }])
    )
  ).then(entries => Object.fromEntries(entries));
}

export function loadNpcSprite() {
  const FW = 64, FH = 64, COLS = 12;
  const row = 0;
  const walkCols = [0,1,2,3,4,5];
  const idx = (r, c) => r * COLS + c;
  const framesWalk = walkCols.map(c => idx(row, c));
  const animations = {
    walk: { frames: framesWalk, fps: 8, offsetY: 0 },
    run:  { frames: framesWalk, fps: 8, offsetY: 0 },
    idle: { frames: [idx(0,0)], fps: 1, offsetY: 0 },
  };
  return loadImage(new URL('../assets/sprites/Character1.png', baseURL).href)
    .then((img) => ({ img, frameWidth: FW, frameHeight: FH, columns: COLS, animations }));
}

export function loadOlNpcSprite() {
  const loadSeq = (prefix, count) => Promise.all(
    Array.from({ length: count }, (_, i) => {
      const num = i.toString().padStart(3, '0');
      return loadImage(new URL(`../assets/sprites/OL/${prefix}_${num}.png`, baseURL).href);
    })
  );
  return Promise.all([
    loadSeq('walk', 12),
    loadSeq('bump', 9),
    loadSeq('idle', 13),
  ]).then(([walk, bump, idle]) => ({ walk, bump, idle: { frames: idle, fps: 6 } }));
}

export function loadStudentNpcSprite() {
  const loadSeq = (prefix, count) => Promise.all(
    Array.from({ length: count }, (_, i) => {
      const num = i.toString().padStart(3, '0');
      return loadImage(new URL(`../assets/sprites/Student/${prefix}_${num}.png`, baseURL).href);
    })
  );
  return Promise.all([
    loadSeq('walk', 11),
    loadSeq('bump', 8),
    loadSeq('idle', 13),
  ]).then(([walk, bump, idle]) => ({ walk, bump, idle: { frames: idle, fps: 6 } }));
}

export function loadOfficemanNpcSprite() {
  const loadSeq = (prefix, count) => Promise.all(
    Array.from({ length: count }, (_, i) => {
      const num = i.toString().padStart(3, '0');
      return loadImage(new URL(`../assets/sprites/officeman/${prefix}_${num}.png`, baseURL).href);
    })
  );
  return Promise.all([
    loadSeq('walk', 11),
    loadSeq('bump', 11),
    loadSeq('idle', 19),
  ]).then(([walk, bump, idle]) => ({ walk, bump, idle: { frames: idle, fps: 6 } }));
}

export function loadTrunkNpcSprite() {
  const loadSeq = (prefix, count) => Promise.all(
    Array.from({ length: count }, (_, i) => {
      const num = i.toString().padStart(3, '0');
      return loadImage(new URL(`../assets/sprites/Trunk/${prefix}_${num}.png`, baseURL).href);
    })
  );
  return loadSeq('Move', 13).then(move => ({ move: { frames: move, fps: 8 } }));
}
