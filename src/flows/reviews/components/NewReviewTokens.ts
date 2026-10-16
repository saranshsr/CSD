import { duration, easing } from '../../../motion/presets';
import { reviewsMotion as M, reviewsTokens as T } from '../tokens';

/**
 * NewReview screen-only geometry and timings — repo src/screens/NewReviewScreen.tsx constants (GROW_MIN_H, GROW_GAP,
 * NOTE_FOCUS_MIN_H, NAV_H, HEADER_EXPANDED …) and its inline setTimeout / transition values. Values that equal a kit
 * preset are the preset; the rest are the repo's deliberate R&R numbers, kept here with their source (motion.md rule).
 */
const nav = T.morphHeader.nav; // 56 — docked nav-bar height
const starsWidth = 5 * T.stars.header + 4 * 4; // 136 — five 24px stars, 4px apart

export const newReviewTokens = {
  /** scroll distance that fully docks the product into the nav (HEADER_EXPANDED − NAV_H = 72) */
  collapse: T.morphHeader.expanded - nav,
  morph: {
    /** product block top: 64 expanded (under the X) → 8 docked (beside it) */
    top: [nav + 8, 8] as const,
    /** docked block = 28px tile + 8 gap + stars, centred in the bar */
    dockedWidth: T.dockedImage.width + 8 + starsWidth,
    imageRadius: [12, 8] as const,
    rowGap: [12, 8] as const,
    nameHeight: 24,
    nameGap: 6,
  },
  /** editors sit 12px under the docked nav (NAV_H + 12) */
  editorTop: nav + T.gutter,
  /** grow editor: floor 320, settles 12px above Add photos, caps 24px above the keyboard */
  growMinH: 320,
  growGap: 12,
  growCapGap: 24,
  /** text + 16/12 padding + 12 gap + 36 controls row */
  growChrome: 76,
  /** top sheet overlaps the nav hairline by 5px */
  sheetOverlap: 5,
  /** focused optional note: content 134 + actions 40 */
  noteFocusMinH: 174,
  /** scroll bottom room once a draft exists, so the draft can scroll to the top (Figma) */
  scrollPadDraft: 340,
  scrollPadIdle: 20,
  /** counter ring (Figma 9802-54954) */
  ring: { size: 24, r: 10, stroke: 2.5 },
} as const;

export const newReviewMotion = {
  /** grow editor: scroll the card into place, then open (repo 280ms) */
  growOpenMs: 280,
  /** focus the editor once it is mounted (repo 60ms) */
  focusMs: 60,
  /** keep the focused note in view once the keyboard settles (repo 380ms) */
  noteScrollMs: 380,
  /** read card hides / grow editor fades in (repo .12s) */
  growFade: 0.12,
  /** grow "Save changes" row settles after the height morph lands (repo delay .18, y 4) */
  growControls: { delay: 0.18, y: 4 },
  /** Add photos fades in 50ms behind the crafting card */
  photosLag: 0.05,
  /** draft + Add photos rise 8px as they appear */
  riseY: 8,
  /** background recedes behind the grow editor / focused note: 2px layer blur at 40% */
  dim: { blur: 2, opacity: 0.4 },
  /** X ⇄ back chevron swap: scale .7 → 1, M.duration.fast */
  iconSwapFrom: 0.7,
  /** note box min-height (repo CSS .45s ease.drawer) */
  noteGrow: { duration: duration.slow, ease: easing.ios },
  /** dim fades (repo .25s CSS on the X / product) */
  dimFade: { duration: duration.base, ease: M.ease.out },
} as const;
