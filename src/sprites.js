export function loadPlayerSprites() {
  const frameCount = 10;
  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
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
