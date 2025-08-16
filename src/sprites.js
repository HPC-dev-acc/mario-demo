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
  const colors = ['red', 'yellow', 'green'];
  return Promise.all(
    colors.map((c) => loadImage(new URL(`../assets/sprites/Infra/${c}light.PNG`, baseURL).href))
  ).then(([red, yellow, green]) => {
    const mk = (img) => ({ img, sx: 0, sy: 3, sw: 1024, sh: 1532 });
    return { red: mk(red), yellow: mk(yellow), green: mk(green) };
  });
}

export function loadNpcSprite() {
  const FW = 48, FH = 44, COLS = 16;
  const animations = {
    idle: { frames: [304,305,307,308,309,311], fps: 7, offsetY: 0 },
    walk: { frames: [240,241,243,244,245,247,248,249], fps: 10, offsetY: 16 },
    run:  { frames: [256,257,259,260,261,263], fps: 14, offsetY: 0 },
  };
  return loadImage(new URL('../assets/sprites/Character1.png', baseURL).href)
    .then((img) => ({ img, frameWidth: FW, frameHeight: FH, columns: COLS, animations }));
}
