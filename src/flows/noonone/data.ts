import type { MembershipPlan } from '../../kit/membership';
import { currency } from '../../data';

/**
 * Shared noon One demo data. Everything here is SERVER-DRIVEN on master (VIPService.getVIPTouchpoints
 * 'landingV2' / 'planSelectV2' / 'cartOverlay', VIPPaymentService, loyalty reducer) — there are no fixtures in
 * bappzaar, so values are realistic UAE demo values (AED). Area-specific copy lives in data.<area>.ts.
 * Shapes follow features/vip/types/VIPType.ts (VIPPlanSelectPlanType, VIPPlanSelectTierType).
 */

export const CURRENCY = currency; // dirham sign U+E001 (Noontree) — was 'AED'

/** VIPPlanSelectPlanType (subset used by the kit screens) */
export interface VipPlan {
  planCode: string;
  tierCode: VipTierCode;
  title: string;
  /** monthly | yearly */
  period: 'monthly' | 'yearly';
  /** amount charged per period */
  amount: number;
  /** "AED 25/month" style label (server `monthlyPrice` / `selectionTitle`) */
  monthlyPrice: string;
  description?: string;
  savingPct?: string;
  isTrialValid: boolean;
  trialDays: number;
  trialMessage?: string;
  reminderMessage?: string;
  /** server html for the CTA, e.g. "Start free trial" / "Join for <s>AED 25</s> AED 0" */
  buttonText: string;
  paymentTerms: string;
  footerNote?: string;
  maxNumMembers: number;
  benefitsV3?: string[];
  supportsMobilePay?: boolean;
  bundleTag?: string;
  partnerDetails?: { name: string; iconUrl?: string };
}

export type VipTierCode = 'individual' | 'duo' | 'family' | 'yango';

export interface VipTier {
  tierCode: VipTierCode;
  title: string;
  subtitle?: string;
  tag?: string;
  plans: VipPlan[];
}

const terms = (amount: number, period: 'month' | 'year', trialDays = 30) =>
  `<p>Your ${trialDays}-day free trial starts today. After the trial you'll be charged <b>${CURRENCY} ${amount}/${period}</b> until you cancel. Cancel anytime from <a href="/noon-one-manage-membership">Manage membership</a>. <a href="https://www.noon.com/uae-en/noon-one-terms">Terms & Conditions</a> apply.</p>`;

const plan = (p: Omit<VipPlan, 'paymentTerms' | 'isTrialValid' | 'trialDays' | 'buttonText'> & Partial<Pick<VipPlan, 'buttonText' | 'isTrialValid' | 'trialDays'>>): VipPlan => ({
  isTrialValid: true,
  trialDays: 30,
  buttonText: 'Start free trial',
  paymentTerms: terms(p.amount, p.period === 'yearly' ? 'year' : 'month'),
  ...p,
});

export const tiers: VipTier[] = [
  {
    tierCode: 'individual',
    title: 'Individual',
    subtitle: 'Just for you',
    plans: [
      plan({ planCode: 'ONE_MONTHLY', tierCode: 'individual', title: 'Monthly', period: 'monthly', amount: 25, monthlyPrice: `${CURRENCY} 25/month`, maxNumMembers: 1, description: 'Billed monthly', supportsMobilePay: true }),
      plan({ planCode: 'ONE_ANNUAL', tierCode: 'individual', title: 'Annual', period: 'yearly', amount: 250, monthlyPrice: `${CURRENCY} 20.8/month`, savingPct: 'Save 17%', maxNumMembers: 1, description: `${CURRENCY} 250 billed yearly` }),
    ],
  },
  {
    tierCode: 'duo',
    title: 'Duo',
    subtitle: 'You + 1 member',
    plans: [
      plan({ planCode: 'ONE_DUO_MONTHLY', tierCode: 'duo', title: 'Monthly', period: 'monthly', amount: 35, monthlyPrice: `${CURRENCY} 35/month`, maxNumMembers: 2, description: 'Billed monthly' }),
      plan({ planCode: 'ONE_DUO_ANNUAL', tierCode: 'duo', title: 'Annual', period: 'yearly', amount: 350, monthlyPrice: `${CURRENCY} 29.2/month`, savingPct: 'Save 17%', maxNumMembers: 2, description: `${CURRENCY} 350 billed yearly` }),
    ],
  },
  {
    tierCode: 'family',
    title: 'Family',
    subtitle: 'You + up to 4 members',
    tag: 'Best value',
    plans: [
      plan({ planCode: 'ONE_FAMILY_MONTHLY', tierCode: 'family', title: 'Monthly', period: 'monthly', amount: 45, monthlyPrice: `${CURRENCY} 45/month`, maxNumMembers: 5, description: 'Billed monthly' }),
      plan({ planCode: 'ONE_FAMILY_ANNUAL', tierCode: 'family', title: 'Annual', period: 'yearly', amount: 450, monthlyPrice: `${CURRENCY} 37.5/month`, savingPct: 'Save 17%', maxNumMembers: 5, description: `${CURRENCY} 450 billed yearly` }),
    ],
  },
  {
    tierCode: 'yango',
    title: 'One + Yango Play',
    subtitle: 'noon One + Yango Play streaming',
    tag: 'Bundle',
    plans: [
      plan({ planCode: 'ONE_YANGO_MONTHLY', tierCode: 'yango', title: 'Monthly', period: 'monthly', amount: 39, monthlyPrice: `${CURRENCY} 39/month`, maxNumMembers: 1, description: 'Billed monthly', bundleTag: 'Yango Play', partnerDetails: { name: 'Yango Play' } }),
    ],
  },
];

