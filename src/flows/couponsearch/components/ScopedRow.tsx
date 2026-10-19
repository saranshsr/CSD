import { OriginIcon, Pressable } from '../../../components';
import { field } from '../../../foundations/tokens';
import { copy } from '../data';
import { useCoupon } from '../couponContext';
import styles from '../search.module.css';

/**
 * Auto-suggestion scoped row (team file Section 1 · Auto-suggestion): the first row of the typeahead and the empty
 * screen's pre-state. 58 high (grows when the title wraps), padding 9 / 16, gap 12: a 40 r8 success-subtle tile with
 * the 20 coupon-discount-filled icon; title B14 #1D2539, pre-state "Search within **BEAUTY10** items", typing
 * "Search for **“q”** within **BEAUTY10**" (wraps to two lines for long queries); the offer B11 #0F8857; the 16
 * chevron-right-bold in action blue. Then the 1px divider (4 above and below) and, while typing, the B12 Medium
 * "Suggestions from all of noon" label over the suggestions. No View all.
 */
export function ScopedRow({ query, onPress }: { query: string; onPress: () => void }) {
  const coupon = useCoupon();
  const q = query.trim();
  const title = q ? (
    <>
      {copy.scoped.query} <b>“{q}”</b> {copy.scoped.within} <b>{coupon.code}</b>
    </>
  ) : (
    <>
      {copy.scoped.pre} <b>{coupon.code}</b> {copy.scoped.items}
    </>
  );
  return (
    <div>
      <Pressable asDiv className={styles.sq} data-typing={!!q || undefined} scale={0.98} onClick={onPress} aria-label={q ? `${copy.scoped.query} ${q} ${copy.scoped.within} ${coupon.code}` : `${copy.scoped.pre} ${coupon.code} ${copy.scoped.items}`}>
        <span className={styles.sqTile}>
          <OriginIcon name="coupon-discount-filled" size={20} color={field.textSuccess} />
        </span>
        <span className={styles.sqCopy}>
          <span className={styles.sqTitle}>{title}</span>
          <span className={styles.sqSub}>{coupon.value}</span>
        </span>
        <OriginIcon name="chevron-right-bold" size={16} color={field.textAction} className={styles.sqChevron} />
      </Pressable>
      <div className={styles.sqDivider} />
      {q && <div className={styles.sgLabel}>{copy.allOfNoon}</div>}
    </div>
  );
}
