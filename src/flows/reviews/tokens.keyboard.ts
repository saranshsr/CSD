import type { TokenOverrides } from '../../foundations/tokens';

/**
 * iOS keyboard mock colours (repo src/components/Keyboard.tsx, Figma 6042:140810). These are Apple system
 * colours, not noon ones, so they live here as flow tokens and are used only by `components/MockKeyboard`.
 */
export const reviewsKeyboardFlowTokens: TokenOverrides = {
  colors: {
    reviewsKbBed: '#D4D8DE', // keyboard bed
    reviewsKbKey: 'var(--nk-palette-white)', // key caps
    reviewsKbGlyph: '#1C1C1E', // KB_GLYPH
    reviewsKbIcon: '#3A3A3C', // KB_ICON (shift / delete)
    reviewsKbAux: '#595959', // emoji + mic glyphs
    reviewsKbReturn: '#0088FF', // blue return key
  },
  shadow: {
    reviewsKbKey: '0 1px 0.5px rgba(0, 0, 0, 0.25)', // KeyCap boxShadow
  },
  type: {
    reviewsKbKey: { size: 22, line: 'normal', weight: 400 }, // KeyCap 22/400 (system font in the repo; Noontree here)
    reviewsKbLabel: { size: 16, line: 'normal', weight: 400 }, // "ABC"
  },
};

/** Keyboard geometry (KeyCap 42 high, r6, rows 6px apart / 10px below, row 2 inset 22, min-height 290). */
export const reviewsKeyboard = {
  keyHeight: 42,
  wideKey: 42,
  modeKey: 88,
  minHeight: 290,
  rows: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'],
} as const;
