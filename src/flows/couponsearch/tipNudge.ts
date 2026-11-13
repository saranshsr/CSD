import { csTokens } from './tokens';

/**
 * `&cn=3..7` (discover.tsx): how often the coupon page's tooltip nudge plays (both share the counter). One counter for every coupon (a user who
 * has been told about BEAUTY10's search knows about ADCB's): it plays on the first `csTokens.discover.tip.visits`
 * coupon-page visits, and using the coupon search once ends it early (the seal or the tooltip, or the search's own
 * "Search within … items only" toggle switched on). Kept in localStorage, every access in try/catch: storage can be
 * blocked, and then the nudge simply plays every visit. `&nr=1` (kept on every page by main.tsx) clears the counter
 * once per page load, so a review link starts from the first visit; visits within that load still count.
 */
const KEY = 'nk.couponsearch.tipNudge';
const search = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
// cn=3 / 4 (the tooltips) and cn=5..7 (the tooltip over an overlay) share the counter
const enabled = [3, 4, 5, 6, 7].includes(Number(search?.get('cn')));

interface TipState {
  seen: number;
  used: boolean;
}
const read = (): TipState => {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Partial<TipState>) : null;
    return { seen: Number(v?.seen) || 0, used: !!v?.used };
  } catch {
    return { seen: 0, used: false };
  }
};
const write = (s: TipState) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* blocked storage: nothing remembered */
  }
};
if (enabled && search?.get('nr') === '1') {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* blocked storage */
  }
}

export const tipNudge = {
  /** a coupon-page visit asks to play the nudge: true (and counted) while it has visits left and was never used */
  claim(): boolean {
    if (!enabled) return false;
    const s = read();
    if (s.used || s.seen >= csTokens.discover.tip.visits) return false;
    write({ ...s, seen: s.seen + 1 });
    return true;
  },
  /** the coupon search was used: the nudge never plays again */
  used(): void {
    if (!enabled) return;
    write({ ...read(), used: true });
  },
};
