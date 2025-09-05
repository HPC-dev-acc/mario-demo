import { render, drawPlayer, drawTrafficLight, drawNpc, CAMERA_OFFSET_Y, getVisibleRange } from './render.js';
import { createGameState, Y_OFFSET } from './game/state.js';
import { TILE, findGroundY } from './game/physics.js';

test('render runs without throwing', () => {
  const state = createGameState();
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
  };
  expect(() => render(ctx, state)).not.toThrow();
});

test('render does not modify stage or canvas transforms', () => {
  const state = createGameState();
  state.camera.y = 10;
  const stage = { style: {} };
  const canvas = { width: 256, height: 240, style: {}, parentElement: stage };
  const ctx = {
    canvas,
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
  };
  render(ctx, state);
  expect(stage.style.transform).toBeUndefined();
  expect(canvas.style.transform).toBeUndefined();
});

test('getVisibleRange limits tiles to viewport', () => {
  const camera = { x: 96, y: 48 };
  const canvas = { width: 256, height: 240, dataset: { cssScaleX: '1', cssScaleY: '1' } };
  const range = getVisibleRange(camera, canvas, 20, 20, camera.y + CAMERA_OFFSET_Y);
  expect(range.startX).toBe(2);
  expect(range.endX).toBe(8);
  expect(range.startY).toBe(1);
  expect(range.endY).toBe(6);
});

test('render does not call drawCloud', () => {
  const state = createGameState();
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
  };
  global.drawCloud = jest.fn();
  render(ctx, state);
  expect(global.drawCloud).not.toHaveBeenCalled();
  delete global.drawCloud;
});

test('render does not draw bottom green ground', () => {
  const state = createGameState();
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
  };
  render(ctx, state);
  expect(ctx.fillRect).not.toHaveBeenCalledWith(0, ctx.canvas.height - 28, ctx.canvas.width, 28);
});

test('render does not draw goal line', () => {
  const state = createGameState();
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
  };
  render(ctx, state);
  const xs = ctx.fillRect.mock.calls.map(c => c[0]);
  expect(xs).not.toContain(state.GOAL_X);
});

test('render omits ground tiles', () => {
  const state = {
    level: [[1]],
    lights: {},
    player: { x: 0, y: 0, w: 40, h: 40, facing: 1, sliding: 0, onGround: true, shadowY: 20 },
    camera: { x: 0, y: 0 },
    GOAL_X: 0,
    LEVEL_W: 1,
    LEVEL_H: 1,
    playerSprites: null,
  };
  const ctx = {
    canvas: { width: TILE, height: TILE },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    drawImage: jest.fn(),
    fillStyle: '',
  };
  render(ctx, state);
  expect(ctx.fillRect).not.toHaveBeenCalledWith(0, 0, TILE, TILE);
});

test('drawPlayer chooses correct sprite', () => {
  const mk = (name) => ({ name });
  const sprites = {
    idle: [mk('idle')],
    run: [mk('run')],
    jump: [mk('jump')],
    slide: [mk('slide')],
  };
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    fillStyle: '',
  };
  const p = { x: 0, y: 0, shadowY: 24, facing: 1, w: 48, h: 48, vx: 0, vy: 0, onGround: true, sliding: 0, running: false, blocked: false };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.idle[0]);
  ctx.drawImage.mockClear();
  p.vx = 1; p.running = true;
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.run[0]);
  ctx.drawImage.mockClear();
  p.vx = 0; p.onGround = false; p.running = false;
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.jump[0]);
  ctx.drawImage.mockClear();
  p.onGround = true; p.sliding = 1; p.running = true;
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage.mock.calls[0][0]).toBe(sprites.slide[0]);
});

test('drawPlayer centers sprite with correct size', () => {
  const img = {};
  const sprites = { idle: [img] };
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    fillStyle: '',
  };
  const p = { x: 0, y: 0, shadowY: 16, facing: 1, w: 48, h: 32, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.drawImage).toHaveBeenCalledWith(img, -p.w / 2, -p.h / 2, p.w, p.h);
});

test('drawPlayer scales image to player dimensions', () => {
  const img = {};
  const sprites = { idle: [img] };
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    fillStyle: '',
  };
  const p = { x: 0, y: 0, shadowY: 25, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  const call = ctx.drawImage.mock.calls[0];
  expect(call[3]).toBe(p.w);
  expect(call[4]).toBe(p.h);
});

