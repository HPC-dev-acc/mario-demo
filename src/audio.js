let audioCtx;
let masterGain;
let masterCompressor;
let musicGain;
let musicSource = null;

const buffers = {};

const baseURL = new URL('.', import.meta.url);
const files = {
  jump: new URL('../assets/sounds/jump.wav', baseURL).href,
  impact: new URL('../assets/sounds/impact.wav', baseURL).href,
  slide: new URL('../assets/sounds/slide.wav', baseURL).href,
  clear: new URL('../assets/sounds/clear.wav', baseURL).href,
  coin: new URL('../assets/sounds/coin.wav', baseURL).href,
  fail: new URL('../assets/sounds/fail.wav', baseURL).href,
  background: new URL('../assets/music/background.wav', baseURL).href,
};

export function initAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) {
    audioCtx = null;
    return;
  }
  audioCtx = new Ctx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.5;
  masterCompressor = audioCtx.createDynamicsCompressor();
  masterCompressor.connect(masterGain);
  masterGain.connect(audioCtx.destination);
  musicGain = audioCtx.createGain();
  musicGain.gain.value = 0.5;
  musicGain.connect(masterCompressor);
}

initAudioContext();

export async function loadSounds() {
  if (!audioCtx) return;
  const entries = Object.entries(files);
  await Promise.all(entries.map(async ([name, url]) => {
    try {
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      buffers[name] = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.error(`Failed to load sound "${name}" from ${url}`, err);
      try {
        buffers[name] = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
      } catch (_) {
        // if buffer creation fails, leave sound undefined
      }
    }
  }));
}

export function resumeAudio() {
  return audioCtx?.resume?.();
}

export function play(name) {
  if (!audioCtx) return;
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
  if (!audioCtx) return;
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
  if (!audioCtx || !musicGain) return false;
  const enabled = musicGain.gain.value > 0;
  musicGain.gain.value = enabled ? 0 : 0.5;
  return !enabled;
}

