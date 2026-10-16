import { motion, useTransform, type MotionValue } from 'motion/react';
import { Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { user } from '../../../data';
import addrChevron from '@assets/shared/icons/addr-chevron.svg';
import addrHome from '@assets/shared/icons/addr-home.svg';
import headerWishlist from '@assets/cart/figma/header-wishlist.svg';
import deliveryWork from '@assets/shared/delivery/work.webp';
import deliveryOther from '@assets/shared/delivery/other.webp';
import styles from './header.module.css';

/**
 * NoonSalesAnimatedHeader + NoonCartAddressSelectorV2 (source="cart"), restyled to Figma Cart 2.0 "Nav Header"
 * (10575:94722): two-line address block (label 16/21.1 bold + chevron, address 13/18 #475067) and the 36px
 * deep-cerulean wishlist circle. Background bg-page → white over the first 50px of scroll, bottom radius 0 → 12.
 */
export function CartHeader({ scrollY, hidden, showBackButton }: { scrollY: MotionValue<number>; hidden?: boolean; showBackButton?: boolean }) {
  const nav = useNav();
  const bg = useTransform(scrollY, [0, 50], ['var(--nk-color-bg-page)', 'var(--nk-color-bg-surface)']);
  const radius = useTransform(scrollY, [0, 50], [0, 12]);
  const shade = useTransform(scrollY, [50, 60], [0, 1]);
  // The corner strip hangs 12px below the header; at rest it would cover the first section's top edge (the
  // "cart's been updated" banner), so it only shows once the content has started to scroll under the header.
  const corners = useTransform(scrollY, [0, 12], [0, 1]);
  const label = user.address.label;
  const icon = label === 'Home' ? addrHome : label === 'Work' ? deliveryWork : deliveryOther;
  return (
    <motion.div className={styles.container} style={{ background: bg, zIndex: hidden ? 0 : 4 }}>
      <motion.div className={styles.cornerOverlay} style={{ background: bg, borderBottomLeftRadius: radius, borderBottomRightRadius: radius, opacity: corners }} />
      <div className={styles.wrapper}>
        {showBackButton && (
          <Pressable className={styles.backButton} onClick={nav.back} aria-label="Back">
            <BackButtonSvg />
          </Pressable>
        )}
        <Pressable className={styles.selector} scale={0.98} onClick={() => nav.push('address/select')}>
          <span className={styles.labelRow}>
            <span className={styles.leadingIcon}>
              <img src={icon} alt="" />
            </span>
            <span className={styles.labelWrap}>
              <span className={styles.label}>{label}</span>
              <img src={addrChevron} alt="" className={styles.chevron} />
            </span>
          </span>
          <span className={styles.addressText}>{user.address.line}</span>
        </Pressable>
        <Pressable className={styles.wishlist} onClick={() => nav.push('wishlist/wishlist')} aria-label="Wishlist">
          <img src={headerWishlist} alt="" />
        </Pressable>
      </div>
      <motion.div className={styles.gradient} style={{ opacity: shade }} />
    </motion.div>
  );
}

/** BackButtonSvg from NoonCartAddressSelectorV2 (only when the kit pushes the cart instead of showing it as a tab). */
function BackButtonSvg() {
  return (
    <svg width={39} height={39} viewBox="0 0 39 39" fill="none" aria-hidden>
      <rect x={0.75} y={0.75} width={37.2778} height={37.2778} rx={18.6389} fill="var(--nk-color-bg-surface)" />
      <rect x={0.75} y={0.75} width={37.2778} height={37.2778} rx={18.6389} stroke="var(--nk-color-bg-muted)" strokeWidth={1.5} />
      <path fillRule="evenodd" clipRule="evenodd" d="M21.923 14.007a1.068 1.068 0 010 1.51l-3.872 3.872 3.872 3.871a1.068 1.068 0 01-1.51 1.51l-4.627-4.626a1.068 1.068 0 010-1.51l4.627-4.627a1.068 1.068 0 011.51 0z" fill="var(--nk-color-text-ink)" />
    </svg>
  );
}
