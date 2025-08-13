export function advanceLight(light, dtMs) {
  const durations = { green: 2000, yellow: 1000, red: 3000 };
  const next = { green: 'yellow', yellow: 'red', red: 'green' };
  light.timer += dtMs;
  if (light.timer >= durations[light.state]) {
    light.timer = 0;
    light.state = next[light.state];
  }
}
