import { useNav } from '../../kit/Navigator';
import { ProviderCallout } from './components/RewardsPrimitives';
import { earnProviders, earnSection } from './data.rewards';
import styles from './rewardsSheets.module.css';

/**
 * NoonCheckoutEarnOverlayScreen — sticky header with the earn description (16/700), expanded provider callouts
 * and the terms (12, secondaryTextColor). A provider opens NoonProviderEarnOverlayScreen.
 */
export function EarnOverlayScreen() {
  const nav = useNav();
  return (
    <div className={styles.scroll}>
      <div className={styles.earnHeader}>
        <span className={styles.earnTitle}>{earnSection.description}</span>
      </div>
      <div className={styles.earnContent}>
        <div className={styles.earnProviders}>
          {earnProviders.map((p) => (
            <ProviderCallout key={p.code} provider={p} isExpanded onPress={() => nav.push('checkout/provider-earn', { code: p.code, closeParent: true })} />
          ))}
        </div>
        <div className={styles.terms}>
          {earnSection.terms.map((term) => (
            <p key={term} className={styles.term}>
              {term}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
