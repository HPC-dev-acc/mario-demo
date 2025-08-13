import { Y_OFFSET } from './state.js';

export function toLogical(objs) {
  return objs.map(o => ({
    type: o.type,
    x: o.x,
    y: o.y - Y_OFFSET,
    transparent: !!o.transparent,
    ...(o.destroyable === false ? { destroyable: false } : {}),
    ...(o.collision ? { collision: o.collision } : {})
  }));
}
