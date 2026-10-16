import { ref, type TokenOverrides } from '../../foundations/tokens';
import { reviewsAiFlowTokens } from './tokens.ai';
import { reviewsKeyboardFlowTokens } from './tokens.keyboard';

export { reviewsMotion } from './tokens.motion';
export { reviewsAi } from './tokens.ai';
export { reviewsKeyboard } from './tokens.keyboard';

/**
 * Ratings & reviews (R&R 2.0) tokens. Repo src/tokens/colours.ts maps almost 1:1 onto existing kit tokens
 * (text-n-icon/primary #1d2539 = textPrimary, surface/secondary #f9f9fb = bgSubtle …, full table in
 * MAPPING.md). Only values with no kit equal are flow tokens, prefixed `reviews`. Screen CSS should use the
 * semantic kit vars first (`--nk-color-text-primary`, `--nk-color-border` …) and these only where listed.
 */

/** Plain metrics (TS) shared by the components — repo geometry, px. */
export const reviewsTokens = {
  gutter: 12, // card inset from the screen edge (cards 351 wide on a 375 frame)
  cardGap: 16, // gap between stacked cards (NewReview SCROLL_GAP, drafts)
  noteMax: 1000, // optional note cap (Figma 10562-228822)
  editMax: 1000, // edit-review cap
  collapseAt: 240, // ReviewDraft A: texts longer than this get "show more"
  collapseTo: 229, // … trimmed to ~229 chars on a word boundary
  stars: { header: 24, deck: 32, panel: 33, small: 20 }, // star sizes used by the repo
  headerImage: { width: 56, height: 64 }, // ManualReview product tile
  compactImage: { width: 48, height: 64 }, // ReviewDraftB thumbnail
  dockedImage: { width: 28, height: 32 }, // docked header (NewReview / RatePastOrders)
  stripCard: { width: 88, image: 80 }, // RatePastOrders product strip
  deckCard: { width: 286, image: 301 }, // past-order card
  photoThumb: { width: 72, height: 85 }, // Submitted photo thumbnails
  morphHeader: { nav: 56, expanded: 128 }, // NewReview MorphingHeader
  aiSwitch: { width: 42, height: 24, knob: 20, inset: 2 }, // SpringToggle
} as const;

const baseFlowTokens: TokenOverrides = {
  colors: {
    // every R&R screen: linear-gradient(to bottom, #eaecf0, #f9f9fb) (colours.ts screenBg); solid fallback #f9f9fb
    bgPage: 'var(--nk-palette-secondary-background-color)',
    reviewsPage: 'linear-gradient(180deg, var(--nk-palette-light-grey-color) 0%, var(--nk-palette-secondary-background-color) 100%)',
    // in-screen sheet scrim rgba(16,22,40,.45) (NewReview ProgressSheet / EditReviewSheet); ReviewDraft A uses kit primaryAlpha45
    reviewsScrim: 'rgba(16, 22, 40, 0.45)',
    // frosted scrim behind the top-sheet editor rgba(249,249,251,.3)
    reviewsFrost: 'rgba(249, 249, 251, 0.3)',
    // checkbox row press tint rgba(29,37,57,.04)
    reviewsRowPress: 'rgba(29, 37, 57, 0.04)',
    // Submitted review card: white .88
    reviewsGlass: 'rgba(255, 255, 255, 0.88)',
    // "Rewrite your review?" amber badge #f5a623
    reviewsWarning: '#F5A623',
    // top-sheet editor counter ring track #e2e5eb
    reviewsRingTrack: '#E2E5EB',
  },
  shadow: {
    reviewsCard: '0 4px 6px var(--nk-palette-black-alpha4)', // Write with AI card (NewReview)
    reviewsDeckCard: '0 1px 8px var(--nk-palette-black-alpha4)', // past-order card
    reviewsPolaroid: '0 2px 10px var(--nk-palette-black-alpha4)', // ReviewDraft A tilted product photo
    reviewsSheet: '0 -2px 16px var(--nk-palette-black-alpha12)', // edit sheet (docked)
    reviewsFloat: '0 4px 24px var(--nk-palette-black-alpha12)', // edit sheet (floating, ReviewDraft A)
    reviewsTopSheet: '0 8px 24px var(--nk-palette-black-alpha12)', // top-sheet editor
    reviewsKnob: '0 0 4.8px rgba(14, 14, 14, 0.07)', // AI switch knob
  },
  type: {
    reviewsText14MediumLh20: { size: 14, line: 20, weight: 500 }, // checkbox labels, review text, attribution name
    reviewsText15RegularLh22: { size: 15, line: 22, weight: 400 }, // generated draft text
    reviewsText15MediumLh22: { size: 15, line: 22, weight: 500 }, // optional note field
    reviewsText16MediumLh24: { size: 16, line: 24, weight: 500 }, // manual textarea
    reviewsText16SemiboldLh24: { size: 16, line: 24, weight: 600 }, // product name in the header
    reviewsText16BoldLh24: { size: 16, line: 24, weight: 700 }, // "Add photos", "Your review"
    reviewsText15BoldLh20: { size: 15, line: 20, weight: 700 }, // sheet buttons (Keep review / Edit picks)
    reviewsText20ExtraboldLh24: { size: 20, line: 24, weight: 800 }, // "Thanks, you star!"
  },
  radius: {
    reviewsR18: 18, // 36px chip
    reviewsR14: 14, // NewReview CTA / sheet buttons
  },
  // R&R CTAs are #101628 (textStrong), disabled #eaecf0 / #989fb3 — the kit `dark` button, re-pointed for this flow
  button: {
    darkBg: ref.color('textStrong'),
    darkFgDisabled: ref.color('textTertiary'),
    // past-order "Next": white, #d6e9ff border, #0f61ff label (Figma M-SecondaryButton) → kit `outline`, re-pointed
    outlineFg: ref.color('primary'),
    outlineBorder: ref.color('pillSelectedBorder'),
  },
  // 40px circle buttons: white with a #f2f3f7 border (repo border.subtle)
  iconButton: {
    outlineBorder: ref.color('borderSubtle'),
  },
};

/** Groups merged one level deep, so each area file can add its own `colors` / `type` / … keys. */
function mergeTokens(...parts: TokenOverrides[]): TokenOverrides {
  const out: Record<string, Record<string, unknown>> = {};
  for (const part of parts) for (const [group, values] of Object.entries(part)) out[group] = { ...out[group], ...(values as Record<string, unknown>) };
  return out as TokenOverrides;
}

export const reviewsFlowTokens: TokenOverrides = mergeTokens(baseFlowTokens, reviewsAiFlowTokens, reviewsKeyboardFlowTokens);
