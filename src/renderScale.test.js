import { computeRenderScale } from './utils/renderScale.js';

describe('computeRenderScale', () => {
  test('returns scaleX and scaleY', () => {
    expect(computeRenderScale(1440, 900, 960, 540)).toEqual({
      scaleX: 1.5,
      scaleY: 900 / 540,
    });
  });

  test('returns uniform scale when requested', () => {
    expect(computeRenderScale(1440, 900, 960, 540, true)).toBe(1.5);
  });
});
