import { Pressable } from '../../../components';
import { asset } from '../data';
import styles from '../categories.module.css';

/**
 * adBannerModule "pre-search-banner-ocm" → AdBannerModuleV2 (shouldFetchAds false) → ModuleWrapper → BannerModule
 * grid (bannerModule, numPerRow 1). One full-width banner (screen − 2 × 15), r20 (BannerContent roundedCornerStyles),
 * no title, no "Ad" tag (the banner has no `isAdBanner`). Wrapper: innerPadding bottom 10, removeExternalSpacing.
 */
export function AdBannerModule({ image, ratio, onPress }: { image: string; ratio: number; onPress: () => void }) {
  return (
    <div className={styles.adModule}>
      <div className={styles.adWrapper}>
        <Pressable scale={1} className={styles.adBanner} onClick={onPress} aria-label="Emirates NBD noon One Credit Card">
          <img src={asset(image)} alt="" className={styles.adImage} style={{ aspectRatio: `100 / ${ratio}` }} draggable={false} />
        </Pressable>
      </div>
    </div>
  );
}
