import { motion } from 'motion/react';
import { Button } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { currency } from '../../../mocks/products';
import { spring } from '../../../motion/presets';
import dabsLogo from '@assets/checkout/figma/donation-dabs.webp';
import { charity, taf } from '../data';
import { checkoutStore, useCheckout } from '../store';
import { RichText } from './RewardsPrimitives';
import styles from './Donation.module.css';

const descriptionStyle = { p: { font: 'var(--nk-type-caption)', letterSpacing: -0.1, color: 'var(--nk-color-text-secondary)' } };

/**
 * Figma "All flows" Donations new (127:44334) = master NoonCheckoutDonation (sectionsOrder `donation`): 2px white
 * frame, gradient white → #EBF4FF (49°, from 50%), r16, pt10 pb16. "Donate to {name}" 16/22 Bold, 2-line
 * description 12/16 slateGray, dotted "Learn more" (→ NoonCheckoutDonationLearnMoreOverlay), 96×86 logo slot;
 * horizontal amounts (64×40 min, r10, gap 8, #EAECF0 border; selected #EBF4FF + #0F61FF border and text), note
 * 11/14 bluishGrey. Tapping an amount sets it (setDonation → reloader); tapping the selected one clears it (0).
 * Master hides the section on iOS (`Platform.OS === 'ios'`); the kit shows it as the Figma frame does.
 */
export function Donation() {
  const nav = useNav();
  const donation = useCheckout((s) => s.donation);
  const onPress = (amount: number) => checkoutStore.update({ donation: amount === donation ? 0 : amount });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.info}>
          <div className={styles.texts}>
            <span className={styles.name}>{taf.donateTo(charity.name)}</span>
            <RichText value={charity.description} stylesheet={descriptionStyle} className={styles.description} />
          </div>
          <Button variant="noonDotted" dottedColor="var(--nk-palette-primary-blue)" className={styles.learnMore} onClick={() => nav.push('checkout/donation-learn-more')}>
            {taf.learnMore}
          </Button>
        </div>
        <span className={styles.logoSlot}>
          <img className={styles.logo} src={dabsLogo} width={64} height={86} alt={charity.name} />
        </span>
      </div>
      <div className={`nk-hscroll ${styles.amounts}`} role="radiogroup" aria-label={taf.donation}>
        {charity.amounts.map((amount) => {
          const selected = amount === donation;
          const label = charity.labels[amount];
          return (
            <motion.button
              key={amount}
              type="button"
              role="radio"
              aria-checked={selected}
              className={[styles.amount, selected && styles.amountSelected, label && styles.amountLabelled].filter(Boolean).join(' ')}
              onClick={() => onPress(amount)}
              whileTap={{ scale: 0.96 }}
              transition={spring.press}
            >
              <span className={styles.amountText}>{`${currency}${amount}`}</span>
              {label && <span className={styles.amountLabel}>{label}</span>}
            </motion.button>
          );
        })}
      </div>
      <span className={styles.note}>{taf.donationNote}</span>
    </div>
  );
}