test('drawTrafficLight draws aligned sprite', () => {
  const img = {};
  const sprites = {
    red: { img, sx: 0, sy: 3, sw: 1024, sh: 1532 },
    yellow: { img, sx: 0, sy: 3, sw: 1024, sh: 1532 },
    green: { img, sx: 0, sy: 3, sw: 1024, sh: 1532 },
  };
  const ctx = { drawImage: jest.fn() };
  drawTrafficLight(ctx, 0, 0, 'red', sprites);
  const call = ctx.drawImage.mock.calls[0];
  const dh = TILE * 3.75;
  const dw = sprites.red.sw * (dh / sprites.red.sh);
  expect(call[0]).toBe(img);
  expect(call[1]).toBe(0);
  expect(call[2]).toBe(3);
  expect(call[3]).toBe(1024);
  expect(call[4]).toBe(1532);
  expect(call[5]).toBeCloseTo(TILE / 2 - dw / 2);
  expect(call[6]).toBeCloseTo(TILE - dh);
  expect(call[7]).toBeCloseTo(dw);
  expect(call[8]).toBeCloseTo(dh);
});

test('drawPlayer draws a shadow beneath the player', () => {
  const img = {};
  const sprites = { idle: [img] };
  let fillStyle;
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    get fillStyle() { return fillStyle; },
    set fillStyle(v) { fillStyle = v; },
  };
  const p = { x: 0, y: 0, shadowY: 25, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.ellipse).toHaveBeenCalledWith(p.x, p.shadowY, p.w / 2, p.h / 8, 0, 0, Math.PI * 2);
  const [, , rx, ry] = ctx.ellipse.mock.calls[0];
  expect(rx).toBeGreaterThan(ry);
  expect(fillStyle).toBe('rgba(0,0,0,0.3)');
  expect(ctx.fill).toHaveBeenCalled();
});

test('drawPlayer disables image smoothing', () => {
  const img = {};
  const sprites = { idle: [img] };
  const ctx = {
    save: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    beginPath: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    drawImage: jest.fn(),
    restore: jest.fn(),
    imageSmoothingEnabled: true,
    fillStyle: '',
  };
  const p = { x: 0, y: 0, shadowY: 25, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  expect(ctx.imageSmoothingEnabled).toBe(false);
});

test('shadow position is unaffected by player y changes', () => {
  const img = {};
  const sprites = { idle: [img] };
  const ctx = {
    save: jest.fn(), translate: jest.fn(), scale: jest.fn(),
    beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(),
    drawImage: jest.fn(), restore: jest.fn(),
    fillStyle: '',
  };
  const p = { x: 5, y: 10, shadowY: 35, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0 };
  drawPlayer(ctx, p, sprites, 0);
  const first = ctx.ellipse.mock.calls[0];
  p.y += 20; // move player without updating shadowY
  drawPlayer(ctx, p, sprites, 0);
  const second = ctx.ellipse.mock.calls[1];
  expect(second[0]).toBe(first[0]);
  expect(second[1]).toBe(first[1]);
});

test('findGroundY returns floor height when under a block', () => {
  const state = createGameState();
  const { level, player } = state;
  const columnX = 7;
  level[5 + Y_OFFSET][columnX] = 1;
  state.collisions = state.buildCollisions();
  player.x = columnX * TILE + TILE / 2;
  player.y = (state.LEVEL_H - 5) * TILE - player.h / 2;
  const groundY = (state.LEVEL_H - 5) * TILE;
  const shadowY = findGroundY(state.collisions, player.x, player.y + player.h / 2);
  expect(shadowY).toBe(groundY);
});

test('drawNpc crops sprite sheet frame', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: true, translate: jest.fn(), scale: jest.fn(),
  };
  const npc = { x: 40, y: 20, shadowY: 30, w: 64, h: 64, state: 'idle', animTime: 0 };
  const sprite = { img: {}, frameWidth: 64, frameHeight: 64, columns: 12, animations: { idle: { frames: [1], fps: 1, offsetY: 0 } } };
  drawNpc(ctx, npc, sprite);
  expect(ctx.drawImage).toHaveBeenCalledWith(sprite.img, 64, 0, 64, 64, expect.any(Number), expect.any(Number), 64, 64);
});

test('drawNpc draws shadow with half width', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: true, translate: jest.fn(), scale: jest.fn(),
  };
  const npc = { x: 10, y: 20, shadowY: 30, w: 40, h: 80, state: 'idle', animTime: 0 };
  drawNpc(ctx, npc, null);
  expect(ctx.ellipse).toHaveBeenCalledWith(npc.x, npc.shadowY, npc.w / 4, npc.h / 8, 0, 0, Math.PI * 2);
});

