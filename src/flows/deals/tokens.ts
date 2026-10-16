import type { TokenOverrides } from '../../foundations/tokens';

/** Deals tab (CMS page /noon-deals-ae) measurements, from the live mobile page at 390pt. */
export const dealsTokens = {
  stripRatio: 357 / 39,
  heroWidth: 357,
  heroHeight: 162,
  railCardWidth: 156, // screen ÷ 2.5, as on Home
} as const;

export const dealsFlowTokens: TokenOverrides = {
  colors: { bgPage: '#FFFFFF' },
};
