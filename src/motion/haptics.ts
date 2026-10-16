/**
 * Haptics from the noon X Supermall motion spec (iOS UIFeedbackGenerator kinds, Android vibrate patterns in ms).
 * Web prototype: `navigator.vibrate` (Android Chrome); iOS Safari ignores it outside a native shell, so haptics are
 * a progressive enhancement — never the only feedback. Where each kind goes: references/motion.md → Haptics.
 */
export const haptics = {
  /** light impact — taps on tabs, search bar, rows, pills */
  tap: { ios: 'impact · light', vibrate: [12] },
  /** selection — rows arriving, an icon spinning in */
  tick: { ios: 'selection', vibrate: [8] },
  /** medium impact (0.8) — snapping to a detent */
  snap: { ios: 'impact · medium 0.8', vibrate: [20] },
  /** rigid (0.6) — hitting an edge / limit */
  edge: { ios: 'impact · rigid 0.6', vibrate: [15] },
  /** soft (0.5) — something settling (a drop reaching bottom, a banner settling) */
  soft: { ios: 'impact · soft 0.5', vibrate: [10] },
  /** soft (0.4) — a list or card landing */
  land: { ios: 'impact · soft 0.4', vibrate: [10] },
  /** medium (0.7) — peak of a stretch, a nudge */
  pop: { ios: 'impact · medium 0.7', vibrate: [18] },
  /** notification success */
  success: { ios: 'notification · success', vibrate: [14, 50, 22] },
  /** notification error */
  error: { ios: 'notification · error', vibrate: [45, 40, 45, 40, 45] },
} as const;

export type HapticKind = keyof typeof haptics;

/** Play a haptic if the device supports it (no-op otherwise). */
export function haptic(kind: HapticKind) {
  try {
    // Browsers block (and log) vibrate() before the user has interacted with the page, e.g. a timed beat on load.
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (activation && !activation.hasBeenActive) return;
    navigator.vibrate?.([...haptics[kind].vibrate]);
  } catch {
    // unsupported — haptics are an enhancement only
  }
}
