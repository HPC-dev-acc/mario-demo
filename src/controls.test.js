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

test('pointerdown and pointerup update key flags', () => {
  document.body.innerHTML = '<div id="left"></div>';
  const keys = createControls();
  const left = document.getElementById('left');

  left.dispatchEvent(new Event('pointerdown'));
  expect(keys.left).toBe(true);

  left.dispatchEvent(new Event('pointerup'));
  expect(keys.left).toBe(false);
});

test('pointer events on jump trigger callbacks', () => {
  document.body.innerHTML = '<div id="jump"></div>';
  const pressJump = jest.fn();
  const releaseJump = jest.fn();
  const keys = createControls(pressJump, releaseJump);
  const jump = document.getElementById('jump');

  jump.dispatchEvent(new Event('pointerdown'));
  expect(keys.jump).toBe(true);
  expect(pressJump).toHaveBeenCalledWith('touch');

  jump.dispatchEvent(new Event('pointerup'));
  expect(keys.jump).toBe(false);
  expect(releaseJump).toHaveBeenCalled();
});

test('jump without pressJump does not throw', () => {
  document.body.innerHTML = '<div id="jump"></div>';
  const keys = createControls();
  const jump = document.getElementById('jump');
  expect(() => jump.dispatchEvent(new Event('pointerdown'))).not.toThrow();
  expect(keys.jump).toBe(true);
});
