import { jest } from '@jest/globals';

class MockAudioContext {
  constructor() {
    this.destination = {};
    this.currentTime = 0;
    this.sampleRate = 44100;
  }
  createGain() {
    return {
      gain: {
        value: 0,
        setValueAtTime() {},
        linearRampToValueAtTime() {},
      },
      connect() {},
    };
  }
  createDynamicsCompressor() {
    return { connect() {} };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: () => ({ connect() {} }),
      start() {},
    };
  }
  decodeAudioData() {
    return Promise.resolve({ duration: 1 });
  }
  createBuffer() {
    return { duration: 0 };
  }
  resume() {
    return Promise.resolve();
  }
}

global.fetch = jest.fn((url) => {
  if (url.includes('fail.wav')) {
    return Promise.reject(new Error('network'));
  }
  return Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  });
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// dynamic import after setting up globals

test('loadSounds logs and continues when a sound fails to load', async () => {
  window.AudioContext = MockAudioContext;
  window.webkitAudioContext = MockAudioContext;
  jest.resetModules();
  const { loadSounds, play } = await import('./audio.js');
  await expect(loadSounds()).resolves.toBeUndefined();
  expect(console.error).toHaveBeenCalled();
  expect(() => play('fail')).not.toThrow();
});

test('initAudioContext no-ops when Web Audio API is missing', async () => {
  delete window.AudioContext;
  delete window.webkitAudioContext;
  jest.resetModules();
  const { initAudioContext, loadSounds, play, playMusic, toggleMusic } = await import('./audio.js');
  expect(() => initAudioContext()).not.toThrow();
  await expect(loadSounds()).resolves.toBeUndefined();
  expect(() => play('jump')).not.toThrow();
  expect(() => playMusic()).not.toThrow();
  expect(toggleMusic()).toBe(false);
});
