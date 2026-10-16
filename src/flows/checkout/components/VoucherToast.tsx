import confetti from '@assets/checkout/rewards-confetti.gif';
import { rewardsStore, useRewards } from '../store.rewards';
import { ProviderLogo } from './RewardsPrimitives';
import { Toast } from '../../../components';
import styles from './VoucherToast.module.css';

/** <Toast toastDuration={2000}> — fades in 500ms (linear), stays 2s, fades out 500ms */
const SHOW = 0.5;
const STAY_MS = 2000;

/**
 * NoonCheckoutScreen renderVoucherToast(): top toast (Toast styles: black 83%, r5, p8, 8px side insets,
 * top = screenTopPadding + 52) with the confetti gif bursting behind, the provider toast logo (39×26) and
 * the redeem message (14 bold white, max 80%, 3 lines). Place once inside the checkout screen (absolute).
 */
export function VoucherToast() {
  const toast = useRewards((s) => s.voucherToast);
  return (
    <Toast
      item={toast}
      duration={SHOW * 1000 + STAY_MS}
      onHide={(t) => rewardsStore.hideVoucherToast(t.id)}
      className={styles.toast}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: SHOW, ease: 'linear' }}
      role="status"
    >
      {(t) => (
        <>
          <img src={confetti} alt="" className={styles.confetti} />
          <div className={styles.row}>
            <ProviderLogo logo={t.logo} variant="toast" />
            <span className={styles.message}>{t.message}</span>
          </div>
        </>
      )}
    </Toast>
  );
}
