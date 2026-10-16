/**
 * Flow registry. Every folder in src/flows exports one FlowDef; list it here to show it in
 * the playground and export it from the library. Order = sidebar order.
 */
import type { FlowDef } from '../kit/types';
import { fielddsFlow } from './fieldds';
import { homeFlow } from './home';
import { searchFlow } from './search';
import { categoriesFlow } from './categories';
import { dealsFlow } from './deals';
import { plpFlow } from './plp';
import { pdpFlow } from './pdp';
import { cartFlow } from './cart';
import { checkoutFlow } from './checkout';
import { ordersFlow } from './orders';
import { returnsFlow } from './returns';
import { reviewsFlow } from './reviews';
import { accountFlow } from './account';
import { wishlistFlow } from './wishlist';
import { addressFlow } from './address';
import { cardsFlow } from './cards';
import { noononeFlow } from './noonone';
import { membershipFlow } from './membership';
import { couponsearchFlow } from './couponsearch';

export { homeFlow, searchFlow, categoriesFlow, dealsFlow, plpFlow, pdpFlow, cartFlow, checkoutFlow, ordersFlow, returnsFlow, reviewsFlow, accountFlow, addressFlow, cardsFlow, noononeFlow, membershipFlow, wishlistFlow, fielddsFlow, couponsearchFlow };

export const allFlows: FlowDef[] = [homeFlow, searchFlow, categoriesFlow, dealsFlow, plpFlow, pdpFlow, cartFlow, couponsearchFlow, checkoutFlow, ordersFlow, returnsFlow, reviewsFlow, accountFlow, addressFlow, cardsFlow, noononeFlow, membershipFlow, wishlistFlow, fielddsFlow];
