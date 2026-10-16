import { defineFlow } from '../../kit/registry';
import './transitions';
import { checkoutFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const AddPaymentCardScreen = lazyScreen(() => import('./AddPaymentCardScreen'), 'AddPaymentCardScreen');
const AlternatePhoneContactsScreen = lazyScreen(() => import('./AlternatePhoneContactsScreen'), 'AlternatePhoneContactsScreen');
const AlternatePhoneScreen = lazyScreen(() => import('./AlternatePhoneScreen'), 'AlternatePhoneScreen');
const BurnProvidersScreen = lazyScreen(() => import('./BurnProvidersScreen'), 'BurnProvidersScreen');
const CardsSelectScreen = lazyScreen(() => import('./CardsSelectScreen'), 'CardsSelectScreen');
const CheckoutScreen = lazyScreen(() => import('./CheckoutScreen'), 'CheckoutScreen');
const ConfirmationScreen = lazyScreen(() => import('./ConfirmationScreen'), 'ConfirmationScreen');
const DonationLearnMoreScreen = lazyScreen(() => import('./DonationLearnMoreScreen'), 'DonationLearnMoreScreen');
const EarnOverlayScreen = lazyScreen(() => import('./EarnOverlayScreen'), 'EarnOverlayScreen');
const EmiPlansScreen = lazyScreen(() => import('./EmiPlansScreen'), 'EmiPlansScreen');
const InstallationOverlayScreen = lazyScreen(() => import('./InstallationOverlayScreen'), 'InstallationOverlayScreen');
const LearnMoreScreen = lazyScreen(() => import('./LearnMoreScreen'), 'LearnMoreScreen');
const PaymentFailureHelpScreen = lazyScreen(() => import('./PaymentFailureHelpScreen'), 'PaymentFailureHelpScreen');
const PaymentFailureScreen = lazyScreen(() => import('./PaymentFailureScreen'), 'PaymentFailureScreen');
const PlacingScreen = lazyScreen(() => import('./PlacingScreen'), 'PlacingScreen');
const PromiseInfoScreen = lazyScreen(() => import('./PromiseInfoScreen'), 'PromiseInfoScreen');
const ProviderBurnOtpScreen = lazyScreen(() => import('./ProviderBurnOtpScreen'), 'ProviderBurnOtpScreen');
const ProviderBurnScreen = lazyScreen(() => import('./ProviderBurnScreen'), 'ProviderBurnScreen');
const ProviderEarnHelpScreen = lazyScreen(() => import('./ProviderEarnHelpScreen'), 'ProviderEarnHelpScreen');
const ProviderEarnScreen = lazyScreen(() => import('./ProviderEarnScreen'), 'ProviderEarnScreen');
const SpecialEmisScreen = lazyScreen(() => import('./SpecialEmisScreen'), 'SpecialEmisScreen');
const TrackStepsScreen = lazyScreen(() => import('./TrackStepsScreen'), 'TrackStepsScreen');

const S = 'marketplaces/noon/screens';
const C = 'marketplaces/noon/components';

export const checkoutFlow = defineFlow({
  id: 'checkout',
  title: 'Checkout',
  group: 'Shopping',
  description:
    'NoonCheckoutScreen (session v3: detached address, slider CTA, CVV required): address → shipment lanes → delivery instructions → receiver → payment methods (cards + CVV, special EMIs, Apple Pay, tabby, tamara, COD, noon credits) → points & vouchers → coupon status → earn → order summary; slide to order → NoonPostOrderLoader → NoonOrderConfirmationV3Screen. Payment failure + need help, card select / add card, EMI plans, alternate phone + contacts, installation slots, provider burn/earn + OTP.',
  initial: 'checkout',
  parent: 'cart/cart', // Back target when opened directly (no history)
  tokens: checkoutFlowTokens,
  screens: [
    {
      id: 'checkout',
      title: 'Checkout',
      component: CheckoutScreen,
      notes:
        'Layout = Figma All flows "Checkout" (127:44077, FIGMA-MAPPING.md § All flows): "Checkout" header, address card (→ Address Book), noon One free-delivery banner toggle, delivery instructions, receiver, shipments, "Top up noon Credits" (loyalty callouts → redeem; financing callout → providers list), Pay With card, donation pills (tap to add to the total, tap again to remove; Learn more → sheet), payment summary. Checkout 2.0 order via param sections: FIGMA_SECTIONS (address header, one shipment per cart group (supermall / global / express pill, "Need it today?" / "Save on fees…" expands the lanes), delivery instructions, receiver, Points & Vouchers + Pay With card, payment summary). Hidden kit sections (detached address, noon One, coupon status, earn, master invoice) come back via param sections (see CheckoutScreen FIGMA_SECTIONS / MASTER_SECTIONS). Entered from Cart → Checkout (carries the cart coupon). Type a 3-digit CVV to enable the slider, then drag past 85% (or 65% fast) → loader → confirmation. Tap the address → Address Book modal ("Address updated"). Payment failure demo: add card 4000 0000 0000 0002 (or open with param failPayment: true) and slide.',
      source: `Figma Af34gfmhQ1D0wstXUEHSIF · 127:44077 (All flows Checkout); Figma zURu7GI7sq77fjdXKrouvo · 14288:183972 (Checkout 2.0, FIGMA_SECTIONS); ${C}/NoonCheckoutBurnSection, NoonCheckoutDonation, NoonCheckoutNoonOneSection; ${S}/NoonCheckoutScreen/{NoonCheckoutScreen,styles}.ts(x), ${C}/NoonSalesAnimatedHeader, NoonCartAddressSelectorV2, NoonAddressSelector, NoonCheckoutShipment, NoonDynamicInvoice, NoonCheckoutSlideButton, src/components/FeedbackView (reloader)`,
    },
    {
      id: 'promise-info',
      title: 'Delivery lane info',
      component: PromiseInfoScreen,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { title: 'Same day delivery', textContent: 'Orders placed before 12 PM are delivered the same day. Delivery fee applies to this shipment only.' },
      notes: 'ⓘ on a shipment lane (showPromiseDetailsInfo).',
      source: 'src/screens/LearnMoreScreen',
    },
    {
      id: 'cards-select',
      title: 'Select card',
      component: CardsSelectScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Add/Change on the card row. Tap a card to select it (CVV clears); Add New closes and opens Add card.',
      source: `${S}/NoonCheckoutCardsSelectScreen`,
    },
    {
      id: 'add-card',
      title: 'Add card',
      component: AddPaymentCardScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Errors show after blur (nickname while typing). Add Card stays disabled until the form is valid. Test card 4000 0000 0000 0002, any future expiry, CVV 123: it is added, selected with the CVV prefilled, and its payment fails.',
      source: `${S}/NoonCheckoutAddPaymentCardScreen/{NoonCheckoutAddPaymentCardScreen,styles,validate}.ts(x) (payment_v3 off path of PaymentNavigation.goToCardAdditionScreen)`,
    },
    {
      id: 'special-emis',
      title: 'Special EMIs',
      component: SpecialEmisScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: "From the '0% Special installments' row. Only Visa cards are eligible. Select Card → Enter CVV → Confirm makes that section the active method.",
      source: `${S}/NoonCheckoutSpecialEMIsOverlayScreen`,
    },
    {
      id: 'emi-plans',
      title: 'Installment plans',
      component: EmiPlansScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'From the EMI callout under the selected card. Pick a plan (12 months is disabled below AED 1,500) → Confirm; the card row then shows "Selected Plan: … for N months".',
      source: `${S}/NoonSalesEMIPlansOverlayScreen`,
    },
    {
      id: 'alternate-phone',
      title: 'Receiver details',
      component: AlternatePhoneScreen,
      presentation: 'sheet', sheet: 'floating', // OverlayBottomSheet via useScrollToClose(…, isFloating true)
      notes: 'Receiver details → Change Receiver. Pick Primary / a saved contact, or type a name + number (more than 4 digits) and Save. The contacts icon opens the mocked device picker.',
      source: `${S}/NoonCheckoutAlternatePhoneScreen (+ SavedContact), ${S}/NoonCheckoutScreen/ReceiverDetails`,
    },
    {
      id: 'alternate-phone-contacts',
      title: 'Contacts',
      component: AlternatePhoneContactsScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Mocked device contact with two numbers; picking one pre-fills the receiver form.',
      source: `${S}/NoonCheckoutAlternatePhoneContactsScreen`,
    },
    {
      id: 'learn-more',
      title: 'Delivery instructions',
      component: LearnMoreScreen,
      presentation: 'sheet', sheet: 'floating', // OverlayBottomSheet isFloating
      defaultParams: { isList: true },
      notes: 'Info icon on "Delivery instructions" opens the list; tapping an inactive instruction card opens this sheet for that option and "Got It" turns it on.',
      source: `${S}/NoonCheckoutLearnMoreScreen, ${S}/NoonCheckoutScreen/DeliveryInstruction`,
    },
    {
      id: 'burn-providers',
      title: 'Points & vouchers',
      component: BurnProvidersScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Financing Options list. A provider opens provider-burn.',
      source: `${S}/NoonCheckoutBurnProvidersListOverlayScreen, ${C}/NoonCheckoutBurnSection`,
    },
    {
      id: 'provider-burn',
      title: 'Redeem points',
      component: ProviderBurnScreen,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { code: 'share' },
      notes: 'Phone number (loyalty) or voucher code (vouchers). Continue opens the OTP sheet. A voucher code starting 0000 gives an "invalid voucher" error.',
      source: `${S}/NoonProviderBurnOverlayScreen, ${C}/NoonCheckoutProvider/{Header,FormTitle,FormFields,DialCodeSelector}, NoonCheckoutProviderCrescent`,
    },
    {
      id: 'provider-burn-otp',
      title: 'Verify OTP',
      component: ProviderBurnOtpScreen,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { code: 'share' },
      notes: 'Loyalty: enter an amount (min/max, red ring when out of range) or tick Available balance. Vouchers: amount ticket. Then a 6-digit OTP; 000000 fails. Redeem closes both sheets, applies the burn to the invoice and shows the voucher toast.',
      source: `${S}/NoonProviderBurnOtpOverlayScreen, ${C}/NoonCheckoutProvider/{AmountEntry,AmountTicket,AvailableBalance,VerifyOtp,InfoEditButton,OtpLoading}`,
    },
    {
      id: 'donation-learn-more',
      title: 'Donation info',
      component: DonationLearnMoreScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'From "Learn more" on the donation section: charity logo, "Donate to Dar Al Ber Society", description and permit; Got it! closes it.',
      source: `${C}/NoonCheckoutDonationLearnMoreOverlay/{NoonCheckoutDonationLearnMoreOverlay,styles}.ts(x)`,
    },
    {
      id: 'earn',
      title: 'Earn points',
      component: EarnOverlayScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Pick a program to open provider-earn.',
      source: `${S}/NoonCheckoutEarnOverlayScreen, ${C}/NoonCheckoutEarnCallout`,
    },
    {
      id: 'provider-earn',
      title: 'Earn points (provider)',
      component: ProviderEarnScreen,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { code: 'share' },
      notes: 'Phone number + Earn points. A phone shorter than 9 digits gives an error. Opens How it works?.',
      source: `${S}/NoonProviderEarnOverlayScreen`,
    },
    {
      id: 'provider-earn-help',
      title: 'How it works',
      component: ProviderEarnHelpScreen,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { code: 'share' },
      source: `${S}/NoonProviderEarnHelpOverlayScreen`,
    },
    {
      id: 'installation',
      title: 'Installation slots',
      component: InstallationOverlayScreen,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { shipmentId: 'shp-1' },
      notes: 'Pick a day (greyed days are fully booked) and a slot, then Schedule → "Slot has been updated successfully". Param fail: true shows the error card with Retry. On master it opens from a slot-based shipment\'s "Other available slots" callout.',
      source: `${S}/NoonCheckoutInstallationOverlayScreen`,
    },
    {
      id: 'placing',
      title: 'Placing order',
      component: PlacingScreen,
      transition: 'none',
      notes: 'Slides in from below. Box lottie + status copy (card: bank msgs, tabby/tamara: BNPL msgs, COD: msg 1) → tick lottie + "Yay! Your order has been placed!" → confirmation (alpha 250ms). Clears the cart. With fail: true it opens the payment-failure modal instead.',
      source: `${C}/NoonPostOrderLoader, marketplaces/noon/hooks/useNoonPostOrderMessage`,
    },
    {
      id: 'confirmation',
      title: 'Order confirmation',
      component: ConfirmationScreen,
      // Master sets a light status bar over its CMS hero carousel (not ported); on the kit's grey #F2F3F7 top it must be dark.
      statusBar: 'dark',
      transition: 'checkout-alpha',
      notes: 'Live variant pushed by NoonPostOrderLoader (V3Screen). Continue Shopping / back → home; shipment card → orders/list; need-help pill toasts; notifications banner hides on Turn on.',
      source: `${S}/NoonOrderConfirmationV3Screen, ${C}/NoonShipmentV2, NoonOrderConfirmationAddress, NoonNotificationsBanner`,
      verified: '2026-10-14',
    },
    {
      id: 'track-steps',
      title: 'How to track',
      component: TrackStepsScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Registered on master but not opened from anywhere.',
      source: `${S}/NoonOrderConfirmationTrackStepsScreen`,
    },
    {
      id: 'payment-failure',
      title: 'Payment failed',
      component: PaymentFailureScreen,
      presentation: 'modal',
      notes: 'CTA fades in after 2s → back to checkout; Contact Us → need-help sheet.',
      source: `${S}/NoonCheckoutPaymentFailureScreen`,
    },
    {
      id: 'payment-failure-help',
      title: 'Need help',
      component: PaymentFailureHelpScreen,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Tap a value to copy.',
      source: `${S}/NoonCheckoutPaymentFailureNeedHelpOverlayScreen`,
    },
  ],
});
