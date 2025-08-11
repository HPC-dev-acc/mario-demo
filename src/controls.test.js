import { createControls } from './controls.js';

test('keyboard controls update keys', () => {
  let keys;
  const pressJump = jest.fn(() => { keys.jump = true; });
  const releaseJump = jest.fn(() => { keys.jump = false; });
  keys = createControls(pressJump, releaseJump);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
  expect(keys.left).toBe(true);
});

test('jump key triggers pressJump', () => {
  let keys;
  const pressJump = jest.fn(() => { keys.jump = true; });
  const releaseJump = jest.fn(() => { keys.jump = false; });
  keys = createControls(pressJump, releaseJump);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  expect(pressJump).toHaveBeenCalled();
});
