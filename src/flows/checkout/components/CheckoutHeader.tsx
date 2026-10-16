import { motion, useTransform, type MotionValue } from 'motion/react';
import backIcon from '@assets/checkout/figma/header-back.svg';
import chevronIcon from '@assets/shared/icons/addr-chevron.svg';
import homeIcon from '@assets/shared/icons/addr-home.svg';
import deliveryOther from '@assets/shared/delivery/other.webp';
import deliveryWork from '@assets/shared/delivery/work.webp';
import { singleLineAddress, tagLabels, type SavedAddress } from '../../address/data';
import { t, tf } from '../data';
import { checkoutJs } from '../tokens';
import styles from './CheckoutHeader.module.css';

/** chevron-thick.svg (NoonThemeManager.icons.chevronThick) — drawn pointing right; flipped in LTR for "back". */
export function ChevronThick({ color, stroke = color, size = 17 }: { color: string; stroke?: string; size?: number }) {
  return (
    <svg width={size} height={(size * 16) / 17} viewBox="0 0 17 16" fill={color} stroke={stroke} aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.20985 8.70574C9.60038 8.31522 9.60038 7.68205 9.20985 7.29153L6.06807 4.14975C5.83376 3.91543 5.83376 3.53553 6.06807 3.30122C6.30238 3.0669 6.68228 3.0669 6.9166 3.30122L10.9069 7.29153C11.2974 7.68205 11.2974 8.31522 10.9069 8.70574L6.9166 12.696C6.68228 12.9304 6.30238 12.9304 6.06807 12.696C5.83376 12.4617 5.83376 12.0818 6.06807 11.8475L9.20985 8.70574Z"
      />
    </svg>
  );
}

/** Work / Other have no Figma asset — the kit delivery icons are masked in the Figma label colour. */
const kitIcons = { WORK: deliveryWork, OTHER: deliveryOther } as const;

/**
 * Figma "🚧 Checkout 2.0" Header (14288:184316): 40px white back button (1.139px Blue-Gray/200 border, r48),
 * centred address block — address-type icon + "Delivering to Home" 16/21.1 Bold Blue-Gray/900 (text-shadow) +
 * 16px chevron, address line 13/18 Blue-Gray/700 ellipsised — and the 40px empty right slot.
 * Keeps NoonSalesAnimatedHeader's scroll behaviour (0→50: bg #F2F3F7 → white, bottom corners 0 → 12).
 * Tapping the address opens the address book (address/select modal).
 * With `title` (Figma "All flows" Header 127:44446) the centre is the "Checkout" title (Figtree Bold 16/21.1, same
 * text-shadow) and the address renders as the AddressCard section instead.
 */
export function CheckoutHeader({
  address,
  scrollY,
  onBack,
  onAddressPress,
  title,
}: {
  address: SavedAddress | undefined;
  scrollY: MotionValue<number>;
  onBack: () => void;
  onAddressPress: () => void;
  /** Figma "All flows" (127:44446) / master session v3: centred "Checkout" title; the address moves into the first section */
  title?: string;
}) {
  const bg = useTransform(scrollY, [0, 50], [checkoutJs.headerFrom, checkoutJs.headerTo]);
  const radius = useTransform(scrollY, [0, 50], [0, 12]);
  const gradient = useTransform(scrollY, [50, 60], [0, 1]);
  // the corner overlay hangs 12px below the header; keep it off until the content scrolls under it so the
  // first card sits 8px under the header at rest (Figma Main Container pt 8)
  const overlay = useTransform(scrollY, [0, 8], [0, 1]);
  const label = address ? address.nickname || tagLabels[address.label] || t.noon_other_label : '';
  const line = address ? [singleLineAddress(address), address.area].filter(Boolean).join(', ') : '';
  return (
    <motion.div className={styles.container} style={{ backgroundColor: bg }}>
      <motion.div className={styles.cornerOverlay} style={{ backgroundColor: bg, borderBottomLeftRadius: radius, borderBottomRightRadius: radius, opacity: overlay }} />
      <div className={styles.row}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          <img className={styles.backIcon} src={backIcon} width={22.7778} height={22.7778} alt="" />
        </button>
        {title ? (
          <span className={styles.title}>{title}</span>
        ) : address ? (
          <button type="button" className={styles.address} onClick={onAddressPress}>
            <span className={styles.labelRow}>
              <span className={styles.typeIcon}>
                {address.label === 'HOME' ? (
                  <img className={styles.homeIcon} src={homeIcon} width={16.2516} height={14.5823} alt="" />
                ) : (
                  <span className={styles.kitIcon} style={{ WebkitMaskImage: `url("${kitIcons[address.label]}")`, maskImage: `url("${kitIcons[address.label]}")` }} />
                )}
              </span>
              <span className={styles.label}>{tf.deliveringTo(label)}</span>
              <img className={styles.chevron} src={chevronIcon} width={16} height={16} alt="" />
            </span>
            <span className={styles.line}>{line}</span>
          </button>
        ) : (
          <span className={styles.address} />
        )}
        <span className={styles.rightSlot} aria-hidden />
      </div>
      <motion.div className={styles.gradient} style={{ opacity: gradient }} />
    </motion.div>
  );
}
