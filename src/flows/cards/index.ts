import { defineFlow } from '../../kit/registry';
import { cardsFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const AddCardScreen = lazyScreen(() => import('./AddCardScreen'), 'AddCardScreen');
const AddCardSuccessScreen = lazyScreen(() => import('./AddCardSuccessScreen'), 'AddCardSuccessScreen');
const CardsScreen = lazyScreen(() => import('./CardsScreen'), 'CardsScreen');

const SRC = 'features/payment';

export const cardsFlow = defineFlow({
  id: 'cards',
  title: 'Manage cards',
  group: 'Profile',
  description:
    'Account → "Manage cards" (PaymentNavigation.goToCardsScreen, payment V2). Wallet-style stacked saved cards with card actions (name / set default / delete), empty state, scan-or-type add card form and the save-card reveal.',
  initial: 'cards',
  parent: 'account/account', // Back target when opened directly (no history)
  tokens: cardsFlowTokens,
  screens: [
    {
      id: 'cards',
      title: 'Saved cards',
      component: CardsScreen,
      statusBar: 'dark',
      source: `${SRC}/screens/PaymentCardsV2Screen (+ components/PaymentScrollableHeader, PaymentAnimatedListCard, PaymentCard, PaymentCardShimmer, PaymentCardsSectionTitle, screens/PaymentCardActionsScreen, hooks/usePaymentEditActions)`,
      notes:
        'Cards load under a 1s shimmer, then bounce front-to-back. Scroll: the "Add card" pill collapses into a dark glass circle. Drag the stack down (or wheel-up at the top) to fan it open. Tap a card: it flies up, tilts, drops above the floating actions panel while the list dims — try Add name / Set as default / Delete card (confirmation). Delete every card to reach the empty state. Tap outside the panel to close.',
    },
    {
      id: 'actions',
      title: 'Card actions',
      component: CardsScreen,
      defaultParams: { select: 'first-non-default' },
      source: `${SRC}/screens/PaymentCardActionsScreen, components/PaymentCardActionButton`,
      notes: 'Same list with the actions overlay auto-opened on the first non-default card (deep link for demos).',
    },
    {
      id: 'delete',
      title: 'Delete confirmation',
      component: CardsScreen,
      defaultParams: { select: 'first-non-default', action: 'DELETE_CARD' },
      source: `${SRC}/components/PaymentActionConfirmation (via hooks/usePaymentEditActions DELETE_CARD)`,
      notes: '"Yes, delete" closes the overlay, the card collapses out of the stack and the "Card ****xxxx has been deleted" toast shows.',
    },
    {
      id: 'empty',
      title: 'No saved cards',
      component: CardsScreen,
      defaultParams: { seed: 'empty' },
      source: `${SRC}/components/PaymentEmptyCardsScreen`,
      notes: 'Clears the mock cards. "Add card" runs the full add flow and returns to a one-card stack.',
    },
    {
      id: 'many',
      title: 'Many cards (sections)',
      component: CardsScreen,
      defaultParams: { seed: 'many' },
      source: `${SRC}/screens/PaymentCardsV2Screen (sections memo: > 5 cards)`,
      notes: 'Seeds 7 cards: "Top cards" (first 4, default to the front) and "All other cards". Scroll to see the Add card pill collapse into a dark glass button and the top gradient fade in; tap a lower-section card and the other sections fade out.',
    },
    {
      id: 'add',
      title: 'Add card',
      component: AddCardScreen,
      source: `${SRC}/screens/PaymentCardManualAdditionScreen (+ components/PaymentCardAdditionOptions, PaymentCardAdditionOption, PaymentScanOptions, PaymentCardFormV2, PaymentTextInputV2, PaymentSwitchV2, PaymentCardTypeLogo, PaymentCardBrands, PaymentButtonV2)`,
      notes:
        '"Enter details manually" springs the card into the form sheet. Card number formats in 4s and shows the live brand logo (Visa 4…, Mastercard 5…, Amex 34/37, mada BINs); errors appear 300ms after typing. "Scan card" / "Tap card" (and the header Scan / Tap pills) simulate a camera / NFC result. Save card → success.',
    },
    {
      id: 'form',
      title: 'Add card — form',
      component: AddCardScreen,
      defaultParams: { manual: true },
      source: `${SRC}/components/PaymentCardFormV2 (isFormInitiallyVisible: no scan support / skipFullScreenScanOptions)`,
      notes: 'Form shown straight away, as on devices without camera/NFC scanning. Try 4111 1111 1111 1111, 12/30, 123.',
    },
    {
      id: 'success',
      title: 'Card saved',
      component: AddCardSuccessScreen,
      transition: 'fade',
      source: `${SRC}/screens/PaymentCardAdditionSuccessScreen (lottie save_card/v4/en/reveal)`,
      notes: 'Card skin fades in, the reveal lottie plays, the masked number appears at 1.88s and the screen pops back to the list on completion.',
    },
  ],
});
