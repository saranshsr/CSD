import logoBase from '@assets/cart/figma/noon-one-logo-base.svg';
import logoText from '@assets/cart/figma/noon-one-logo-text.svg';
import styles from './group.module.css';

/** Figma "Only_Logo" (6001:130) at 20×12.174 in a 20px slot: base layer + text layer at its 29.64/17.65/33.83/14.91% inset. */
export function NoonOneLogo() {
  return (
    <span className={styles.oneLogoSlot} aria-label="noon One">
      <span className={styles.oneLogo}>
        <img src={logoBase} alt="" className={styles.oneLogoBase} />
        <img src={logoText} alt="" className={styles.oneLogoText} />
      </span>
    </span>
  );
}
