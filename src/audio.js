const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const buffers = {};

const files = {
  jump: 'assets/sounds/jump.wav',
  impact: 'assets/sounds/impact.wav',
  slide: 'assets/sounds/slide.wav',
  clear: 'assets/sounds/clear.wav',
  coin: 'assets/sounds/coin.wav',
  fail: 'assets/sounds/fail.wav',
};

export async function loadSounds() {
  const entries = Object.entries(files);
  await Promise.all(entries.map(async ([name, url]) => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    buffers[name] = await audioCtx.decodeAudioData(arrayBuffer);
  }));
}

export function play(name) {
  const buffer = buffers[name];
  if (!buffer) return;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

