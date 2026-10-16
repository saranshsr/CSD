import { HtmlText, MaskIcon } from '../../../components';
import { maskSrc } from '../../noonone/components/maskSrc';
import { useNav } from '../../../kit/Navigator';
import noonOneIcon from '@assets/noonone/entry/noon-one.webp';
import rightChevron from '@assets/noonone/entry/right-chevron.webp';
import styles from './VipPreference.module.css';

/** offer.shipping_preferences_vip[0].description (server html) */
const VIP_SHIPPING_DESCRIPTION = 'Get <b>FREE</b> delivery';

/**
 * NoonVIPPreference — under the delivery card when the offer has `shipping_preferences_vip` and the user is not a
 * member: blueGray900 r12 banner, description + "with" (noon_with) 14/600 #F9F9FB, noon One logo, blueGray50 chevron.
 * Tap → ModuleHelper.handlePress(misc.pdpLinkUrl) → /noon-one landing.
 */
export function VipPreference() {
  const nav = useNav();
  return (
    <button type="button" className={`nk-pressable ${styles.container}`} data-testid="noon_one_banner" onClick={() => nav.push('noonone/landing', { source: '/pdp' })}>
      <span className={styles.message}>
        <span className={styles.row}>
          <span className={styles.text}>
            <HtmlText value={VIP_SHIPPING_DESCRIPTION} />
            <span className={styles.with}>with</span>
          </span>
          <img className={styles.noonOne} src={noonOneIcon} alt="noon One" />
        </span>
      </span>
      <MaskIcon src={maskSrc(rightChevron)} size={20} color="var(--nk-palette-blue-gray50)" className={styles.arrow} />
    </button>
  );
}
