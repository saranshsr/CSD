import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Search-only values (NoonSearchSuggestionRow, NoonRecentlySearchedModule, NoonSearchPushAnimation) and the
 * suggestion choreography of the Brand Widget PLP handoff (github.com/saswata2002/Brand-Widget-PLP, app.js
 * "Search suggestions — ProtoPie handoff motion"); the shared curves live in `handoff` (src/motion/presets.ts).
 */
export const searchTokens = {
  recentItemWidth: Math.round(390 / 5.2), // screen ÷ 5.2
  suggestionRowHeight: 44,
  maxRows: 8,
  /** the push brings presearch up 20px, 124ms after touch-up */
  presearchPushDelay: 0.124,
  /** field cleared: presearch comes back this long after the last row has left */
  presearchGap: 0.04,
  /** first keystroke with matches → rows start falling in */
  rowEnterDelay: 0.11,
  /** top → bottom in */
  rowStagger: 0.06,
  /** bottom → top out (no match / field cleared) */
  rowOutStagger: 0.04,
  /** a burst of keys within this lands as one change while the rows are up (ms) */
  settleMs: 60,
  /** rows whose suggestion changes crossfade (BlurSwap), cascading this far apart */
  crossfadeStep: 0.028,
  /** spare rows (fewer matches) lift 10px and fade */
  goneTravel: 10,
  goneFade: 0.2,
  /** the exit into results: quicker and shorter, so it finishes before the PLP arrives */
  fastExit: { stagger: 0.025, fade: 0.13, move: 0.15, travel: 12 },
  pushSpring: { type: 'spring', stiffness: 280.6, damping: 27.14, mass: 1 },
} as const;

export const searchFlowTokens: TokenOverrides = {
  colors: { bgPage: '#FFFFFF' },
};
