import type { ReactNode } from 'react';
import styles from './delivery.module.css';

/** NoonCheckoutScreen/ItemContainer */
export function ItemContainer({ title, rightHeader, children, className }: { title: string; rightHeader?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={[styles.item, className].filter(Boolean).join(' ')}>
      <div className={styles.itemHeader}>
        <span className={styles.itemTitle}>{title}</span>
        {rightHeader}
      </div>
      {children}
    </div>
  );
}

/** DeliveryInstruction renderInfoIcon (20×20, #989FB3 stroke 1.5) */
export function InfoIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M9.375 9.375l.035-.017a.625.625 0 01.885.71l-.59 2.364c-.13.518.408.95.885.71l.035-.017M17.5 10a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0zM10 6.875h.006v.006H10v-.006z"
        stroke="var(--nk-color-text-tertiary)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
