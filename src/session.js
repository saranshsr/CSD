// One coupon visit (Coupons → Shop more → … ). V1 remembers the scope you picked; H2 remembers that you
// dismissed the band, so returning to search from results doesn't bring it back. Tapping Shop more again
// starts a new visit: BEAUTY10 items and the band are back (agreed: the band returns on the next visit).
export const session = { scope: 'eligible', band: true };
export const newVisit = () => { session.scope = 'eligible'; session.band = true; };
