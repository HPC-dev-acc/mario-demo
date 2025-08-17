import { computeRenderScale } from './utils/renderScale.js';

describe('computeRenderScale', () => {
  test('returns 1 for base size', () => {
    expect(computeRenderScale(960, 540, 960, 540)).toBe(1);
  });

  test('scales proportionally with width', () => {
    expect(computeRenderScale(1920, 1080, 960, 540)).toBe(2);
  });
});
