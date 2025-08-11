const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.5;
const masterCompressor = audioCtx.createDynamicsCompressor();
masterCompressor.connect(masterGain);
masterGain.connect(audioCtx.destination);

const musicGain = audioCtx.createGain();
musicGain.gain.value = 0.5;
musicGain.connect(masterCompressor);

let musicSource = null;

const buffers = {};

const files = {
  jump: 'assets/sounds/jump.wav',
  impact: 'assets/sounds/impact.wav',
  slide: 'assets/sounds/slide.wav',
  clear: 'assets/sounds/clear.wav',
  coin: 'assets/sounds/coin.wav',
  fail: 'assets/sounds/fail.wav',
  background: 'assets/music/background.wav',
};

export async function loadSounds() {
  const entries = Object.entries(files);
  await Promise.all(entries.map(async ([name, url]) => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    buffers[name] = await audioCtx.decodeAudioData(arrayBuffer);
  }));
}

export function resumeAudio() {
  return audioCtx.resume();
}

export function play(name) {
  const buffer = buffers[name];
  if (!buffer) return;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  const volume = 0.8;
  const start = audioCtx.currentTime + 0.005;
  gain.gain.value = 0;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01); // 10 ms
  const end = start + buffer.duration;
  gain.gain.setValueAtTime(volume, end - 0.05); // 50 ms
  gain.gain.linearRampToValueAtTime(0, end);
  source.connect(gain).connect(masterCompressor);
  source.start(start);
}

export function playMusic() {
  const buffer = buffers.background;
  if (!buffer || musicSource) return;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(musicGain);
  source.start(0);
  musicSource = source;
}

export function toggleMusic() {
  const enabled = musicGain.gain.value > 0;
  musicGain.gain.value = enabled ? 0 : 0.5;
  return !enabled;
}
