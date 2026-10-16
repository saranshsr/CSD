import { useState } from 'react';
import { membershipActions, useMembershipManage } from '../../../kit/membership';
import { VipOverlay } from '../components/VipOverlay';
import { MemberHexagon, VipButton } from '../components/primitives';
import { membershipEvents } from '../store';
import { removeMemberData } from './familyData';
import { useEnsureFamilyOwner } from './SharePlanInviteScreen';
import styles from './family.module.css';

const DISMISS = new Set(['dismiss', '/dismiss', 'cancel', '/cancel']);
const REMOVE = new Set(['removeFamilyMember', '/remove-member', '/removeFamilyMember']);

/**
 * VIPRemoveFamilyMemberOverlayScreen — VIPOverlayBottomSheet (transparent sheet, card inset 6 / radius 16), header icon
 * (server headerIconUrl → member initial hexagon), title h18 bold blueGrey, description b14 medium, Cancel (outline) +
 * Remove (error red, Loader while VIPService.cancelSubscription({ memberCustomerCode }) runs). Success closes the
 * sheet, then vipMembershipChanged refreshes manage.
 */
export function RemoveMemberOverlay({ params }: { params: { memberId?: string } }) {
  useEnsureFamilyOwner();
  const m = useMembershipManage();
  const member = m.family.find((f) => f.id === params.memberId) ?? m.family[0];
  const [loading, setLoading] = useState(false);
  const data = removeMemberData(member?.name ?? 'Member');

  return (
    <VipOverlay className={styles.removeSheet} canBeClosed={!loading} startY={630}>
      {({ close }) => {
        const remove = () => {
          if (loading || !member) return;
          setLoading(true);
          window.setTimeout(() => {
            setLoading(false);
            close(() => {
              membershipActions.removeMember(member.id);
              membershipEvents.notify(`${member.name.split(' ')[0]} removed from your plan`);
            });
          }, 900);
        };
        return (
          <div className={styles.removeCard}>
            <div className={styles.removeContent}>
              <span className={styles.removeIcon}>
                <MemberHexagon initial={member?.name ?? '?'} width={56} height={54} />
              </span>
              <div className={styles.removeTitleBox}>
                <span className={styles.removeTitle}>{data.title}</span>
                <span className={styles.removeDescription}>{data.description}</span>
              </div>
            </div>
            <div className={styles.removeButtons}>
              {data.buttons.map((b) => {
                const isRemove = REMOVE.has(b.cta);
                return (
                  <VipButton
                    key={b.cta}
                    className={isRemove ? styles.removeButton : styles.cancelButton}
                    disabled={loading}
                    loading={isRemove && loading}
                    onPress={() => (isRemove ? remove() : DISMISS.has(b.cta) ? close() : close())}
                  >
                    {b.text}
                  </VipButton>
                );
              })}
            </div>
          </div>
        );
      }}
    </VipOverlay>
  );
}
