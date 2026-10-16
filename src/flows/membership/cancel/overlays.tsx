import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { HtmlText } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { membershipManageActions, useMembershipManage } from '../../../kit/membership';
import { useNav } from '../../../kit/Navigator';
import { icons } from '../assets';
import { DashedLine, memberColor, VipButton } from '../components/primitives';
import { VipOverlay, type VipOverlayApi } from '../components/VipOverlay';
import { fmtDate, planById, t } from '../data';
import { membershipEvents } from '../store';
import { mb } from '../tokens';
import { buildCancelPages, changePlanReviewPage, type CancelMode, type GroupSavingsPage, type LeaveFamilyPage, type LoseAccessPage, type OfferPage, type PlanOption, type PlanOptionsPage, type ReminderPage as ReminderData, type ReviewPage, type UnusedSeatsPage } from './cancelData';
import { useBackToManage, useCancelFlow, type CancelParams } from './cancelNav';
import { useEnsureCancelState } from './CancelScreen';
import { LeaveFamilyView, ReminderPage, ReviewPageView } from './pages';
import { OverlayButtons, OverlayReminder, PlanMembers } from './parts';
import styles from './overlays.module.css';
import cancelStyles from './cancel.module.css';

const SHEET_START = 0.75 * 844; // animationArbitraryHeight = SCREEN_HEIGHT * 0.75

/** overlay → transparent VIPOverlayBottomSheet content + FeedbackView marginHorizontal 6 / r18 */
const transparent = { background: 'transparent' } as const;
const inset6 = { margin: '0 6px' };

type OverlayParams = CancelParams & { review?: 'changePlan'; planCode?: string };

/** index of `type` in the pages for this mode (owner overlays opened directly) */
function useIndexOf(params: OverlayParams, type: string) {
  const s = useMembershipManage();
  const i = buildCancelPages(s, params.mode ?? 'cancel').findIndex((p) => p.pageType === type);
  return params.index ?? (i >= 0 ? i : 0);
}

// ─────────────────────────────────────────── VIPUnusedSeatsOverlayScreen
function UnusedSeatsInner({ params, api }: { params: OverlayParams; api: VipOverlayApi }) {
  const index = useIndexOf(params, 'unused-seats');
  const flow = useCancelFlow({ mode: params.mode ?? 'cancel', index }, api);
  const data = flow.page as UnusedSeatsPage | undefined;
  if (!data || data.pageType !== 'unused-seats') return null;
  const members = [...(data.planOwner ? [data.planOwner] : []), ...data.activeMembers];
  return (
    <div className={styles.container} style={{ background: data.backgroundColor }}>
      <div className={styles.membersStart}>
        <PlanMembers members={members} size={40} overlap={10} max={data.maxNumMembers || 5} emptyBg={ref.color('border')} />
      </div>
      <div className={styles.header4}>
        <span className={styles.titleH20} style={{ color: data.titleColor ?? ref.color('textPrimary') }}>
          {data.title}
        </span>
        {data.subTitle && <HtmlText value={data.subTitle} stylesheet={{ p: { font: mb.type('mbCB13Regular'), letterSpacing: mb.space('mbLs10'), color: data.textColor ?? ref.color('textSecondary') } }} />}
      </div>
      <OverlayReminder reminder={data.reminder} />
      <OverlayButtons buttons={data.buttons} height={52} gap={4} iconSize={20} onPress={(b) => flow.handle(b.cta)} />
    </div>
  );
}
export function UnusedSeatsOverlayScreen({ params }: { params: OverlayParams }) {
  useEnsureCancelState(params.mode, params.state, 'familyOwner');
  return (
    <VipOverlay startY={SHEET_START} style={transparent} childrenStyle={inset6}>
      {(api) => <UnusedSeatsInner params={params} api={api} />}
    </VipOverlay>
  );
}

