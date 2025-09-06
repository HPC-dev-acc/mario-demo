import { enterSlide, exitSlide } from '../src/game/slide.js';

test('red light cancels slide and restores height', () => {
  const player = { h: 40, baseH: 40, sliding: 100 };
  enterSlide(player);
  expect(player.h).toBeLessThan(player.baseH);
  // simulate red light pause branch
  player.sliding = 0;
  exitSlide(player);
  expect(player.h).toBe(player.baseH);
});
