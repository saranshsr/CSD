import { OriginIcon, Pressable } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import type { Product } from '../../../../data';
import bundleIcon from '@assets/pdp/new-pdp/bundle-combo.gif';
import type { PdpContent } from '../../data';
import { bestComboSaving, combosFor, npaCopy } from '../../data.npA';
import styles from './SfBundleCard.module.css';

/**
 * "Bundle up & Save" card (New PDP Af34gfmhQ1D0wstXUEHSIF · 84:8457) = bappzaar NoonAvailableBundlesTag: r16 card inset 12
 * (1px white border, white → brand-blue/100 gradient), padding 8 · 8 · 8 · 12, gap 8; 40px icon box with the 30px animated
 * combo glyph (the noon-bundle lottie), title 15/600/20 "Bundle up & Save upto" + "Đ20 off" 15/700 #0A49B8, subtitle
 * 13/20 secondary "N combos available", 20px chevron-right. Renders nothing without combos (no FBT accessories).
 * Tap = NoonAvailableBundlesOverlayScreen; here `onPress`, defaulting to a toast.
 */
export function SfBundleCard({ product, content, onPress }: { product: Product; content: PdpContent; onPress?: () => void }) {
  const nav = useNav();
  const combos = combosFor(product, content);
  if (!combos.length) return null;
  const open = onPress ?? (() => nav.toast(npaCopy.bundleOpen(combos.length)));
  return (
    <Pressable className={styles.card} scale={0.98} onClick={open}>
      <span className={styles.content}>
        <span className={styles.iconBox} aria-hidden>
          <img alt="" src={bundleIcon} className={styles.icon} />
        </span>
        <span className={styles.text}>
          <span className={styles.title}>
            {npaCopy.bundleTitle} <b className={styles.off}>{npaCopy.bundleOff(bestComboSaving(combos))}</b>
          </span>
          <span className={styles.subtitle}>{npaCopy.bundleSubtitle(combos.length)}</span>
        </span>
      </span>
      <OriginIcon name="chevron-right" size={20} color="var(--nk-color-text-primary)" />
    </Pressable>
  );
}
