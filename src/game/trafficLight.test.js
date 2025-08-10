import { advanceLight } from './trafficLight.js';

test('traffic light cycles red -> yellow -> green -> red', () => {
  const light = { state: 'red', timer: 0 };
  advanceLight(light, 2000); // red -> yellow
  expect(light.state).toBe('yellow');
  advanceLight(light, 1000); // yellow -> green
  expect(light.state).toBe('green');
  advanceLight(light, 2000); // green -> red
  expect(light.state).toBe('red');
});
