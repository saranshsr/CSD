import './transitions';
import { defineFlow } from '../../kit/registry';
import { entryScreens } from './screens.entry';
import { landingScreens } from './screens.landing';
import { offersScreens } from './screens.offers';
import { paymentScreens } from './screens.payment';
import { plansScreens } from './screens.plans';
import { noononeFlowTokens } from './tokens';

/**
 * noon One subscribe journey — bappzaar features/vip (acquisition side). Membership management lives in the
 * `membership` flow (entry `membership/manage`). Entry points: account noon One strip, cart overlay / upsell,
 * checkout noon One section, PDP member badge, coupon card, CMS/deeplinks (/noon-one, /noonvip, /noon-one-all-plans…).
 * Screen ↔ bappzaar component ↔ token table: MAPPING.md.
 */
export const noononeFlow = defineFlow({
  id: 'noonone',
  title: 'noon One',
  group: 'Profile',
  description:
    'noon One subscribe journey (features/vip): landing (CMS VIP modules + sticky Start free trial), plan select V3, plan option / trial-guide sheets, payment V2 (saved card · new card · CVV · Apple Pay · mobile pay), offers & vouchers, Yango bundle, family-plan invite, and the success animation that flips every entry point to the member state.',
  initial: 'landing',
  parent: 'account/account', // Back target when opened directly (no history)
  tokens: noononeFlowTokens,
  sheetBackdrop: 'noonone/landing',
  screens: [...landingScreens, ...plansScreens, ...paymentScreens, ...offersScreens, ...entryScreens],
});
