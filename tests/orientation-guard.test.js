// Test that orientation changes to landscape trigger canvas resize

test('landscape orientation triggers canvas resize', () => {
  let landscape = false;
  window.matchMedia = jest.fn().mockImplementation(() => ({ matches: landscape }));
  window.requestAnimationFrame = cb => { cb(); return 0; };
  window.cancelAnimationFrame = jest.fn();
  window.__resizeGameCanvas = jest.fn();

  require('../src/ui/orientation-guard.js');
  expect(window.__OrientationGuard__.overlay.classList.contains('active')).toBe(true);

  landscape = true;
  window.dispatchEvent(new Event('orientationchange'));

  expect(window.__resizeGameCanvas).toHaveBeenCalled();
});
