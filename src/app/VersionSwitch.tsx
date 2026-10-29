import { motion } from 'motion/react';
import { appleSpring } from '../motion/presets';
import { csVariants, type CsVariant } from '../flows/couponsearch/store';
import styles from './VersionSwitch.module.css';

const thumb = appleSpring(0.42, 0.9);

/**
 * The coupon-search version switch, above the phone on the page (never inside the screen):
 * Context band | Eligible row | Auto-suggestion (Band / Row / Auto on narrow widths). The thumb slides on a spring.
 * The last item, Spec Sheet, opens the animation spec at /spec/.
 */
export function VersionSwitch({ value, onChange }: { value: CsVariant; onChange: (v: CsVariant) => void }) {
  return (
    <div className={styles.bar}>
      <div className={styles.switch}>
        <div className={styles.tabs} role="tablist" aria-label="Version">
          {csVariants.map((v) => {
            const on = v.id === value;
            return (
              <button key={v.id} type="button" role="tab" aria-selected={on} data-version={v.id} className={styles.opt} data-on={on || undefined} onClick={() => onChange(v.id)}>
                {on && <motion.span className={styles.thumb} layoutId="cs-version-thumb" transition={thumb} />}
                <span className={styles.label}>
                  <span className={styles.full}>{v.label}</span>
                  <span className={styles.short}>{v.short}</span>
                </span>
              </button>
            );
          })}
        </div>
        <i className={styles.sep} aria-hidden />
        {/* the animation spec sheet (public/spec/index.html), served at /spec/ */}
        <a href="/spec/" className={`${styles.opt} ${styles.specLink}`} aria-label="Spec Sheet: animation spec for the Eligible row toggle">
          <span className={styles.label}>
            <span className={styles.full}>Spec Sheet</span>
            <span className={styles.short}>Spec</span>
          </span>
        </a>
      </div>
    </div>
  );
}
