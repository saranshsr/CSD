import { motion, useMotionValue, useTransform } from 'motion/react';
import { useLayoutEffect, useState } from 'react';
import { Screen, Spinner } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { membershipStore } from '../../../kit/membership';
import { useNav } from '../../../kit/Navigator';
import { icons } from '../assets';
import { VipBackButton, VipButton } from '../components/primitives';
import { applyDemo, isFamilyPlan } from '../data';
import { useEnsureMembership } from '../store';
import { mb } from '../tokens';
import { cancelReasons, type CancelMode, type CancelReason, type OfferPage, type SurveyPage as SurveyData } from './cancelData';
import { useCancelFlow, type CancelParams } from './cancelNav';
import { BenefitsPage, DiscountOfferPage, SurveyPage } from './pages';
import styles from './cancel.module.css';

/** Seed a store state that matches the entry mode when a cancel route is opened directly. */
export function useEnsureCancelState(mode: CancelMode | undefined, state?: string, need?: 'familyOwner') {
  useEnsureMembership(state);
  useLayoutEffect(() => {
    if (state) return;
    const s = membershipStore.get() as ReturnType<typeof membershipStore.get> & { upcomingPlan?: unknown };
    if (mode === 'leave' && s.role !== 'member') applyDemo('familyMember');
    else if (mode === 'cancelUpgrade' && !s.upcomingPlan) applyDemo('upcoming');
    else if (need === 'familyOwner' && (!isFamilyPlan(s.plan) || s.role === 'member')) applyDemo('familyOwner');
    else if (mode === 'cancel' && s.status === 'cancelled') applyDemo('active');
  }, [mode, state, need]);
}

/**
 * VIPCancelMembershipV2Screen — full-screen pages (benefits / discount-offer / survey). LinearGradient
 * #FFFFFF → #F4F3F3 (0 → 40%) over #F9F9F9; absolute header (statusBar + 52) whose white shadow2 background fades
 * 0 → 1 over the first 60px of scroll; back button at statusBar + 4 / 14; content paddingTop statusBar + 72;
 * sticky white buttons container (r12 top, shadow3).
 */
export function CancelScreen({ params }: { params: CancelParams }) {
  const mode = params.mode ?? 'cancel';
  useEnsureCancelState(mode, params.state);
  const nav = useNav();
  const flow = useCancelFlow({ mode, index: params.index ?? 0 });
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [comment, setComment] = useState('');
  const scrollY = useMotionValue(0);
  const headerOpacity = useTransform(scrollY, [0, 60], [0, 1]);
  const page = flow.page;

  const renderPage = () => {
    if (!page) return null;
    switch (page.pageType) {
      case 'benefits':
        return <BenefitsPage data={page} onCta={flow.handle} />;
      case 'survey':
        return (
          <SurveyPage
            data={page as SurveyData}
            reasons={cancelReasons}
            onChange={(r, c) => {
              setReason(r);
              setComment(c);
            }}
          />
        );
      case 'discount-offer':
        return <DiscountOfferPage data={page as OfferPage} />;
      default:
        return null;
    }
  };

  const onPress = (cta: string) => {
    if (cta === '/accept-offer') {
      nav.push('membership/confirmOffer', { mode, index: flow.index });
      return;
    }
    flow.handle(cta);
  };

  const buttons = page?.buttons ?? [];
  const offerCallout = page?.pageType === 'discount-offer' ? (page as OfferPage).offerCallout : undefined;
  const footer = buttons.length ? (
    <div className={styles.buttonsContainer}>
      {offerCallout && (
        <div className={styles.offerCallout}>
          <img src={icons.oneGreenCheck} alt="" />
          <span>{offerCallout}</span>
        </div>
      )}
      {buttons.map((b, i) => {
        const disabled = page?.pageType === 'survey' && (b.cta === '/continue' || b.cta === '/cancel-membership') && (!reason || (!!reason.isCommentRequired && !comment));
        return (
          <VipButton
            key={i}
            className={styles.button}
            style={{ background: b.backgroundColor, borderColor: b.borderColor }}
            disabled={disabled}
            onPress={() => onPress(b.cta)}
          >
            <span className={[styles.buttonText, disabled ? styles.buttonTextDisabled : ''].join(' ')} style={{ color: b.textColor }}>
              {b.text}
            </span>
          </VipButton>
        );
      })}
    </div>
  ) : undefined;

  return (
    <Screen
      background={`linear-gradient(180deg, ${ref.color('bgSurface')} 0%, ${mb.color('mbCancelGradTo')} 40%), ${mb.color('mbCancelBg')}`}
      overlayHeader
      safeTop={false}
      onScroll={(y) => scrollY.set(y)}
      contentStyle={{ paddingTop: `calc(var(--nk-inset-top) + 72px)`, paddingBottom: 'var(--nk-inset-bottom)' }}
      header={
        <div className={styles.headerWrapper}>
          <motion.div className={styles.headerBg} style={{ opacity: headerOpacity }} />
          <VipBackButton className={styles.backButton} onPress={nav.back} />
        </div>
      }
      footer={footer}
    >
      {renderPage()}
      {flow.loading && (
        <div className={styles.loadingCover}>
          <Spinner size={32} color={ref.color('textPrimary')} />
        </div>
      )}
    </Screen>
  );
}