test('drawPlayer omits red-person icon when paused at red light', () => {
  const ctx = {
    save: jest.fn(),
    beginPath: jest.fn(),
    ellipse: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    drawImage: jest.fn(),
    imageSmoothingEnabled: true,
    fillStyle: '',
    font: '',
    measureText: jest.fn(() => ({ width: 50 })),
    rect: jest.fn(),
    stroke: jest.fn(),
    fillText: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    closePath: jest.fn(),
  };
  const sprites = { idle: [{}] };
  const p = { x: 0, y: 0, shadowY: 0, facing: 1, w: 40, h: 50, vx: 0, vy: 0, onGround: true, sliding: 0, redLightPaused: true };
  drawPlayer(ctx, p, sprites, 0);
  const iconDrawn = ctx.drawImage.mock.calls.some(args => args[0]?.src?.includes('red-person.svg'));
  expect(iconDrawn).toBe(false);
});

test('drawNpc omits red-person icon when paused at red light', () => {
  const ctx = {
    save: jest.fn(),
    beginPath: jest.fn(),
    ellipse: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    drawImage: jest.fn(),
    imageSmoothingEnabled: true,
    fillStyle: '',
    font: '',
    measureText: jest.fn(() => ({ width: 50 })),
    rect: jest.fn(),
    stroke: jest.fn(),
    fillText: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    closePath: jest.fn(),
  };
  const npc = { x: 0, y: 0, shadowY: 0, w: 40, h: 50, state: 'idle', animTime: 0, redLightPaused: true };
  const sprite = { img: {}, frameWidth: 64, frameHeight: 64, columns: 12, animations: { idle: { frames: [0], fps: 1, offsetY: 0 } } };
  drawNpc(ctx, npc, sprite);
  const bubbleDrawn = ctx.drawImage.mock.calls.some(args => args[0]?.src?.includes('red-person.svg'));
  expect(bubbleDrawn).toBe(false);
});

test('drawNpc scales using height', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: true, translate: jest.fn(), scale: jest.fn(),
  };
  const npc = { x: 0, y: 0, shadowY: 0, w: 10, h: 128, state: 'idle', animTime: 0 };
  const sprite = { img: {}, frameWidth: 64, frameHeight: 64, columns: 12, animations: { idle: { frames: [0], fps: 1, offsetY: 0 } } };
  drawNpc(ctx, npc, sprite);
  const scale = npc.h / sprite.frameHeight;
  expect(ctx.drawImage).toHaveBeenCalledWith(
    sprite.img,
    0,
    0,
    64,
    64,
    expect.any(Number),
    expect.any(Number),
    64 * scale,
    64 * scale
  );
});

test('drawNpc flips horizontally when facing left', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: true, translate: jest.fn(), scale: jest.fn(),
  };
  const npc = { x: 0, y: 0, shadowY: 0, w: 64, h: 64, state: 'idle', animTime: 0, facing: -1 };
  const sprite = { img: {}, frameWidth: 64, frameHeight: 64, columns: 12, animations: { idle: { frames: [0], fps: 1, offsetY: 0 } } };
  drawNpc(ctx, npc, sprite);
  expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
});

test('drawNpc renders from image arrays', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: true, translate: jest.fn(), scale: jest.fn(),
  };
  const img1 = {}, img2 = {};
  const npc = { x: 0, y: 0, shadowY: 0, w: 40, h: 80, state: 'walk', animTime: 0, facing: 1 };
  const sprite = { walk: [img1, img2], bump: [img1], idle: [img1] };
  drawNpc(ctx, npc, sprite);
  expect(ctx.drawImage).toHaveBeenCalledWith(img1, -npc.w / 2, -npc.h / 2, npc.w, npc.h);
});

test('drawNpc scales officeman 1.25x from center', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: true, translate: jest.fn(), scale: jest.fn(),
  };
  const npc = { x: 0, y: 0, shadowY: 0, w: 40, h: 40, state: 'idle', animTime: 0, facing: 1, type: 'officeman' };
  const sprite = { img: {}, frameWidth: 40, frameHeight: 40, columns: 1, animations: { idle: { frames: [0], fps: 1, offsetY: 0 } } };
  drawNpc(ctx, npc, sprite);
  expect(ctx.drawImage).toHaveBeenCalledWith(sprite.img, 0, 0, 40, 40, -25, -25, 50, 50);
});

test('drawNpc scales trunk 1.2x from center', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: true, translate: jest.fn(), scale: jest.fn(),
  };
  const npc = { x: 0, y: 0, shadowY: 0, w: 40, h: 40, state: 'walk', animTime: 0, facing: 1, type: 'trunk' };
  const frames = [{}];
  const sprite = { walk: frames, idle: frames };
  drawNpc(ctx, npc, sprite);
  expect(ctx.drawImage).toHaveBeenCalledWith(frames[0], -24, -24, 48, 48);
});

