import { motion } from 'motion/react';
import { Button, HtmlText, MaskIcon } from '../../../../components';
import { useReduceMotion } from '../../../../motion/recipes';
import tick from '@assets/cart/coupon-tray/filter-tick-checked.webp';
import { trayCopy, type TrayUnlockCriteria } from '../../data.couponTray';
import { couponTrayMotion as M } from '../../tokens';
import styles from './tray.module.css';

const PROMPT = { p: { fontWeight: 500, color: 'var(--nk-palette-blue-gray700)' }, b: { fontWeight: 600, color: 'var(--nk-palette-sunset-orange)' } };

/**
 * NoonSalesCouponTrayOfferUnlockCriteria — what's missing to unlock a locked offer: the prompt (+ "Shop more") over an
 * amount progress bar or numbered unit chips (BOGO has no illustration). Orange50 background; units use #F9F9FB.
 */
export function UnlockCriteria({ criteria, showShopMore, onShopMore, disabled }: { criteria: TrayUnlockCriteria; showShopMore: boolean; onShopMore: () => void; disabled: boolean }) {
  const reduce = useReduceMotion();
  const pct = criteria.type === 'amount' && criteria.data.totalAmount > 0 ? Math.min(100, Math.max(0, (criteria.data.currentAmount / criteria.data.totalAmount) * 100)) : 0;
  return (
    <div className={styles.criteria} data-type={criteria.type}>
      <div className={styles.criteriaRow}>
        <HtmlText value={criteria.prompt} base stylesheet={PROMPT} className={styles.criteriaPrompt} />
        {showShopMore && (
          <Button variant="noonDotted" dottedColor="var(--nk-palette-blue-gray900)" className={styles.dottedAction} disabled={disabled} onClick={onShopMore}>
            {trayCopy.shopMore}
          </Button>
        )}
      </div>
      {criteria.type === 'amount' && (
        <div className={styles.criteriaBar}>
          <motion.span className={styles.criteriaBarFill} initial={{ width: reduce ? `${pct}%` : 0 }} animate={{ width: `${pct}%` }} transition={{ duration: reduce ? 0 : M.barS }} />
        </div>
      )}
      {criteria.type === 'units' && (
        <div className={styles.units}>
          {Array.from({ length: criteria.data.totalUnits }, (_, i) => {
            const added = i < criteria.data.currentUnits;
            return (
              <span key={i} className={styles.unit} data-added={added || undefined}>
                {added && <MaskIcon src={tick} size={14} color="var(--nk-palette-deep-green)" />}
                <span className={styles.unitNumber}>{i + 1}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
