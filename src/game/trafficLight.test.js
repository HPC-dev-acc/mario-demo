import { advanceLight, GREEN_MS, BLINK_MS, BLINK_INTERVAL, RED_MS } from './trafficLight.js';

test('traffic light cycles green -> blink -> red -> green with blinking', () => {
  const light = { phase: 'green', state: 'green', timer: 0, blinkElapsed: 0 };
  advanceLight(light, GREEN_MS);
  expect(light.phase).toBe('blink');
  expect(light.state).toBe('green');

  let elapsed = 0;
  let prev = light.state;
  while (elapsed < BLINK_MS) {
    advanceLight(light, BLINK_INTERVAL);
    elapsed += BLINK_INTERVAL;
    if (elapsed < BLINK_MS) expect(light.state).not.toBe(prev);
    prev = light.state;
  }

  expect(light.phase).toBe('red');
  expect(light.state).toBe('red');

  advanceLight(light, RED_MS);
  expect(light.phase).toBe('green');
  expect(light.state).toBe('green');
});

