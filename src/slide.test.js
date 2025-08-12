import { enterSlide, exitSlide } from './game/slide.js';

test('enterSlide halves player height', () => {
  const player = { h: 80, baseH: 80, y: 100 };
  const bottom = player.y + player.h / 2;
  enterSlide(player);
  expect(player.h).toBe(40);
  expect(player.y + player.h / 2).toBe(bottom);
  exitSlide(player);
  expect(player.h).toBe(80);
  expect(player.y + player.h / 2).toBe(bottom);
});
