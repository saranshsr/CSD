import { membershipActions, membershipStore, type FamilyMember, type MembershipPlan, type MembershipState } from '../../kit/membership';
import type { MembershipManageState } from '../../kit/membership';
import { user, currency } from '../../data';
import { icons } from './assets';
import vipEn from './locale/vip-en.json';

/**
 * noon One management — shared demo data. On master every value here is SERVER-DRIVEN (VIPService.getVIPTouchpoints
 * 'manageMembershipV2,planUpgrade' / 'cancelMembershipV2' / 'familyPlans' / 'shareInvite' …, loyalty reducer). bappzaar
 * has no vip fixtures (__mocks__ / __tests__ have none), so these are realistic UAE demo values (AED) shaped like
 * features/vip/types (TouchpointsTypes.ts, VIPType.ts). Plan codes + prices match the `noonone` acquisition flow.
 * Area-specific copy/content lives next to the screens (cancelData.ts, planData.ts, familyData.ts, …).
 */

export const CURRENCY = currency; // dirham sign U+E001 (Noontree) — was 'AED'

// ── i18n: features/vip/locale/translations/vip-en.json (verbatim copy) ─────────────────────────────────────────
type VipKey = keyof typeof vipEn;
/** I18n.t for vip keys: `{{x}}` interpolation + i18n-js plural objects ({ one, other … } keyed by `count`). */
export function t(key: VipKey, params: Record<string, string | number> = {}): string {
  const raw = vipEn[key] as string | Record<string, string>;
  let s = typeof raw === 'string' ? raw : (Number(params.count) === 1 ? raw.one : raw.other) ?? '';
  for (const [k, v] of Object.entries(params)) s = s.split(`{{${k}}}`).join(String(v));
  return s;
}
/** lodash _.capitalize — first char upper, rest lower (master applies it to server button texts). */
export const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');

// ── plans (MembershipPlan in src/kit/membership.ts) ─────────────────────────────────────────────────────────────
export const plans = {
  monthly: { id: 'ONE_MONTHLY', name: 'noon One Monthly', period: 'monthly', price: 25, seats: 1 },
  annual: { id: 'ONE_ANNUAL', name: 'noon One Annual', period: 'yearly', price: 250, seats: 1 },
  duoMonthly: { id: 'ONE_DUO_MONTHLY', name: 'noon One Duo Monthly', period: 'monthly', price: 35, seats: 2 },
  familyMonthly: { id: 'ONE_FAMILY_MONTHLY', name: 'noon One Family Monthly', period: 'monthly', price: 45, seats: 5 },
  familyAnnual: { id: 'ONE_FAMILY_ANNUAL', name: 'noon One Family Annual', period: 'yearly', price: 450, seats: 5 },
} satisfies Record<string, MembershipPlan>;

export const planById = (id?: string): MembershipPlan | undefined => Object.values(plans).find((p) => p.id === id);
export const isFamilyPlan = (p?: MembershipPlan) => (p?.seats ?? 1) > 1;
export const money = (n: number) => `${CURRENCY} ${n.toFixed(2)}`;
export const perPeriod = (p: MembershipPlan) => `${money(p.price)}/${p.period === 'yearly' ? 'year' : 'month'}`;

/** "11 Nov 2026" (server billing dates are pre-formatted like this) */
export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const inDays = (d: number) => new Date(Date.now() + d * 864e5).toISOString();

// ── payment card (VIPDefaultPaymentDetailsType → getPaymentMethodData image / number) ───────────────────────────
export const cardImage = (brand?: NonNullable<MembershipState['paymentCard']>['brand']) =>
  brand === 'mastercard' ? icons.cardMastercard : brand === 'amex' ? icons.cardAmex : brand === 'visa' ? icons.cardVisa : icons.card;
export const demoCard: NonNullable<MembershipState['paymentCard']> = { brand: 'visa', last4: '4521' };

// ── people ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const ownerName = `${user.firstName} ${user.lastName}`;
/** joined members on the demo family plan (VIPPlanActiveMemberType: name, customerCode, savingsText) */
export const demoFamily: FamilyMember[] = [
  { id: 'Z8K2M4', name: 'Sara Debnath', phone: '+971 50 482 1190', status: 'joined' },
  { id: 'Q4N7P1', name: 'Rohan Debnath', phone: '+971 55 210 7734', status: 'joined' },
];
/** savingsText per member (server copy) */
export const memberSavings: Record<string, string> = { Z8K2M4: 'Saved AED 214', Q4N7P1: 'Saved AED 96' };
export const memberSavingsText = (m: FamilyMember) => memberSavings[m.id] ?? (m.status === 'invited' ? 'Invite sent' : 'Saved AED 0');
/** family owner the demo user joined (role 'member') */
export const familyOwnerName = 'Rahul Sharma';

// ── demo states (also linked from the playground notes: /manage-membership?state=trial) ─────────────────────────
export type DemoState = 'active' | 'trial' | 'cancelled' | 'familyOwner' | 'familyMember' | 'upcoming';
type Full = MembershipState & MembershipManageState;
export const demoStates: Record<DemoState, Partial<Full>> = {
  active: { status: 'active', plan: plans.monthly, renewsOn: inDays(30), savings: 312, role: 'owner', family: [], paymentCard: demoCard, upcomingPlan: undefined, memberSince: inDays(-152) },
  trial: { status: 'trial', plan: plans.monthly, renewsOn: inDays(30), savings: 48, role: 'owner', family: [], paymentCard: demoCard, upcomingPlan: undefined, memberSince: inDays(0) },
  cancelled: { status: 'cancelled', plan: plans.monthly, renewsOn: inDays(12), savings: 312, role: 'owner', family: [], paymentCard: demoCard, upcomingPlan: undefined, memberSince: inDays(-152) },
  familyOwner: { status: 'active', plan: plans.familyMonthly, renewsOn: inDays(18), savings: 486, role: 'owner', family: demoFamily, paymentCard: demoCard, upcomingPlan: undefined, memberSince: inDays(-210) },
  familyMember: { status: 'active', plan: plans.familyMonthly, renewsOn: inDays(18), savings: 138, role: 'member', ownerName: familyOwnerName, family: [], paymentCard: undefined, upcomingPlan: undefined, memberSince: inDays(-64) },
  upcoming: { status: 'active', plan: plans.monthly, renewsOn: inDays(30), savings: 312, role: 'owner', family: [], paymentCard: demoCard, upcomingPlan: plans.annual, memberSince: inDays(-152) },
};

export const demoStateNames = Object.keys(demoStates) as DemoState[];
export function applyDemo(state: DemoState) {
  membershipActions.demo(demoStates[state] as Partial<MembershipState>);
}
/**
 * Management screens must render for a member even when opened directly: seed `state` (route param) or, when
 * the shared store has no membership yet (status 'none'), the 'active' preset.
 */
export function ensureMembership(state?: string) {
  if (state && state in demoStates) applyDemo(state as DemoState);
  else if (membershipStore.get().status === 'none') applyDemo('active');
}
