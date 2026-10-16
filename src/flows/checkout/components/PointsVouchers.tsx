import { useEffect } from 'react';
import { Skeleton } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import chevronIcon from '@assets/checkout/figma/points-chevron.svg';
import mokafaaLogo from '@assets/checkout/figma/provider-mokafaa-wide.svg';
import qitafLogo from '@assets/checkout/figma/provider-qitaf.svg';
import tamamLogo from '@assets/checkout/figma/provider-tamam-mini.svg';
import emkanLogo from '@assets/checkout/figma/provider-emkan-mini.svg';
import quaraLogo from '@assets/checkout/figma/provider-quara-mini.svg';
import { topUpBurn, type BurnProvider } from '../data.rewards';
import { ensureProvidersLoading, useRewards } from '../store.rewards';
import { openProviderBurn } from './BurnSection';
import { ProviderLogo, RichText } from './RewardsPrimitives';
import styles from './PointsVouchers.module.css';

/** icons.checkout — Figma "Redemption Programs images ATOM" exports for the two loyalty callouts */
const checkoutLogos: Record<string, { src: string; w: number; h: number }> = {
  mokafaa: { src: mokafaaLogo, w: 54, h: 22.5022 },
  qitaf: { src: qitafLogo, w: 77, h: 32.1436 },
};
/** icons.rounded — 27px coloured circles with the mini wordmark (Figma Finance 139:11296) */
const roundedLogos: Record<string, { src: string; w: number; h: number; cls: string }> = {
  tamam: { src: tamamLogo, w: 26.1087, h: 10.4435, cls: styles.roundTamam },
  emkan: { src: emkanLogo, w: 20.581, h: 6.09809, cls: styles.roundEmkan },
  quara: { src: quaraLogo, w: 20.3388, h: 3.37876, cls: styles.roundQuara },
};

/** NoonCheckoutProviderCallout (collapsed): Redeem card h43 #F9F9FB r8, logo centred, 14px chevron */
function LoyaltyCallout({ provider, onPress }: { provider: BurnProvider; onPress: () => void }) {
  const logo = checkoutLogos[provider.code];
  return (
    <button type="button" className={`nk-pressable ${styles.callout}`} onClick={onPress} disabled={provider.isDisabled} aria-label={provider.title}>
      <span className={styles.calloutLogo}>{logo ? <img src={logo.src} width={logo.w} height={logo.h} alt="" /> : <ProviderLogo logo={provider.logo} variant="checkout" />}</span>
      <img className={styles.chevron} src={chevronIcon} width={14} height={14} alt="" />
    </button>
  );
}

function RoundedLogo({ provider }: { provider: BurnProvider }) {
  const logo = roundedLogos[provider.code];
  return (
    <span className={styles.roundOuter}>
      {logo ? (
        <span className={`${styles.round} ${logo.cls}`}>
          <img src={logo.src} width={logo.w} height={logo.h} alt="" />
        </span>
      ) : (
        <ProviderLogo logo={provider.logo} variant="rounded" />
      )}
    </span>
  );
}

const calloutText = { p: { font: 'var(--nk-type-text12-regular-lh14)', letterSpacing: -0.12, color: 'var(--nk-color-text-muted)' } };

/**
 * Figma "All flows" Points & Vouchers (143:13577) = master NoonCheckoutBurnSection: white r16 p12 gap 4 —
 * `burn.title` (Label2 Bold 16/20 in a 28px row), the loyalty callouts in a row (gap 4, h43), then the voucher
 * callout (h44 p10 r12 #F9F9FB: HTML text 12/14 Blue-Gray/700 + overlapping rounded logos −10 + chevron).
 * Loyalty → NoonProviderBurnOverlayScreen; voucher → the single provider or the providers list. Skeleton while
 * getProviderList loads (title 150×20, two 44px callouts, one 44px voucher row).
 */
export function PointsVouchers() {
  const nav = useNav();
  const loaded = useRewards((s) => s.providersLoaded);
  useEffect(() => ensureProvidersLoading(), []);
  const { title, loyalty, voucher } = topUpBurn;

  if (!loaded) {
    return (
      <div className={styles.section}>
        <Skeleton width={150} height={20} radius={4} />
        <div className={styles.callouts}>
          <div className={styles.loyalty}>
            <Skeleton height={44} radius={8} style={{ flex: 1 }} />
            <Skeleton height={44} radius={8} style={{ flex: 1 }} />
          </div>
          <Skeleton height={44} radius={12} />
        </div>
      </div>
    );
  }

  const onVoucherPress = () => {
    if (voucher.providers.length === 1) openProviderBurn(nav, voucher.providers[0], true);
    else nav.push('checkout/burn-providers', { list: 'topup' });
  };

  return (
    <div className={styles.section}>
      <div className={styles.titleRow}>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.callouts}>
        {loyalty.length > 0 && (
          <div className={styles.loyalty}>
            {loyalty.map((p) => (
              <LoyaltyCallout key={p.code} provider={p} onPress={() => openProviderBurn(nav, p, false)} />
            ))}
          </div>
        )}
        {voucher.providers.length > 0 && (
          <button type="button" className={`nk-pressable ${styles.voucher}`} onClick={onVoucherPress}>
            <RichText value={voucher.callout} stylesheet={calloutText} className={styles.voucherText} />
            <span className={styles.voucherRight}>
              <span className={styles.voucherLogos}>
                {voucher.providers.map((p) => (
                  <RoundedLogo key={p.code} provider={p} />
                ))}
              </span>
              <img className={styles.chevron} src={chevronIcon} width={14} height={14} alt="" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
