import { CURRENCY, defaultPlan } from './data';

/**
 * Entry-point demo data. All SERVER-DRIVEN on master (loyalty.touchpoints.cartOverlay / misc / checkout.OCOverlay,
 * cart `pushes.vip`, checkout session `integratedNoonone` + planSelect monthly plan) — no fixtures in bappzaar,
 * so these are realistic UAE values. Colours that arrive from the API are given as kit token refs (rendered inline).
 */

/** VIPButtonType as sent in touchpoints.cartOverlay.buttons / checkout.OCOverlay.buttons */
export interface EntryButton {
  title: string;
  cta: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

/** touchpoints.cartOverlay (CartOverlayTouchpointType) + cart pushes.vip.message */
export const cartOverlayTouchpoint = {
  title: 'Get FREE delivery on this order',
  /** `[placeholder]` ← pushes.vip.message */
  subtitle: '<p>Join noon One and save <b>[placeholder]</b> on delivery fees for these items</p>',
  oneDaySubtitle: '<p>Get these items delivered <b>tomorrow</b> with noon One</p>',
  pushMessage: `${CURRENCY} 15`,
  buttons: [
    { title: 'Explore benefits', cta: '/viewPlans', backgroundColor: 'var(--nk-color-bg-inverse)', borderColor: 'var(--nk-color-bg-inverse)', textColor: 'var(--nk-color-bg-surface)' },
    { title: 'Continue to checkout', cta: '/checkout', backgroundColor: 'var(--nk-color-bg-surface)', borderColor: 'var(--nk-color-border)', textColor: 'var(--nk-color-text-legacy)' },
  ] as EntryButton[],
};

/** NoonCartPushItemType.unitPrice — server html per cart line (member price) */
export const cartPushUnitPrice = (price: number) => `<p><b>${CURRENCY} ${price.toLocaleString('en-US')}</b></p>`;

/** checkout session `integratedNoonone` (NoonCheckoutIntegratedNoonOneSectionType) + planSelect monthly plan */
export const integratedNoonone = {
  title: '<p><b>Get <green>FREE</green> delivery with</b></p>',
  subtitle: `<p><green><b>You saved ${CURRENCY} 15</b></green> <bluegray>on delivery with noon One</bluegray></p>`,
  cta: `<p>Save <green><b>${CURRENCY} 15</b></green> on this order</p>`,
  benefitsCta: 'noon://www.noon.com/noon-one-all-plans',
  animation: { prefix: 'Save', suffix: 'on this order', savings: 15, currency: CURRENCY },
  /** noonOneMonthlyPlanDetails.discountNudge / amount / discountPercentage / isTrialValid */
  discountNudge: 'First month FREE',
  planAmount: defaultPlan.amount,
  planDiscountPercentage: null as string | null,
  planCode: defaultPlan.planCode,
};

/** touchpoints.checkout.OCOverlay (CheckoutTouchpointOverlayType) — shown on order confirmation when enrollOneRequestStatus is 'succeeded' */
export const ocOverlay = {
  header: 'Welcome to {logo}',
  headerColor: 'var(--nk-color-best-price-ink)',
  title: '',
  subTitle: 'Your membership is active. Enjoy free delivery, extra savings and exclusive deals on every order.',
  footerNote: 'Your first month is free. Cancel anytime from Manage membership.',
  buttons: [
    { title: 'Explore benefits', cta: '/noon-one', bgColor: 'var(--nk-color-bg-inverse)', borderColor: 'var(--nk-color-bg-inverse)', textColor: 'var(--nk-color-bg-surface)' },
    { title: 'Okay, got it', cta: '/ok', bgColor: 'var(--nk-color-bg-surface)', borderColor: 'var(--nk-color-bg-inverse)', textColor: 'var(--nk-color-bg-inverse)' },
  ],
};

/** touchpoints.checkout.OCErrorOverlay (status ≠ succeeded) */
export const ocErrorOverlay = {
  header: "We couldn't activate {logo}",
  headerColor: 'var(--nk-color-danger)',
  title: '',
  subTitle: 'Your order is placed, but your noon One membership could not be activated. You can join anytime from your account.',
  footerNote: '',
  buttons: [
    { title: 'Try again', cta: '/noon-one', bgColor: 'var(--nk-color-bg-inverse)', borderColor: 'var(--nk-color-bg-inverse)', textColor: 'var(--nk-color-bg-surface)' },
    { title: 'Okay, got it', cta: '/ok', bgColor: 'var(--nk-color-bg-surface)', borderColor: 'var(--nk-color-bg-inverse)', textColor: 'var(--nk-color-bg-inverse)' },
  ],
};