// ─────────────────────────────────────────── VIPPlanOptionOverlayScreen
function PlanOptionCard({ plan, selected, onSelect }: { plan: PlanOption; selected: boolean; onSelect: () => void }) {
  const strip = (v?: string) => (v || '').replace(/<[^>]*>/g, '').trim();
  const desc = strip(plan.description);
  const price = strip(plan.monthlyPrice);
  const savings = strip(plan.savingsAmount);
  const showPrice = !!price && !desc.includes(price);
  return (
    <motion.button type="button" className={[styles.planCard, selected ? styles.planCardSelected : ''].join(' ')} whileTap={selected ? undefined : { opacity: 0.9 }} disabled={selected} onClick={onSelect}>
      <div className={styles.planCardText}>
        <span className={[styles.planTitle, selected ? styles.planTitleSelected : ''].join(' ')}>{plan.title}</span>
        <div className={styles.metaRow}>
          {showPrice && <span className={styles.meta}>{price}</span>}
          {showPrice && !!desc && <span className={styles.meta}>•</span>}
          {!!desc && (
            <span className={styles.planDescription}>
              <HtmlText value={plan.description} stylesheet={{ p: { font: ref.type('text12MediumLh18'), letterSpacing: mb.space('mbLs10'), color: ref.color('textSecondary') } }} />
            </span>
          )}
          {!!savings && (
            <span className={styles.savings}>
              <span className={styles.savingsText}>{savings}</span>
              <motion.span className={styles.shimmer} initial={{ left: '-20%' }} animate={{ left: '120%' }} transition={{ duration: 1.2, delay: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }} />
            </span>
          )}
          {!savings && plan.tag && (
            <span className={styles.tagGradient} style={{ background: `linear-gradient(90deg, ${(plan.tag.borderColors ?? [mb.color('mbCTagBorder'), mb.color('mbCTagBorder')]).join(', ')})` }}>
              <span className={styles.tagContent} style={{ background: plan.tag.backgroundColor ?? ref.palette('kitGreen97') }}>
                <HtmlText value={plan.tag.text} stylesheet={{ p: { font: ref.type('text12RegularLh18'), color: plan.tag.textColor ?? ref.color('success') } }} />
              </span>
            </span>
          )}
        </div>
      </div>
      <span className={styles.selectionIcon}>{selected ? <img src={icons.mCheckbox} alt="" width={24} height={24} /> : <img src={icons.radioGreenUnselected} alt="" width={20} height={20} />}</span>
    </motion.button>
  );
}
function PlanOptionsInner({ params, api }: { params: OverlayParams; api: VipOverlayApi }) {
  const nav = useNav();
  const mode = params.mode ?? 'cancel';
  const index = useIndexOf(params, 'plan-options');
  const flow = useCancelFlow({ mode, index }, api);
  const data = flow.page as PlanOptionsPage | undefined;
  const [selected, setSelected] = useState(() => data?.plan?.find((p) => p.isSelected)?.planCode ?? data?.plan?.[0]?.planCode ?? '');
  const [loading, setLoading] = useState(false);
  if (!data || data.pageType !== 'plan-options') return null;
  const selectedPlan = data.plan.find((p) => p.planCode === selected);
  const hasSwitch = !!data.buttons?.some((b) => b.cta === '/change-plan');

  const startChangePlan = (p: PlanOption) => {
    // setLoading(true) while initializeQuickPayment + /payment-page run, then close and open the review sheet
    setLoading(true);
    setTimeout(() => api.close(() => nav.push('membership/cancelSheet', { mode, index, review: 'changePlan', planCode: p.planCode })), 600);
  };
  const onPress = (cta: string, planCode?: string) => {
    if (cta === '/change-plan') {
      const p = data.plan.find((x) => x.planCode === (planCode || selected)) ?? selectedPlan;
      if (p) startChangePlan(p);
      return;
    }
    if (cta === '/continue' && !hasSwitch && selectedPlan?.cta === '/change-plan') {
      startChangePlan(selectedPlan);
      return;
    }
    flow.handle(cta);
  };

  return (
    <div className={styles.container} style={{ background: data.backgroundColor }}>
      <div className={styles.header4}>
        <span className={styles.titleH20} style={{ color: data.titleColor ?? ref.color('textBody') }}>
          {data.title}
        </span>
        {data.subTitle && <HtmlText value={data.subTitle} stylesheet={{ p: { font: mb.type('mbCB13Regular'), letterSpacing: mb.space('mbLs10'), color: data.textColor ?? ref.color('textSecondary') } }} />}
      </div>
      <div className={styles.plans}>
        {data.plan.map((p) => (
          <PlanOptionCard key={p.planCode} plan={p} selected={p.planCode === selected} onSelect={() => setSelected(p.planCode)} />
        ))}
      </div>
      <div className={styles.planButtons}>
        {data.buttons?.map((b, i) => (
          <VipButton
            key={i}
            className={styles.planButton}
            loading={loading && b.cta === '/change-plan'}
            style={{ background: b.backgroundColor ?? ref.color('textStrong'), borderColor: b.borderColor ?? 'transparent', color: b.textColor, ...(data.buttons!.length === 1 ? { flex: '0 0 100%' } : null) }}
            onPress={() => onPress(b.cta, b.planCode)}
          >
            <span className={styles.planButtonText}>{b.text}</span>
          </VipButton>
        ))}
      </div>
    </div>
  );
}
export function PlanOptionsOverlayScreen({ params }: { params: OverlayParams }) {
  useEnsureCancelState(params.mode, params.state, 'familyOwner');
  return (
    <VipOverlay startY={SHEET_START} style={transparent} childrenStyle={inset6}>
      {(api) => <PlanOptionsInner params={params} api={api} />}
    </VipOverlay>
  );
}

