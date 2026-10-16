import { icons } from '../assets';
import { CURRENCY, fmtDate, t } from '../data';

/**
 * Family-plan touchpoints. Master: VIPService.getVIPTouchpoints('familyPlans') → FamilyPlansTouchpointType,
 * ('shareInvite') → VIPShareInviteTouchpointType, member.removeMemberData → VIPRemoveFamilyMemberOverlayDataType.
 * All server-driven (no fixtures in bappzaar) — realistic UAE demo values shaped like features/vip/types.
 * Server icon/image URLs are replaced by the closest bundled VIP icons (see MAPPING.md).
 */

/** VIPFamilyPlanSheetType — review sheet opened from the sticky CTA (VIPPopupUtil.showPlanDetailDialog FAMILY_PLAN) */
export interface FamilyPlanSheet {
  title: string;
  subTitle?: string;
  text: string;
  reminder?: { title: string; description: string; iconUrl?: string };
  invoiceDetails?: { title: string; subtitle: string; value: string }[];
}

/** VIPPlanSelectPlanType (fields rendered by VIPFamilyPlansScreen Plan) */
export interface FamilyPlanOption {
  planCode: string;
  /** shared-store plan key in data.ts `plans` */
  planKey: 'duoMonthly' | 'familyMonthly';
  title: string;
  monthlyPrice: string;
  description: string;
  maxNumMembers: number;
  buttonText: string;
  isDefaultForCheckout?: boolean;
  familyPlan: FamilyPlanSheet;
}

const renewsIn = (days: number) => fmtDate(new Date(Date.now() + days * 864e5).toISOString());

const sheet = (members: number, price: number): FamilyPlanSheet => ({
  title: 'Try it free for 30 days',
  subTitle: `<p>Add up to <highlight>${members - 1} ${members - 1 === 1 ? 'member' : 'members'}</highlight> to your plan at no extra cost for 30 days</p>`,
  text: `<p>Your plan switches today and is free for 30 days. After that, you'll be charged <b>${CURRENCY} ${price}/month</b> from ${renewsIn(30)}. Cancel anytime from Manage membership. <a href="https://www.noon.com/uae-en/noon-one-terms">Terms & Conditions</a> apply.</p>`,
  reminder: { title: 'Reminder', description: t('vip_reminder_description'), iconUrl: icons.reminderBell },
  invoiceDetails: [
    { title: `<p>${members === 2 ? 'Duo' : 'Family'} plan</p>`, subtitle: `<p>${t('vip_plan_members', { count: members })} · monthly</p>`, value: `<p><highlight>FREE</highlight></p>` },
    { title: '<p>After 30 days</p>', subtitle: `<p>Starting ${renewsIn(30)}</p>`, value: `<p>${CURRENCY} ${price}.00</p>` },
  ],
});

