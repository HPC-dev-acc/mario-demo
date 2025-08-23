import { registerSW } from './registerSw.js';

test('registers service worker when supported', () => {
  const register = jest.fn().mockResolvedValue();
  navigator.serviceWorker = { register };
  registerSW();
  window.dispatchEvent(new Event('load'));
  expect(register).toHaveBeenCalledWith('./sw.js');
});

test('skips registration when not supported', () => {
  delete navigator.serviceWorker;
  expect(() => registerSW()).not.toThrow();
});