// ─────────────────────────────────────────── VIPCancelGroupSavingsOverlayScreen
function GroupSavingsInner({ params, api }: { params: OverlayParams; api: VipOverlayApi }) {
  const index = useIndexOf(params, 'group-savings');
  const flow = useCancelFlow({ mode: params.mode ?? 'cancel', index }, api);
  const data = flow.page as GroupSavingsPage | undefined;
  if (!data || data.pageType !== 'group-savings') return null;
  const members = [{ ...data.planOwner, colorIndex: 0 }, ...data.activeMembers.map((m, i) => ({ ...m, colorIndex: i + 1 }))];
  const color = data.textColor ?? ref.color('textSecondary');
  return (
    <div className={[styles.container, styles.container14].join(' ')} style={{ background: data.backgroundColor }}>
      <div className={styles.header4}>
        <span className={[styles.titleH20, styles.titleMb4].join(' ')} style={{ color: data.titleColor ?? ref.color('textPrimary') }}>
          {data.title}
        </span>
        {data.subTitle && <HtmlText value={data.subTitle} stylesheet={{ p: { font: mb.type('mbCB13Regular'), letterSpacing: mb.space('mbLs10'), color }, b: { color }, span: { color, fontWeight: 700 } }} />}
      </div>
      <div className={styles.savingsCard}>
        <div className={styles.savingsHeader}>
          <span className={styles.membersTitle}>{data.membersTitle}</span>
          <DashedLine strokeWidth={3} strokeSpacing={5} color={ref.color('border')} />
        </div>
        {members.map((m, i) => (
          <div key={`${m.customerCode}-${m.colorIndex}`} className={[styles.memberRow, i === members.length - 1 ? styles.memberRowLast : ''].join(' ')}>
            <span className={styles.avatar} style={{ background: memberColor(m.colorIndex), fontSize: 40 / 2.2 }}>
              {m.name?.trim()?.[0]?.toUpperCase() || '?'}
            </span>
            <span className={styles.memberName}>{m.name}</span>
            {m.savingsText && <span className={styles.memberSavings}>{m.savingsText}</span>}
          </div>
        ))}
      </div>
      <OverlayReminder reminder={data.reminder} />
      <OverlayButtons buttons={data.buttons} onPress={(b) => flow.handle(b.cta)} />
    </div>
  );
}
export function GroupSavingsOverlayScreen({ params }: { params: OverlayParams }) {
  useEnsureCancelState(params.mode, params.state, 'familyOwner');
  return (
    <VipOverlay startY={SHEET_START} style={transparent} childrenStyle={inset6}>
      {(api) => <GroupSavingsInner params={params} api={api} />}
    </VipOverlay>
  );
}