test('drawNpc enables smoothing for trunk', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: false, translate: jest.fn(), scale: jest.fn(),
  };
  const npc = { x: 0, y: 0, shadowY: 0, w: 40, h: 40, state: 'walk', animTime: 0, facing: 1, type: 'trunk' };
  const frames = [{}];
  const sprite = { walk: frames, idle: frames };
  drawNpc(ctx, npc, sprite);
  expect(ctx.imageSmoothingEnabled).toBe(true);
});

test('drawNpc walks through all frames within one second', () => {
  const ctx = {
    save: jest.fn(), beginPath: jest.fn(), ellipse: jest.fn(), fill: jest.fn(), restore: jest.fn(),
    drawImage: jest.fn(), fillStyle: '', imageSmoothingEnabled: true, translate: jest.fn(), scale: jest.fn(),
  };
  const frames = Array.from({ length: 12 }, () => ({}));
  const npc = { x: 0, y: 0, shadowY: 0, w: 40, h: 80, state: 'walk', animTime: 0.99, facing: 1 };
  const sprite = { walk: frames, idle: [frames[0]] };
  drawNpc(ctx, npc, sprite);
  expect(ctx.drawImage).toHaveBeenCalledWith(frames[11], -npc.w / 2, -npc.h / 2, npc.w, npc.h);
});

test('render draws trunk above player and other npcs', () => {
  const trunkImg = {}, npcImg = {}, playerImg = {};
  const state = createGameState();
  state.camera = { x: 0, y: 0 };
  state.player = { x: 0, y: 0, w: 10, h: 10, renderW: 10, facing: 1, onGround: true, running: false, redLightPaused: false, stunnedMs: 0, shadowY: 0 };
  state.playerSprites = { idle: [playerImg] };
  const otherNpc = { x: 0, y: 0, w: 10, h: 10, state: 'idle', sprite: { idle: [npcImg] }, shadowY: 0 };
  const trunkNpc = { x: 0, y: 0, w: 10, h: 10, state: 'idle', sprite: { idle: [trunkImg] }, shadowY: 0, type: 'trunk' };
  state.npcs = [otherNpc, trunkNpc];
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(), save: jest.fn(), translate: jest.fn(), fillRect: jest.fn(), beginPath: jest.fn(),
    ellipse: jest.fn(), fill: jest.fn(), strokeRect: jest.fn(), restore: jest.fn(), drawImage: jest.fn(), scale: jest.fn(), fillStyle: '', imageSmoothingEnabled: true,
  };
  render(ctx, state);
  const order = ctx.drawImage.mock.calls.map(c => c[0]);
  expect(order.indexOf(trunkImg)).toBeGreaterThan(order.indexOf(playerImg));
  expect(order.indexOf(trunkImg)).toBeGreaterThan(order.indexOf(npcImg));
});


test('render uses npc sprite property', () => {
  const state = createGameState();
  state.npcSprite = null;
  const npcSprite = { idle: [{}] };
  const npc = { x: 0, y: 0, w: 10, h: 10, state: 'idle', sprite: npcSprite, shadowY: 0 };
  state.npcs = [npc];
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    drawImage: jest.fn(),
    fillStyle: '',
  };
  render(ctx, state);
  expect(ctx.drawImage).toHaveBeenCalled();
});

test('design mode outlines collision boxes', () => {
  const state = createGameState();
  state.level[0][0] = 2;
  const npc = { x: 96, y: 96, w: 32, h: 64, box: { x: 96 - TILE / 2, y: 96 - 32, w: TILE, h: 64 }, state: 'idle', sprite: { idle: [{}] }, shadowY: 96 };
  state.npcs = [npc];
  const ctx = {
    canvas: { width: 256, height: 240 },
    clearRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    drawImage: jest.fn(),
    fillStyle: '',
  };
  const design = { isEnabled: () => true };
  render(ctx, state, design);
  expect(ctx.strokeRect).toHaveBeenCalledWith(0, 0, TILE, TILE);
  expect(ctx.strokeRect).toHaveBeenCalledWith(npc.box.x, npc.box.y, npc.box.w, npc.box.h);
  expect(ctx.strokeRect).toHaveBeenCalledWith(
    state.player.x - state.player.w / 2,
    state.player.y - state.player.h / 2,
    state.player.w,
    state.player.h,
  );
});
