import { useEffect } from 'react';
import { Button, Skeleton } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { earnProviders, earnSection, findEarnProvider, rt } from '../data.rewards';
import { checkoutStore, useCheckout } from '../store';
import { ensureProvidersLoading, useRewards } from '../store.rewards';
import { checkoutServerColors } from '../tokens';
import { ChevronDot, InfoEditButton, ProviderLogo, RichText } from './RewardsPrimitives';
import section from './section.module.css';
import styles from './EarnCallout.module.css';

/**
 * NoonCheckoutEarnCallout (`earn` section). Not opted in: title + subtitle, mini provider logos (max 3 per row) and a
 * chevron dot → NoonCheckoutEarnOverlayScreen. Opted in: earn icon, title, phone edit pill and "Remove points".
 */
export function EarnCallout() {
  const nav = useNav();
  const earn = useCheckout((s) => s.earn);
  const loaded = useRewards((s) => s.providersLoaded);
  useEffect(() => ensureProvidersLoading(), []);

  if (!loaded) {
    return (
      <div className={`${section.section} ${styles.container}`}>
        {earn ? (
          <>
            <div className={styles.selected}>
              <Skeleton width={38} height={24} radius={0} />
              <div className={styles.selectedInfo}>
                <Skeleton width={120} height={17} radius={4} />
                <Skeleton width={150} height={15} radius={4} />
              </div>
            </div>
            <Skeleton width={80} height={14} radius={4} />
          </>
        ) : (
          <>
            <div className={styles.left}>
              <Skeleton width={120} height={17} radius={4} />
              <Skeleton width={150} height={15} radius={4} />
            </div>
            <div className={styles.right}>
              <div className={styles.providers}>
                <Skeleton width={40} height={15} radius={4} />
                <Skeleton width={40} height={15} radius={4} />
              </div>
              <Skeleton width={14} height={14} radius={20} />
            </div>
          </>
        )}
      </div>
    );
  }

  if (earn) {
    const provider = findEarnProvider(earn.providerCode);
    const color = provider?.details.genericThemeColor ?? checkoutServerColors.black;
    return (
      <div className={`${section.section} ${styles.container}`}>
        <div className={styles.left}>
          <div className={styles.selected}>
            <span className={styles.selectedIcon}>
              <ProviderLogo logo={provider?.logo ?? earnSection.icon} variant="icon" />
            </span>
            <div className={styles.selectedInfo}>
              <span className={styles.title}>{earnSection.title}</span>
              {earn.phone ? <InfoEditButton text={earn.phone} color={color} onPress={() => nav.push('checkout/provider-earn', { code: earn.providerCode, isOptIn: true })} /> : null}
            </div>
          </div>
        </div>
        <Button variant="noonGhost" className={styles.remove} onClick={() => checkoutStore.update({ earn: null })}>
          {rt.noon_provider_remove_points}
        </Button>
      </div>
    );
  }

  return (
    <button type="button" className={`${section.section} ${styles.container} ${styles.pressable}`} onClick={() => nav.push('checkout/earn')}>
      <span className={styles.left}>
        <span className={styles.title}>{earnSection.title}</span>
        <RichText value={earnSection.subtitle} className={styles.subtitle} />
      </span>
      <span className={styles.right}>
        <span className={styles.providers}>
          {earnProviders.map((p) => (
            <ProviderLogo key={p.code} logo={p.logo} variant="mini" />
          ))}
        </span>
        <ChevronDot />
      </span>
    </button>
  );
}
