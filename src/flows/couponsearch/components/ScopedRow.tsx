import { OriginIcon, Pressable } from '../../../components';
import { coupon, copy } from '../data';
import styles from '../search.module.css';

/**
 * Auto-suggestion, team file "Flow B · Scoped row + View all": the first row of the typeahead (also on the empty
 * screen). 58 high, padding 9 / 16, gap 12; a 40 r8 tile with a 20 search icon; "Searching within **eligible items**"
 * 14/20 over "**BEAUTY10** · extra 10% off" 11 (code semibold green); "View all ›" 13 semibold action blue; then a 1px
 * divider inset 16 with 4 above and below. The whole row and View all do the same thing.
 */
export function ScopedRow({ onPress }: { onPress: () => void }) {
  return (
    <div>
      <Pressable asDiv className={styles.sq} scale={0.98} onClick={onPress} aria-label={copy.scoped.label}>
        <span className={styles.sqTile}>
          <OriginIcon name="search" size={20} />
        </span>
        <span className={styles.sqCopy}>
          <span className={styles.sqTitle}>
            {copy.scoped.lead} <b>{copy.scoped.strong}</b>
          </span>
          <span className={styles.sqSub}>
            <b>{coupon.code}</b> · {coupon.short}
          </span>
        </span>
        <span className={styles.sqLink}>
          {copy.scoped.viewAll}
          <OriginIcon name="chevron-right" size={12} color="var(--nk-color-primary)" />
        </span>
      </Pressable>
      <div className={styles.sqDivider} />
    </div>
  );
}
