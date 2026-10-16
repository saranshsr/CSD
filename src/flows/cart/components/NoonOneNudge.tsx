import { useIsNoonOneMember } from '../../../kit/membership';
import { useNav } from '../../../kit/Navigator';
import { t } from '../data';
import { NoonOneLogo } from './NoonOneLogo';
import styles from './group.module.css';

/**
 * Figma "Stacks / One callout" (7828:44189): 40px row, p12, gap 8, top border #F2F3F7 — 20px noon One logo,
 * "Save with noon One." 12/16 500 · "Try it now for" 12/16 400 (#343D54) · "Free" 12/14 600 Emerald/700.
 * Hidden for members; opens the noon One landing.
 */
export function NoonOneNudge({ className }: { className?: string }) {
  const nav = useNav();
  const member = useIsNoonOneMember();
  if (member) return null;
  return (
    <button
      type="button"
      className={`${className ?? ''} ${styles.nudge}`}
      onClick={(e) => {
        e.stopPropagation();
        nav.push('noonone/landing', { source: '/cart' });
      }}
    >
      <NoonOneLogo />
      <span className={styles.nudgeText}>
        <span className={styles.nudgeLead}>{t.noonOneLead}</span>
        <span>{t.noonOneBody}</span>
        <span className={styles.nudgeCta}>{t.noonOneCta}</span>
      </span>
    </button>
  );
}