export const allPlans: VipPlan[] = tiers.flatMap((t) => t.plans);
/** landingV2.plan — the plan the landing sticky CTA quick-subscribes to (master: server default, monthly individual) */
export const defaultPlan: VipPlan = allPlans[0];
/** planSelectV2.defaultTierCode */
export const defaultTierCode: VipTierCode = 'individual';

export const findPlan = (code?: string) => allPlans.find((p) => p.planCode === code) ?? defaultPlan;

/** VipPlan → shared kit membership plan (src/kit/membership.ts) */
export const toMembershipPlan = (p: VipPlan): MembershipPlan => ({
  id: p.planCode,
  name: `noon One ${p.tierCode === 'individual' ? '' : `${tiers.find((t) => t.tierCode === p.tierCode)?.title} `}${p.title}`.replace(/\s+/g, ' ').trim(),
  period: p.period,
  price: p.amount,
  seats: p.maxNumMembers,
});

/** VIPDefaultPaymentDetailsType — saved cards returned with the touchpoints (demo user) */
export interface VipCard {
  id: string;
  ccType: 'visa' | 'mastercard' | 'amex';
  ccMasked: string;
  last4: string;
  expiry: string;
  name: string;
  /** paymentMethodCode: cc_noonpay | applepay | boku */
  paymentMethodCode: 'cc_noonpay';
}

export const savedCards: VipCard[] = [
  { id: 'card_1', ccType: 'visa', ccMasked: '4111 11•• •••• 4242', last4: '4242', expiry: '09/28', name: 'Visa', paymentMethodCode: 'cc_noonpay' },
  { id: 'card_2', ccType: 'mastercard', ccMasked: '5123 45•• •••• 0019', last4: '0019', expiry: '03/27', name: 'Mastercard', paymentMethodCode: 'cc_noonpay' },
];

/** VIPPaymentV2Screen success → VIPEventEmitter.vipMembershipChanged(title, message) → VIPTransitionAnim texts (server: createSubscription response) */
export const successMessage = (p: VipPlan) => ({
  title: 'Welcome to noon One',
  subtitle: p.isTrialValid ? `Your ${p.trialDays}-day free trial has started` : 'Your membership is now active',
});

/**
 * Server re-prices plans once the free trial has been used (isEligibleForTrialAcrossPlans false → isTrialValid false,
 * CTA "Join now", terms without the trial line). Use with `useMembershipEligibility((s) => s.trialEligible)`.
 */
export const withEligibility = (p: VipPlan, trialEligible: boolean): VipPlan =>
  trialEligible || !p.isTrialValid
    ? p
    : {
        ...p,
        isTrialValid: false,
        buttonText: 'Join now',
        paymentTerms: `<p>You'll be charged <b>${CURRENCY} ${p.amount}/${p.period === 'yearly' ? 'year' : 'month'}</b> today and on every renewal until you cancel. Cancel anytime from <a href="/noon-one-manage-membership">Manage membership</a>. <a href="https://www.noon.com/uae-en/noon-one-terms">Terms & Conditions</a> apply.</p>`,
      };
