import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { openProviderBurn } from './components/BurnSection';
import { ProviderCallout } from './components/RewardsPrimitives';
import { rt, topUpBurn, voucherProviders } from './data.rewards';
import styles from './rewardsSheets.module.css';

/**
 * NoonCheckoutBurnProvidersListOverlayScreen — "Financing Options": sticky header (18/700) and the expanded
 * voucher provider callouts (45px logo, title, description, chevron). Tapping one opens the provider burn overlay.
 */
export interface BurnProvidersParams {
  /** 'topup' → the "All flows" Points & Vouchers voucher callout providers (topUpBurn.voucher) */
  list?: 'topup';
}

export function BurnProvidersScreen({ params }: ScreenProps<BurnProvidersParams>) {
  const nav = useNav();
  const providers = params?.list === 'topup' ? topUpBurn.voucher.providers : voucherProviders;
  return (
    <div className={styles.scroll}>
      <div className={styles.listHeader}>
        <span className={styles.listTitle}>{rt.noon_provider_financing_options}</span>
      </div>
      <div className={styles.listContent}>
        {providers.map((p) => (
          <ProviderCallout key={p.code} provider={p} isExpanded onPress={() => openProviderBurn(nav, p, true)} />
        ))}
      </div>
    </div>
  );
}
