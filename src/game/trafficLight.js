export const GREEN_MS = 3000;
export const BLINK_MS = 2000;
export const BLINK_INTERVAL = 250;
export const RED_MS = 4000;

export function advanceLight(light, dtMs) {
  light.timer += dtMs;
  if (light.phase === 'green') {
    light.state = 'green';
    if (light.timer >= GREEN_MS) {
      light.phase = 'blink';
      light.timer = 0;
      light.blinkElapsed = 0;
      light.state = 'green';
    }
  } else if (light.phase === 'blink') {
    light.blinkElapsed += dtMs;
    if (light.blinkElapsed >= BLINK_INTERVAL) {
      light.blinkElapsed %= BLINK_INTERVAL;
      light.state = light.state === 'green' ? 'dark' : 'green';
    }
    if (light.timer >= BLINK_MS) {
      light.phase = 'red';
      light.timer = 0;
      light.state = 'red';
    }
  } else if (light.phase === 'red') {
    light.state = 'red';
    if (light.timer >= RED_MS) {
      light.phase = 'green';
      light.timer = 0;
      light.state = 'green';
    }
  }
}