export const familyPlansTouchpoint = {
  plans: [
    {
      planCode: 'ONE_DUO_MONTHLY',
      planKey: 'duoMonthly',
      title: 'Duo',
      monthlyPrice: `<p>${CURRENCY} 35/month</p>`,
      description: `<p>Just <b>${CURRENCY} 10</b> more than your plan</p>`,
      maxNumMembers: 2,
      buttonText: t('vip_upgrade_for_free'),
      familyPlan: sheet(2, 35),
    },
    {
      planCode: 'ONE_FAMILY_MONTHLY',
      planKey: 'familyMonthly',
      title: t('vip_family'),
      monthlyPrice: `<p>${CURRENCY} 45/month</p>`,
      description: `<p>Just <b>${CURRENCY} 20</b> more than your plan</p>`,
      maxNumMembers: 5,
      buttonText: t('vip_upgrade_for_free'),
      isDefaultForCheckout: true,
      familyPlan: sheet(5, 45),
    },
  ] as FamilyPlanOption[],
  benefitsSection: {
    headerIcon: icons.gift,
    headerText: 'What everyone gets',
    benefits: [
      { title: 'Free delivery for everyone', description: 'Each member gets free delivery on noon, Minutes & Food — on their own account.', iconUrl: icons.checkWavy },
      { title: 'Separate accounts, shared plan', description: 'Members keep their own orders, addresses and payment cards private.', iconUrl: icons.userGroup },
      { title: 'One simple bill', description: 'Only you get charged. Members join for free with your invite.', iconUrl: icons.percentBadge },
    ],
  },
  stepsSection: {
    headerIcon: icons.switches,
    headerText: 'How it works',
    steps: [
      { title: 'Choose Duo or Family', description: 'Pick the plan that fits your household. Your benefits stay active.' },
      { title: 'Share your invite', description: 'Send the invite link on WhatsApp or any app — members accept in the noon app.' },
      { title: 'Everyone saves', description: 'Members get noon One benefits as soon as they join your plan.' },
    ],
  },
  faqSection: {
    headerIcon: icons.clipboardDocument,
    headerText: t('vip_frequently_asked_questions'),
    rows: [
      { header: 'Who can I add to my plan?', body: 'Anyone with a noon account in the UAE who is not already a paying noon One member.' },
      { header: 'Will members see my orders?', body: 'No. Every member keeps their own account, orders, addresses and payment methods private.' },
      { header: 'Can I remove a member later?', body: 'Yes. Go to Manage membership → Family members and tap Remove. They lose access immediately.' },
      { header: 'What happens if I cancel?', body: 'All members lose noon One benefits at the end of your current billing period.' },
    ],
  },
  shareSection: {
    headerIcon: icons.share,
    headerText: 'Share with your family',
    text: '<p>Invite your family and start saving together on every order</p>',
    iconUrl: icons.gift,
    button: { cta: '/share', text: t('vip_share'), iconBeforeTextUrl: icons.share },
    share: shareMessage(),
  },
  footerNote: '<p>Prices include VAT. Members must have a noon account registered in the UAE. Plan terms & conditions apply.</p>',
};

function shareMessage() {
  return {
    title: 'Join my noon One Family plan',
    subject: 'Join my noon One Family plan',
    message: "I've added you to my noon One plan — free delivery on noon, Minutes & Food. Accept the invite here:",
    url: 'https://www.noon.com/uae-en/noon-one-invite?code=AD7K29',
  };
}

/** VIPShareInviteTouchpointType — `title` highlights the seat copy */
export const shareInviteTouchpoint = (seatsLeft: number) => ({
  title: seatsLeft > 0 ? `<p>You can add <highlight>${seatsLeft} more</highlight> ${seatsLeft === 1 ? 'member' : 'members'} to your plan</p>` : '<p>Invite <highlight>someone</highlight> to your plan</p>',
  benefits: [
    { iconUrl: icons.checkWavy, text: 'Free delivery on every order' },
    { iconUrl: icons.userGroup, text: 'Separate accounts for everyone' },
    { iconUrl: icons.gift, text: 'Members join for free' },
  ],
  share: shareMessage(),
  button: { cta: '/share', text: t('vip_share'), iconBeforeTextUrl: icons.whatsappWhite },
});

/** invited contacts used when the share sheet completes (kit stand-in for the person accepting the invite) */
export const inviteContacts = [
  { name: 'Maya Debnath', phone: '+971 52 734 9021' },
  { name: 'Arjun Mehta', phone: '+971 56 118 4402' },
  { name: 'Noor Al Hashimi', phone: '+971 50 903 2217' },
  { name: 'Leila Haddad', phone: '+971 55 640 8813' },
];

/** VIPRemoveFamilyMemberOverlayDataType */
export const removeMemberData = (name: string) => ({
  title: t('vip_remove_member_title', { name: name.split(' ')[0] }),
  description: t('vip_remove_member_description'),
  buttons: [
    { cta: '/dismiss', text: t('vip_common_cancel') },
    { cta: '/remove-member', text: t('vip_remove') },
  ],
});

/** FamilyPlansErrorType — server blocking error when the user can't buy a family plan (already on one / a member) */
export const familyPlansError = (kind: 'owner' | 'member', owner?: string) => ({
  title: kind === 'owner' ? "You're already on a Family plan" : `You're part of ${owner}'s Family plan`,
  description: kind === 'owner' ? 'Add or remove members anytime from your membership page.' : 'Only the plan owner can change the plan or invite members.',
  button: { cta: '/noon-one-manage-membership', text: t('vip_manage_membership') },
});
