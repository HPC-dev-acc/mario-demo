export function advanceLight(light, dtMs) {
  const durations = { red: 2000, yellow: 1000, green: 2000 };
  const next = { red: 'yellow', yellow: 'green', green: 'red' };
  light.timer += dtMs;
  if (light.timer >= durations[light.state]) {
    light.timer = 0;
    light.state = next[light.state];
  }
}
