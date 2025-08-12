import { withTimeout } from './withTimeout.js';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('resolves when promise resolves before timeout', async () => {
  await expect(withTimeout(Promise.resolve('ok'), 50, 'too slow')).resolves.toBe('ok');
});

test('rejects when promise takes too long', async () => {
  await expect(withTimeout(wait(100), 10, 'too slow')).rejects.toThrow('too slow');
});

test('does not trigger unhandled rejection after resolve', async () => {
  const handler = jest.fn();
  process.on('unhandledRejection', handler);
  await withTimeout(Promise.resolve('done'), 10, 'too slow');
  await wait(20);
  process.off('unhandledRejection', handler);
  expect(handler).not.toHaveBeenCalled();
});
