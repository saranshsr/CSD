import type { CSSProperties } from 'react';
import styles from './Glass.module.css';

/** CSS-module class of the shared Liquid Glass material (compose it in CSS: `composes: glass from '…/Glass/Glass.module.css'`). */
export const glassClass = styles.glass;

/**
 * GlassFade — the layer under floating glass containers (tab bar, PDP sticky card, glass footer): a progressive blur
 * (four masked backdrop blurs, 1 → 8px, stronger towards the bottom) under a transparent → white gradient, so the content
 * scrolling under the glass blends into it. Absolutely positioned at the bottom of its (positioned) parent; size it with
 * `style` (`top` / `height`). Purely visual; taps go through. A screen whose sticky footer brings its own fade
 * (`data-glass-footer`) hides the tab bar's.
 */
export function GlassFade({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={[styles.fade, className].filter(Boolean).join(' ')} style={style} data-glass-fade="" aria-hidden>
      <span className={styles.layer} />
      <span className={styles.layer} />
      <span className={styles.layer} />
      <span className={styles.layer} />
    </div>
  );
}
