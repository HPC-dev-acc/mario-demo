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
  const gain = audioCtx.createGain();
  const volume = 0.8;
  const now = audioCtx.currentTime;
  const end = now + buffer.duration;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01); // 10 ms
  gain.gain.setValueAtTime(volume, end - 0.05); // 50 ms
  gain.gain.linearRampToValueAtTime(0, end);
  source.connect(gain).connect(audioCtx.destination);
  source.start(0);
}
