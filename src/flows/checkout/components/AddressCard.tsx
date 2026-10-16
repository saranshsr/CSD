import homeIcon from '@assets/shared/icons/addr-home.svg';
import chevronIcon from '@assets/checkout/figma/address-chevron-right.svg';
import deliveryOther from '@assets/shared/delivery/other.webp';
import deliveryWork from '@assets/shared/delivery/work.webp';
import { singleLineAddress, tagLabels, type SavedAddress } from '../../address/data';
import { t } from '../data';
import styles from './AddressCard.module.css';

/** Work / Other have no Figma glyph: the kit delivery icons are masked in the label colour. */
const kitIcons = { WORK: deliveryWork, OTHER: deliveryOther } as const;
const MAX_TITLE = 24; // maxTitleLength passed by NoonCartAddressSelectorV2

/**
 * Figma "All flows" Checkout address card (127:44080) = master `renderDetachedAddress` (session v3: the header
 * shows "Checkout" and the address is the first section). White r16, padding 12 / 16 / 10 / 12, gap 10:
 * 20px address-type icon + label (H16/Bold 16/20, -0.15, Blue-Gray/900), address line B13/Medium 13/20 (-0.1,
 * Blue-Gray/600, one line, px 2), 18px chevron-right-bold. Tap → Address Book modal (showAddressSelectScreen).
 */
export function AddressCard({ address, onPress }: { address: SavedAddress | undefined; onPress: () => void }) {
  if (!address) return null;
  const nickname = address.nickname && address.nickname.length > MAX_TITLE ? `${address.nickname.slice(0, MAX_TITLE)}...` : address.nickname;
  const label = nickname || tagLabels[address.label] || t.noon_other_label;
  const line = [singleLineAddress(address), address.area].filter(Boolean).join(', ');
  return (
    <button type="button" className={`nk-pressable ${styles.card}`} onClick={onPress} aria-label={`Delivery address: ${label}`}>
      <span className={styles.info}>
        <span className={styles.labelRow}>
          <span className={styles.typeIcon}>
            {address.label === 'HOME' ? (
              <img className={styles.homeIcon} src={homeIcon} width={16.2516} height={14.5823} alt="" />
            ) : (
              <span className={styles.kitIcon} style={{ WebkitMaskImage: `url("${kitIcons[address.label]}")`, maskImage: `url("${kitIcons[address.label]}")` }} />
            )}
          </span>
          <span className={styles.label}>{label}</span>
        </span>
        <span className={styles.lineRow}>
          <span className={styles.line}>{line}</span>
        </span>
      </span>
      <img className={styles.chevron} src={chevronIcon} width={18} height={18} alt="" />
    </button>
  );
}
