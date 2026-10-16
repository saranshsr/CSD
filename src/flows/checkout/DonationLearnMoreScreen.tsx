import { Button, DashedDivider, HtmlText } from '../../components';
import { useNav } from '../../kit/Navigator';
import dabsLogo from '@assets/checkout/figma/donation-dabs.webp';
import { charity, taf } from './data';
import styles from './donation.module.css';

/**
 * NoonCheckoutDonationLearnMoreOverlay (from the donation section's "Learn more"): gradient white → antiFlashWhite
 * (0 → 47.7%), px12 pt24 pb12 gap 12. Header: 88px logo + "Donate to\n{name}" 24/700 Blue-Gray/900 centred (gap 10);
 * white r12 card px12 py14 with the description (14 / 400 Blue-Gray/700) and, when there is a permit, a 4/4 dashed
 * antiFlashWhite divider + "Permit" 13/600 bluishGrey / value 14/600 Blue-Gray/900; then "Got it!" (blueGray1000,
 * min-height 52, 16/600 white) closes the sheet.
 */
export function DonationLearnMoreScreen() {
  const nav = useNav();
  return (
    <div className={styles.sheet}>
      <div className={styles.scroll}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <img className={styles.logo} src={dabsLogo} alt="" />
          </div>
          <span className={styles.title}>
            {taf.donateTo('')}
            <br />
            {charity.name}
          </span>
        </div>
        <div className={styles.card}>
          <HtmlText value={charity.longDescription} className={styles.description} />
          {charity.permit ? (
            <div className={styles.permitSection}>
              <DashedDivider color="var(--nk-palette-anti-flash-white)" inset={0} />
              <div className={styles.permit}>
                <span className={styles.permitLabel}>{taf.donationPermit}</span>
                <span className={styles.permitValue}>{charity.permit}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Button variant="noon" className={styles.gotIt} onClick={() => nav.back()}>
        {taf.donationGotIt}
      </Button>
    </div>
  );
}