// ─────────────────────────────────────────── VIPLoseAccessWarningOverlayScreen
function LoseAccessInner({ params, api }: { params: OverlayParams; api: VipOverlayApi }) {
  const index = useIndexOf(params, 'lose-access');
  const flow = useCancelFlow({ mode: params.mode ?? 'cancel', index }, api);
  const data = flow.page as LoseAccessPage | undefined;
  if (!data || data.pageType !== 'lose-access') return null;
  const cp = data.currentPlan;
  const members = [...(cp.planOwner ? [cp.planOwner] : []), ...cp.activeMembers];
  const color = data.textColor ?? ref.color('textSecondary');
  return (
    <div className={styles.container} style={{ background: data.backgroundColor }}>
      <div className={styles.header2}>
        <span className={styles.titleH20} style={{ color: data.titleColor ?? ref.color('textBody') }}>
          {data.title}
        </span>
        {data.subTitle && <HtmlText value={data.subTitle} stylesheet={{ p: { font: mb.type('mbCB13Regular'), letterSpacing: mb.space('mbLs10'), color }, b: { color }, span: { color, fontWeight: 700 } }} />}
      </div>
      <div className={styles.currentPlanCard}>
        <div className={styles.currentPlanContent}>
          {cp.headerMessage && <span className={styles.currentPlanHeader}>{cp.headerMessage}</span>}
          <span className={styles.currentPlanTitle}>{cp.title}</span>
        </div>
        {members.length > 0 && (
          <div className={styles.membersPill}>
            <PlanMembers members={members} size={32} overlap={10} max={cp.maxNumMembers || Math.max(members.length, 1)} containerBg={ref.color('bgPage')} />
          </div>
        )}
      </div>
      <OverlayButtons buttons={data.buttons} onPress={(b) => flow.handle(b.cta)} />
    </div>
  );
}
export function LoseAccessOverlayScreen({ params }: { params: OverlayParams }) {
  useEnsureCancelState(params.mode, params.state, 'familyOwner');
  return (
    <VipOverlay startY={SHEET_START} style={transparent} childrenStyle={inset6}>
      {(api) => <LoseAccessInner params={params} api={api} />}
    </VipOverlay>
  );
}

// ─────────────────────────────────────────── cancel V2 overlay pages (renderOverlayScreen): reminder / review / leave-family
function SheetInner({ params, api, forceType }: { params: OverlayParams; api: VipOverlayApi; forceType?: 'leave-family' }) {
  const s = useMembershipManage();
  const mode = params.mode ?? (forceType === 'leave-family' ? 'leave' : 'cancel');
  const backToManage = useBackToManage();
  const leaveIdx = buildCancelPages(s, mode).findIndex((p) => p.pageType === 'leave-family');
  const idx = forceType === 'leave-family' && params.index == null ? Math.max(leaveIdx, 0) : (params.index ?? 0);
  const flow = useCancelFlow({ mode, index: idx }, api);
  const handle = flow.handle;
  const [loading, setLoading] = useState(false);

  // plan-options '/change-plan' → review sheet (payment-page reviewPage), confirm → handlePayment
  const changePlan = useMemo(() => {
    if (params.review !== 'changePlan') return undefined;
    const optionsPage = flow.pages.find((p) => p.pageType === 'plan-options') as PlanOptionsPage | undefined;
    const option = optionsPage?.plan.find((p) => p.planCode === params.planCode) ?? optionsPage?.plan[0];
    return option ? { option, page: changePlanReviewPage(s, option) } : undefined;
  }, [params.review, params.planCode, flow.pages, s]);

  if (changePlan) {
    const confirm = () => {
      setLoading(true);
      setTimeout(() => {
        const plan = planById(changePlan.option.planCode);
        api.close(() => {
          if (plan) membershipManageActions.scheduleUpgrade(plan);
          membershipEvents.membershipChanged('Plan changed', `Your ${plan?.name ?? 'new'} plan starts on ${fmtDate(s.renewsOn)}`);
          backToManage(1);
        });
      }, 700);
    };
    return (
      <div className={[cancelStyles.overlayContainer, cancelStyles.reviewContainer].join(' ')}>
        <ReviewPageView data={changePlan.page} loading={loading} card={s.paymentCard} onConfirm={confirm} />
      </div>
    );
  }

  const page = flow.page;
  if (!page) return null;
  if (page.pageType === 'review-cancel-upgrade') {
    return (
      <div className={[cancelStyles.overlayContainer, cancelStyles.reviewContainer].join(' ')}>
        <ReviewPageView
          data={page as ReviewPage}
          loading={loading}
          card={s.paymentCard}
          onConfirm={() => {
            setLoading(true);
            setTimeout(() => handle('cancelUpgrade'), 700);
          }}
        />
      </div>
    );
  }
  return (
    <div className={cancelStyles.overlayContainer}>
      {page.pageType === 'reminder' && <ReminderPage data={page as ReminderData} />}
      {page.pageType === 'leave-family' && <LeaveFamilyView data={page as LeaveFamilyPage} />}
      {!!page.buttons?.length && (
        <div className={cancelStyles.overlayButtonsContainer}>
          {page.buttons.map((b, i) => (
            <VipButton key={i} className={[cancelStyles.button, cancelStyles.overlayButton].join(' ')} style={{ background: b.backgroundColor, borderColor: b.borderColor }} onPress={() => handle(b.cta)}>
              <span className={cancelStyles.buttonText} style={{ color: b.textColor }}>
                {b.text}
              </span>
            </VipButton>
          ))}
        </div>
      )}
    </div>
  );
}

