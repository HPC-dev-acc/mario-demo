import { updateCamera } from './game/camera.js';

describe('updateCamera', () => {
  beforeEach(() => {
    window.__getLogicalViewSize = () => ({ viewW: 1000, viewH: 540 });
  });

  test('moves camera right when player passes right threshold', () => {
    const state = { player: { x: 700 }, camera: { x: 0 }, GOAL_X: 5000 };
    updateCamera(state);
    expect(state.camera.x).toBeCloseTo(700 - 1000 * 0.65);
  });

  test('moves camera left when player passes left threshold', () => {
    const state = { player: { x: 800 }, camera: { x: 500 }, GOAL_X: 5000 };
    updateCamera(state);
    expect(state.camera.x).toBeCloseTo(800 - 1000 * 0.35);
  });

  test('clamps camera within level bounds', () => {
    const state = { player: { x: 1400 }, camera: { x: 0 }, GOAL_X: 1500 };
    updateCamera(state);
    expect(state.camera.x).toBe(500);
  });
});
