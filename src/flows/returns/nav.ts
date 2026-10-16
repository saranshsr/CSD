import type { NavApi } from '../../kit/Navigator';

/**
 * `navigator.popTo(rootComponentId)` — the kit stack has no popTo, so pop until the entry whose key is `rootKey`
 * is on top (each `back()` slices one entry). Falls back to `fallbackDepth` pops when the key is gone.
 */
export function popTo(nav: NavApi, rootKey: string | undefined, fallbackDepth = 1) {
  const idx = rootKey ? nav.stack.findIndex((e) => e.key === rootKey) : -1;
  const depth = idx >= 0 ? nav.stack.length - 1 - idx : fallbackDepth;
  for (let i = 0; i < Math.max(1, Math.min(depth, nav.stack.length - 1)); i++) nav.back();
}

/** stack key of the screen calling useNav() (passed on as `rootKey`, like master's rootComponentId) */
export const ownKey = (nav: NavApi) => nav.stack.find((e) => e.params === nav.params)?.key;
