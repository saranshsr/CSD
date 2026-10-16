import { useEffect, useState } from 'react';
import { HtmlText, Icon, Lottie, Skeleton } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { membershipActions, noonOneJourneyActions } from '../../../kit/membership';
import inviteHeader from '@assets/vip/vip-accept-invite-header.lottie';
import inviteDuoHeader from '@assets/vip/vip-accept-invite-duo-header.lottie';
import { VIPButton } from '../components/VIPButton';
import { VIPOverlay, useVipOverlay } from '../components/VIPOverlay';
import { VIPDashedBorder, VIPMemberInitialHexagon } from '../components/offers/Primitives';
import { findPlan, toMembershipPlan } from '../data';
import { invite } from '../data.offers';
import { noononeStore, popToLanding } from '../store';
import { offersTokens as T } from '../tokens';
import styles from './AcceptInviteOverlayScreen.module.css';

type Params = { duo?: boolean; error?: boolean; share_code?: string };

const { inviteLottie: L } = T;

/** VIPAcceptInviteOverlaySkeleton */
function InviteSkeleton() {
  const hex = T.skeletonHex;
  const row = (title: number, sub: number, acc: number) => (
    <div className={styles.skRow}>
      <Skeleton width={28} height={28} radius={8} />
      <div className={styles.skCol}>
        <Skeleton width={title} height={14} />
        <Skeleton width={sub} height={12} />
      </div>
      <Skeleton width={acc} height={28} radius={14} />
    </div>
  );
  return (
    <div className={styles.skContainer}>
      <div className={styles.skHeader}>
        <div className={styles.skCluster}>
          <VIPMemberInitialHexagon initial="" width={hex} height={hex * 0.97} fill="var(--nk-color-border)" strokeWidth={1.2} style={{ position: 'absolute', top: 0, left: 18 }} />
          <VIPMemberInitialHexagon initial="" width={hex} height={hex * 0.97} fill="var(--nk-color-border)" strokeWidth={1.2} style={{ position: 'absolute', top: 0, right: 18 }} />
        </div>
      </div>
      <div className={styles.skContent}>
        <Skeleton width="62%" height={26} radius={8} style={{ marginBottom: 10 }} />
        <Skeleton width="78%" height={14} style={{ marginBottom: 24 }} />
        <div className={styles.skCard}>
          {row(140, 90, 88)}
          <span className={styles.skDivider} />
          {row(120, 100, 36)}
          <span className={styles.skDivider} />
          {row(130, 110, 28)}
        </div>
        <span className={styles.skButton} />
        <Skeleton width="72%" height={12} style={{ marginTop: 18 }} />
      </div>
    </div>
  );
}

function Content({ params, loading, setJoining }: { params: Params; loading: boolean; setJoining: (b: boolean) => void }) {
  const nav = useNav();
  const { close } = useVipOverlay();
  const [isJoining, setIsJoining] = useState(false);
  const data = params.duo ? invite.duo : invite.family;
  const plan = findPlan(data.planCode);
  const isDuo = plan.maxNumMembers === 2;
  const hex = isDuo ? L.duo : L.family;

  const showError = () => close(() => nav.push('noonone/acceptInviteError'));

  // touchpoint returned errorPopup without a plan → close + VIPAcceptInviteErrorOverlayScreen
  useEffect(() => {
    if (!loading && params.error) showError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const join = () => {
    if (isJoining) return;
    setIsJoining(true);
    setJoining(true);
    // createSubscription({ paymentMethod: 'NONE' }) with skipPayment + inviteCode
    setTimeout(() => {
      noonOneJourneyActions.subscribe(toMembershipPlan(plan), { trial: false });
      membershipActions.demo({ role: 'member' });
      noononeStore.patch({ pendingSuccess: { title: 'Welcome to noon One', subtitle: `You've joined ${data.ownerName}'s ${isDuo ? 'Duo' : 'Family'} plan` } });
      popToLanding(nav);
    }, T.apiMs);
  };

  if (loading) return <InviteSkeleton />;

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.headerAnimation}>
          <Lottie src={isDuo ? inviteDuoHeader : inviteHeader} loop style={{ width: '100%', height: '100%' }} />
          {/* hexagon sized as a fraction of the 654×412 lottie comp, centred on its slot */}
          <span
            className={styles.hexSlot}
            style={{ top: `${hex.top}%`, left: `${hex.left}%`, width: `${(hex.w / L.w) * 100}%`, height: `${(hex.h / L.h) * 100}%`, transform: 'translate(-50%, -50%)' }}
          >
            <HexFill initial={data.ownerName} />
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{data.title}</span>
        <span className={styles.subtitle}>{data.subtitle}</span>
        {/* VIPBenefitsModule hideModuleWrapper (family-plans variant) on white 80% */}
        <div className={styles.benefits}>
          {invite.benefits.map((b, i) => (
            <div key={b.title}>
              <div className={styles.benefitRow}>
                <div className={styles.benefitText}>
                  <span className={styles.benefitTitle}>{b.title}</span>
                  <span className={styles.benefitDescription}>{b.description}</span>
                </div>
                <span className={styles.benefitIcon}>
                  <Icon name={b.icon} size={22} color="var(--nk-color-success)" />
                </span>
              </div>
              {i < invite.benefits.length - 1 && <VIPDashedBorder className={styles.benefitDash} strokeWidth={2} strokeSpacing={5} color="var(--nk-color-vip-of-divider)" />}
            </div>
          ))}
        </div>
        <VIPButton className={styles.button} textClassName={styles.buttonText} title="Join Family plan for free" isLoading={isJoining} disabled={isJoining} onPress={join} />
        <div className={styles.footerNote}>
          <HtmlText value={invite.footerNote} className={styles.footerNoteText} />
        </div>
      </div>
    </div>
  );
}

/** measures its slot and draws VIPMemberInitialHexagon at that size */
function HexFill({ initial }: { initial: string }) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  return (
    <span
      ref={(el) => {
        if (el && !size && el.offsetWidth) setSize({ w: el.offsetWidth, h: el.offsetHeight });
      }}
      style={{ display: 'flex', width: '100%', height: '100%' }}
    >
      {size && <VIPMemberInitialHexagon initial={initial} width={size.w} height={size.h} />}
    </span>
  );
}

/**
 * VIPAcceptPlanInviteOverlayScreen — invitee entry (/noon-one-share-invite?share_code=, via VIPUtil.showLandingWithRedirect
 * → showAcceptInviteOverlay). Skeleton while the touchpoint loads, then the family / duo header lottie with the owner's
 * initial hexagon, benefits, "Join Family plan for free" (no payment: createSubscription paymentMethod NONE) → landing
 * success animation. `error` param → VIPAcceptInviteErrorOverlayScreen.
 */
export function AcceptInviteOverlayScreen({ params }: { params: Params }) {
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), T.inviteLoadMs);
    return () => clearTimeout(t);
  }, []);
  return (
    <VIPOverlay sheetClassName={styles.sheet} canBeClosed={!joining && !loading}>
      <Content params={params} loading={loading} setJoining={setJoining} />
    </VIPOverlay>
  );
}
