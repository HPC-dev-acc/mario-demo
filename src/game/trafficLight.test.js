import { advanceLight } from './trafficLight.js';

test('traffic light cycles green -> yellow -> red -> green', () => {
  const light = { state: 'green', timer: 0 };
  advanceLight(light, 2000); // green -> yellow
  expect(light.state).toBe('yellow');
  advanceLight(light, 1000); // yellow -> red
  expect(light.state).toBe('red');
  advanceLight(light, 3000); // red -> green
  expect(light.state).toBe('green');
});
