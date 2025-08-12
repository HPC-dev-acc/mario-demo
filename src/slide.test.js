import { enterSlide, exitSlide } from './game/slide.js';

test('enterSlide scales player height to 75% and keeps bottom fixed', () => {
  const player = { h: 120, baseH: 120, y: 100 };
  const bottom = player.y + player.h / 2;
  enterSlide(player);
  expect(player.h).toBe(90);
  expect(player.y + player.h / 2).toBe(bottom);
  exitSlide(player);
  expect(player.h).toBe(120);
  expect(player.y + player.h / 2).toBe(bottom);
});