export function CancelSheetScreen({ params }: { params: OverlayParams }) {
  useEnsureCancelState(params.mode, params.state, params.review === 'changePlan' ? 'familyOwner' : undefined);
  const isReview = params.review === 'changePlan' || params.mode === 'cancelUpgrade';
  // reviewCancelUpgradeSheet: marginHorizontal 16 · leave/reminder FeedbackView marginHorizontal 6
  return (
    <VipOverlay startY={SHEET_START} style={{ ...transparent, ...(isReview ? { margin: '0 16px calc(var(--nk-space-mb-overlay-float) + var(--nk-inset-bottom))' } : null) }} childrenStyle={isReview ? undefined : inset6}>
      {(api) => <SheetInner params={params} api={api} />}
    </VipOverlay>
  );
}

export function LeaveFamilyOverlayScreen({ params }: { params: OverlayParams }) {
  useEnsureCancelState('leave', params.state);
  return (
    <VipOverlay startY={SHEET_START} style={transparent} childrenStyle={inset6}>
      {(api) => <SheetInner params={{ ...params, mode: 'leave' }} api={api} forceType="leave-family" />}
    </VipOverlay>
  );
}

// ─────────────────────────────────────────── VIPConfirmOfferPlanScreen (retention offer accept)
function ConfirmOfferInner({ params, api }: { params: OverlayParams; api: VipOverlayApi }) {
  const mode: CancelMode = params.mode ?? 'cancel';
  const backToManage = useBackToManage();
  const flow = useCancelFlow({ mode, index: 0 });
  const offer = (flow.pages.find((p) => p.pageType === 'discount-offer') as OfferPage | undefined)?.timedPlanData.plan;
  const [loading, setLoading] = useState(false);
  if (!offer) return null;
  const confirm = () => {
    // createSubscription with the saved card (quick subscribe) → onSuccess → dismissModal + vipMembershipChanged
    setLoading(true);
    setTimeout(() => {
      api.close(() => {
        membershipEvents.membershipChanged('Offer applied!', `You'll pay ${offer.monthlyPrice} for your next 3 months`);
        backToManage(1);
      });
    }, 800);
  };
  return (
    <div className={styles.confirm}>
      <span className={styles.confirmHeader}>{t('vip_one_confirm_your_membership')}</span>
      <div className={styles.confirmPlan}>
        <div className={styles.confirmPlanHeader}>
          <span className={styles.confirmPlanTitle}>{offer.title}</span>
        </div>
        <div className={styles.confirmPrice}>
          <span className={styles.confirmMonthly}>{offer.monthlyPrice.replace(/<br>|<\/?b>/g, '')}</span>
          {offer.savingPct && (
            <span className={styles.confirmSavings}>
              <span>{offer.savingPct}</span>
            </span>
          )}
        </div>
        <HtmlText value={offer.description} stylesheet={{ p: { font: ref.type('body'), color: mb.color('mbCConfirmDesc') } }} />
      </div>
      <HtmlText className={cancelStyles.html} value={offer.paymentTerms} stylesheet={{ p: { font: mb.type('mbCTerms13'), color: ref.palette('noonGrey2') } }} />
      <VipButton className={styles.confirmButton} loading={loading} onPress={confirm}>
        <span className={styles.confirmButtonText}>{t('vip_one_confirm_membership')}</span>
      </VipButton>
    </div>
  );
}
export function ConfirmOfferOverlayScreen({ params }: { params: OverlayParams }) {
  useEnsureCancelState(params.mode ?? 'cancel', params.state);
  return (
    <VipOverlay startY={SHEET_START} style={transparent} childrenStyle={inset6}>
      {(api) => <ConfirmOfferInner params={params} api={api} />}
    </VipOverlay>
  );
}
