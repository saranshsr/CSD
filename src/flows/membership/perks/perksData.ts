import { ref } from '../../../foundations/tokens';
import { CURRENCY, plans } from '../data';
import { mb } from '../tokens';

/**
 * Perks demo data. All SERVER-DRIVEN on master — bappzaar has no fixtures, so these are realistic UAE values shaped
 * like the touchpoints:
 *   referrals        — VIPService.getVIPTouchpoints('referrals')                  (VIPReferralsScreen)
 *   referralsOverlay — getVIPTouchpoints('referralsOverlay,bankOffers')           (ReferralsOverlayTouchpointType)
 *   verifyReferral   — VIPService.verifyReferralCode(code) → { isValid, message, info }
 *   partnerPopup     — VIPPartnerPopupType (misc.cobrandPartnerPopup / landing partnerPopup)
 * Server colours are mapped to kit / flow tokens.
 */

export interface ReferralStat {
  title: string;
  key: 'referredCount' | 'totalDaysEarned';
  iconUrl: string;
  borderColor: string;
  backgroundColor: string;
}

export const referrals = {
  title: 'Give 1 month free, get 1 month free',
  /** headerImageUrl is a CMS banner (headerImageRatio = height % of width). Rendered as a token-coloured placeholder. */
  headerImageRatio: 50,
  stats: {
    rows: [
      [
        { title: 'Friends joined', key: 'referredCount', iconUrl: 'userGroup', borderColor: ref.color('cta'), backgroundColor: ref.palette('fadedBlue') },
        { title: 'Free days earned', key: 'totalDaysEarned', iconUrl: 'gift', borderColor: ref.color('successStrong'), backgroundColor: mb.color('mbRefStatGreenBg') },
      ] as ReferralStat[],
    ],
  },
  dynamicData: { referredCount: 3, totalDaysEarned: 90 },
  referralCode: 'ANKIT25',
  referralCodeCopyText: 'Copy code',
  referralCodeCopiedText: 'Code copied',
  referralMessage: `Get 1 month of noon One free — free delivery on noon, Minutes & Food. Use my code ANKIT25 when you join:`,
  buttons: [
    { cta: '/whatsapp', text: 'Invite', color: ref.palette('greenColor'), borderColor: ref.palette('greenColor'), textColor: ref.palette('white') },
    { cta: '/share', text: 'More options', color: ref.palette('white'), borderColor: ref.color('borderStrong'), textColor: ref.color('textLegacy') },
  ],
  /** CMS modules below the stats (server `cms.data`) — demo "how it works" steps */
  howItWorks: {
    title: 'How it works',
    steps: [
      { title: 'Share your code', text: 'Send your code to friends who are new to noon One.' },
      { title: 'Your friend joins', text: 'They get their first month free when they subscribe with your code.' },
      { title: 'You both save', text: 'You get 30 free days added to your membership for every friend who joins.' },
    ],
  },
};

export const referralLink = (code: string) => `https://www.noon.com/noon-one?referral=${code}`;

export const referralsOverlay = {
  header: 'Have a referral code?',
  subTitle: 'Enter your friend’s code to get your first month free',
  benefitsMessage: '1 month free',
  button: { cta: '/continue', text: 'Continue', color: ref.color('bgInverse'), borderColor: ref.color('bgInverse'), textColor: ref.palette('white') },
};

/** bankOffers.offers (VIPBankOfferType) */
export const bankOffers = [
  {
    planCode: 'ONE_ENBD_ANNUAL',
    imgUrl: '',
    imgTitle: 'Emirates NBD × noon One',
    imgSubtitle: '1 year free for noon Credit Card holders',
    description: '<p>Get 1 year of noon One free with your Emirates NBD noon Credit Card. <a href="#">Learn more</a></p>',
    activeButtonText: 'Subscribe with card',
    disabledButtonText: 'Already subscribed',
    buttonText: 'Join with Emirates NBD card',
    learnMore: [
      'Offer valid for Emirates NBD noon Credit Card holders in the UAE.',
      'Your card is charged  0 for the first 12 months; the plan renews at  250/year unless cancelled.',
      'One free year per card holder. noon may change or withdraw the offer at any time.',
    ],
  },
  {
    planCode: 'ONE_FAB_MONTHLY',
    imgUrl: '',
    imgTitle: 'FAB × noon One',
    imgSubtitle: '3 months free with FAB cards',
    description: '<p>Get 3 months of noon One free with any FAB credit card. <a href="#">Learn more</a></p>',
    activeButtonText: 'Subscribe with card',
    disabledButtonText: 'Already subscribed',
    buttonText: 'Join with FAB card',
    learnMore: ['Valid on FAB credit cards issued in the UAE.', 'After 3 months the plan renews at  25/month unless cancelled.'],
  },
];

/** VIPService.verifyReferralCode demo: friend codes are valid, the member's own / unknown codes are not. */
export function verifyReferralCode(code: string): { isValid: boolean; message: string; info?: string } {
  const c = code.trim().toUpperCase();
  if (c === referrals.referralCode) return { isValid: false, message: 'You can’t use your own referral code' };
  if (/^[A-Z]{3,}\d{2}$/.test(c)) return { isValid: true, message: 'Code applied! You’ll get your first month free', info: 'Your free month starts when your current billing period ends.' };
  return { isValid: false, message: 'This code is invalid or has expired' };
}

/** VIPPartnerPopupType — co-brand partner popup */
export const partnerPopup = {
  partner: 'Emirates NBD',
  bannerTitle: 'noon One free for 1 year',
  bannerSubtitle: 'Exclusive for Emirates NBD noon Credit Card holders',
  bannerNote: `Worth ${CURRENCY} 250`,
  plan: { ...plans.annual, id: 'ONE_ENBD_ANNUAL', buttonText: 'Join for <s> 250</s>  0', isSubscribed: false },
  buttons: [
    { cta: '/create', text: 'Join for <s> 250</s>  0' },
    { cta: '/plan-select', text: 'View all plans', color: ref.palette('white'), borderColor: ref.color('border'), textColor: ref.color('textInk') },
  ],
};
