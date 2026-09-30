// Shared motion language — "Apple-style": critically-damped springs, interruptible, no linear tweens.
// Everyone imports from here. Tune values here only.
export const spring = {
  // iOS UINavigationController-like push/pop
  push:   { type: 'spring', stiffness: 380, damping: 40, mass: 1 },
  // sheets & overlays (slightly softer, a touch of settle)
  sheet:  { type: 'spring', stiffness: 300, damping: 32, mass: 1 },
  // small UI: chips, rows, cards appearing
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 },
  // shared-element morphs (search bar → search screen)
  morph:  { type: 'spring', stiffness: 420, damping: 42, mass: 1 },
  // press feedback
  press:  { type: 'spring', stiffness: 700, damping: 35 },
  // keyboard (iOS keyboard curve feel)
  keyboard: { type: 'spring', stiffness: 420, damping: 44 },
};
export const PRESS_SCALE = 0.97;
export const stagger = (i, step = 0.03, base = 0) => ({ delay: base + i * step });
// iOS push parallax: the covered screen moves this fraction of width and dims.
export const PARALLAX = 0.3;
export const DIM = 0.12;
