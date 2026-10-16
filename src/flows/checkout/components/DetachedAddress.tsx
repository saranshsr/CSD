import deliveryHome from '@assets/icons/noon-delivery-home.webp';
import deliveryOther from '@assets/shared/delivery/other.webp';
import deliveryWork from '@assets/shared/delivery/work.webp';
import { singleLineAddress, tagLabels, type SavedAddress } from '../../address/data';
import { t } from '../data';
import { ChevronThick } from './CheckoutHeader';
import section from './section.module.css';
import styles from './DetachedAddress.module.css';

const icons = { HOME: deliveryHome, WORK: deliveryWork, OTHER: deliveryOther } as const;
const MAX_TITLE = 24; // maxTitleLength passed by NoonCartAddressSelectorV2

/**
 * renderDetachedAddress (session version ≥ 3): white section, padding 12/16/12/10, NoonCartAddressSelectorV2
 * source "checkout-detached" (no back button, no chevron-down) → NoonAddressSelector <Address>:
 * 20×20 delivery icon tinted $blueGray700, label 16/700 $blueGray900, address 13/500 $slateGray (lh 22, paddingStart 4,
 * marginTop 2, 1 line), then the slateGray chevron-thick. Tap → address select.
 */
export function DetachedAddress({ address, onPress }: { address: SavedAddress | undefined; onPress: () => void }) {
  if (!address) return null;
  const nickname = address.nickname && address.nickname.length > MAX_TITLE ? `${address.nickname.slice(0, MAX_TITLE)}...` : address.nickname;
  const label = nickname || tagLabels[address.label] || t.noon_other_label;
  const text = [singleLineAddress(address), address.area].filter(Boolean).join(', ');
  return (
    <div className={section.section}>
      <button type="button" className={styles.wrapper} onClick={onPress}>
        <span className={styles.selector}>
          <span className={styles.labelRow}>
            <span className={styles.icon} style={{ WebkitMaskImage: `url(${icons[address.label]})`, maskImage: `url(${icons[address.label]})` }} />
            <span className={styles.label}>{label}</span>
          </span>
          <span className={styles.content}>
            <span className={styles.address}>{text}</span>
          </span>
        </span>
        <span className={styles.chevron}>
          <ChevronThick color="var(--nk-color-text-secondary)" stroke="transparent" />
        </span>
      </button>
    </div>
  );
}
