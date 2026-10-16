import { coupon, copy } from '../data';
import styles from '../listing.module.css';

/**
 * BEAUTY10 hero at the top of the eligible-items PLP, in the band's language (the same green with the halftone
 * pattern pinned to the top, the same white code tag), so the search band reads as its continuation.
 */
export function CouponHero() {
  return (
    <section className={styles.hero} aria-label={coupon.title}>
      <span className={styles.heroTitle}>{copy.hero.title}</span>
      <span className={styles.heroBody}>{copy.hero.body}</span>
      <span className={styles.heroUse}>
        {copy.hero.use} <span className={styles.codeTag}>{coupon.code}</span>
      </span>
    </section>
  );
}
