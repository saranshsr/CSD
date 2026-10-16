import { motion } from 'motion/react';
import { icons } from '../assets';
import { t } from '../data';
import type { UpgradePlan } from '../manageData';
import { DashedLine, MemberAvatar } from './primitives';
import styles from './FamilyMembersSection.module.css';

const DEFAULT_FAMILY_MAX_MEMBERS = 5;
type Member = NonNullable<UpgradePlan['activeMembers']>[number];

/**
 * ManageFamilyMembersSection (features/vip/components) — owner + members rows (40px colour avatars), red "Remove"
 * when isRemoveCtaVisible, and "Add another member" while seats remain (max − 1 − members).
 */
export function FamilyMembersSection({
  ownerName,
  members,
  section,
  maxNumMembers,
  isRemoveCtaVisible,
  onRemoveMember,
  onAddMember,
}: {
  ownerName: string;
  members: Member[];
  section?: { title: string; subtitle?: string; ownerSavingsText?: string };
  maxNumMembers?: number;
  isRemoveCtaVisible?: boolean;
  onRemoveMember?: (m: Member) => void;
  onAddMember?: () => void;
}) {
  const parsedMax = Number(maxNumMembers);
  const maxMembers = Number.isFinite(parsedMax) && parsedMax > 1 ? parsedMax : DEFAULT_FAMILY_MAX_MEMBERS;
  const availableSeats = Math.max(maxMembers - 1 - (members?.length || 0), 0);
  const { title, subtitle, ownerSavingsText } = section ?? {};

  const row = (name: string, sub: string | undefined, colorIndex: number, member?: Member) => (
    <div key={`${name}-${colorIndex}`} className={styles.memberRow}>
      <MemberAvatar name={name} index={colorIndex} />
      <div className={styles.memberContent}>
        <span className={styles.memberName}>{name}</span>
        {sub && <span className={styles.memberSubtitle}>{sub}</span>}
      </div>
      {member && isRemoveCtaVisible && (
        <motion.button type="button" className={styles.remove} whileTap={{ opacity: 0.7 }} onClick={() => onRemoveMember?.(member)}>
          {t('vip_remove')}
        </motion.button>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      <DashedLine />
      {row(ownerName, ownerSavingsText ? `${t('vip_owner')} • ${ownerSavingsText}` : t('vip_owner'), 0)}
      {members.map((m, i) => row(m.name, m.savingsText, i + 1, m))}
      {availableSeats > 0 && (
        <motion.button type="button" className={styles.addRow} whileTap={{ opacity: 0.7 }} onClick={onAddMember}>
          <span className={styles.addAvatar}>
            <img src={icons.systemPlus} width={20} height={20} alt="" />
          </span>
          <span className={styles.memberContent}>
            <span className={styles.memberName}>{t('vip_add_another_member')}</span>
            <span className={styles.memberSubtitle}>{t('vip_more_seats_available', { count: availableSeats })}</span>
          </span>
        </motion.button>
      )}
    </div>
  );
}
