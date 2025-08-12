const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  img.src = src;
});

export function loadPlayerSprites() {
  const frameCount = 10;
  const loadSeq = (name) => Promise.all(
    Array.from({ length: frameCount }, (_, i) => {
      const num = i.toString().padStart(3, '0');
      return loadImage(`assets/sprites/player/${name}__${num}.png`);
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
  const base = 'assets/sprites/Infra';
  const colors = ['red', 'yellow', 'green'];
  return Promise.all(
    colors.map((c) => loadImage(`${base}/${c}light.PNG`))
  ).then(([red, yellow, green]) => {
    const mk = (img) => ({ img, sx: 0, sy: 3, sw: 1024, sh: 1532 });
    return { red: mk(red), yellow: mk(yellow), green: mk(green) };
  });
}
