import { Lottie, Pressable } from '../../components';
import { useNav } from '../../kit/Navigator';
import { lotties } from './assets';
import { t } from './data';
import { addressStore } from './store';
import styles from './address.module.css';

/**
 * AddressV2LocationAccessScreen — allow-location Lottie (100×100), title, subtitle, "Allow access" (accent)
 * and "Search location" (white, #EAECF0 border). Shown by the map when location permission is denied.
 */
export function LocationAccessSheet() {
  const nav = useNav();
  const onAllow = () => {
    // LocationProviderV2 permission granted → map moves to the user's location
    addressStore.setLocationGranted(true);
    addressStore.requestLocate();
    nav.back();
  };
  const onSearch = () => {
    nav.back();
    nav.push('address/search');
  };
  return (
    <div className={styles.access}>
      <div className={styles.accessMain}>
        <Lottie src={lotties.allowLocation} loop size={100} />
        <span className={styles.accessTitle}>{t.address_v2_location_access_sheet_title}</span>
        <span className={styles.accessSubtitle}>{t.address_v2_location_access_sheet_subtitle}</span>
      </div>
      <div className={styles.accessFooter}>
        <Pressable className={styles.accessPrimary} onClick={onAllow}>
          {t.address_v2_location_access_button1_title}
        </Pressable>
        <Pressable className={styles.accessSecondary} onClick={onSearch}>
          {t.address_v2_location_access_button2_title}
        </Pressable>
      </div>
    </div>
  );
}
