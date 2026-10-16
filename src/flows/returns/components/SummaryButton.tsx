import type { ReactNode } from 'react';
import { icons } from '../assets';
import { Svg, Tap } from './AFSButton';
import styles from '../details.module.css';

/** AFSReturnsItemDetailsSummaryButton — 24px icon, 14/600/20 title, 12/400/18 subtitle, 14px bold chevron in a #FCFCFD ring */
export function SummaryButton({ title, subtitle, icon, onPress }: { title: string; subtitle?: ReactNode; icon?: string; onPress: () => void }) {
  return (
    <Tap className={styles.summaryButton} onPress={onPress}>
      <span className={styles.summaryContent}>
        {icon && (
          <span className={styles.summaryIcon}>
            <Svg src={icon} size={24} />
          </span>
        )}
        <span className={styles.summaryText}>
          <span className={styles.summaryTitle}>{title}</span>
          {subtitle && <span className={styles.summarySubtitle}>{subtitle}</span>}
        </span>
      </span>
      <span className={styles.summaryChevron}>
        <Svg src={icons.chevronRightBold} size={14} flipRtl />
      </span>
    </Tap>
  );
}
