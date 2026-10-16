import type { ScreenDef } from '../../kit/types';
import { lazyScreen } from '../../kit/lazyScreen';

const AddCardOverlayScreen = lazyScreen(() => import('./screens/AddCardOverlayScreen'), 'AddCardOverlayScreen');
const AddCvvOverlayScreen = lazyScreen(() => import('./screens/AddCvvOverlayScreen'), 'AddCvvOverlayScreen');
const GenericOverlayScreen = lazyScreen(() => import('./screens/GenericOverlayScreen'), 'GenericOverlayScreen');
const InfoOverlayScreen = lazyScreen(() => import('./screens/InfoOverlayScreen'), 'InfoOverlayScreen');
const MobilePayOverlayScreen = lazyScreen(() => import('./screens/MobilePayOverlayScreen'), 'MobilePayOverlayScreen');
const PaymentScreen = lazyScreen(() => import('./screens/PaymentScreen'), 'PaymentScreen');

const S = 'features/vip/screens';
const overlay = { presentation: 'modal', transition: 'noonone-overlay' } as const;

/** payment screens — owned by the payment area (see MAPPING.md → Payment). */
export const paymentScreens: ScreenDef[] = [
  {
    id: 'payment',
    title: 'Payment',
    component: PaymentScreen,
    statusBar: 'dark',
    defaultParams: { planCode: 'ONE_MONTHLY' },
    source: `${S}/VIPPaymentV2Screen (+ VIPPaymentCardSelect, VIPPaymentMobileSelect, VIPTrialGuideButton), components/VIPSubscriptionButtonV2, hooks/useVIPPaymentData`,
    notes:
      'Opened from the plans "Pay with" row / VIPSubscriptionButtonV2 (params: planCode). Saved Visa ••4242 is preselected; picking another method flashes the FeedbackView reloader (checkSelectedPayment). Mastercard ••0019 needs verification: an inline CVV field appears and paying without a valid CVV opens Add CVV → Verify resumes the payment. "Add New Card" opens the card form (try 4111 1111 1111 1111 · 12/29 · 123) and selects the new card. "Add Mobile Number" runs the Boku opt-in → OTP (000000 = wrong code). The blue trial-guide strip opens noonone/trialGuide. The CTA shows the reloader ~1.5s, subscribes (membership store) and pops back to the landing, which plays the success animation.',
  },
  {
    id: 'addCard',
    title: 'Add card',
    component: AddCardOverlayScreen,
    ...overlay,
    source: `${S}/VIPAddCardOverlayScreen (src/components/Overlay, FormikTextInput, FormikCheckbox, FormikSubmitButton → PrimaryButton)`,
    notes: 'Legacy Overlay (close button above the top-right corner). Add Card enables once the Luhn-valid number, a future MM/YY and a 3-digit CVV (4 for Amex) are typed; saving adds and selects the card on the payment screen.',
  },
  {
    id: 'addCvv',
    title: 'Add CVV',
    component: AddCvvOverlayScreen,
    ...overlay,
    defaultParams: { cardId: 'card_2' },
    source: `${S}/VIPAddCvvOverlayScreen (src/components/Overlay)`,
    notes: 'Opened by the payment CTA when the selected card needs verification and the CVV is missing/invalid. Wrong length shows "Oops! This CVV is invalid."; Verify closes and continues the subscription.',
  },
  {
    id: 'mobilePay',
    title: 'Pay with mobile',
    component: MobilePayOverlayScreen,
    ...overlay,
    source: `${S}/VIPMobilePayOverlayScreen (src/components/Overlay, PhoneInput, SegmentedTextInput), services/VIPBokuService`,
    notes: 'Step 1: number → Continue (opt-in). Step 2: 6-digit OTP with Change / Resend (30s cooldown, attempts counter); 000000 shows the error state, any other code registers and selects the number.',
  },
  {
    id: 'info',
    title: 'Info popup',
    component: InfoOverlayScreen,
    ...overlay,
    source: `${S}/VIPInfoOverlayScreen (VIPUtil.showInfoOverlay / showWarningPopup, VIPSubscriptionButtonV2.showWarningPopup)`,
    notes: 'Default demo: the centred "not eligible for noon one Free Trial" popup (cannot be dismissed by the scrim). Pass InfoOverlayParams (title/body/buttons/isPopup/reminder) for other info sheets.',
  },
  {
    id: 'generic',
    title: 'Generic overlay',
    component: GenericOverlayScreen,
    ...overlay,
    source: `${S}/VIPGenericOverlayScreen + components/VIPPopups/VIPInfoPopup, VIPUpdatePopup (utils/VIPPopupUtil)`,
    notes: "Default: VIPPopupUtil.showTouchpointErrorPopup (centred defaultPopup card). Params { variant: 'update' } shows the app-update sheet the landing opens when targetAppBuild is newer.",
  },
];
