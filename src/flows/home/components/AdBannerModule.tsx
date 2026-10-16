import { Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import type { BzBanner, BzHeader, BzWrap } from '../data.feed';
import { BzModuleWrapper, Sponsored } from './BzModuleWrapper';
import styles from './BannerModules.module.css';

/**
 * bappzaar AdBannerModule (no `shouldFetchAds` → AdBannerModuleV1) / bannerModule → ModuleWrapper → BannerModule
 * `renderGrid` (the type isn't strip / carousel / scroller), numPerRow 1:
 *   width  = floor((W − 2 · staticPagePadding 15 − (n − 1) · innerSpacing) / n)  → 390 − 30 = 360
 *   height = PixelRatio.roundToNearestPixel(width · ratio / 100)                  → 360 · 25 / 100 = 90 (4 : 1)
 * Radius 20 (BannerContent roundedCornerStyles; adBannerModule isn't in nonRoundedBanners). V1 adds the module-level
 * Sponsored "Ad" label at the CMS position inside the wrapper (top-fold-2: bottom 16 right 22 = the banner's
 * bottom-right, 7 in). Written in CSS as `width: calc(100% − 30px)` + `aspect-ratio: 100 / ratio`, so the same formula
 * holds at any device width.
 */
export function AdBannerModule({ wrap, header, banner, ad, creativeAd, crop }: { wrap: BzWrap; header?: BzHeader; banner: BzBanner; ad?: { bottom: number; right: number }; creativeAd?: boolean; crop?: Record<string, string> }) {
  const nav = useNav();
  return (
    <BzModuleWrapper wrap={wrap} header={header}>
      <div className={styles.grid}>
        <Pressable
          className={styles.gridBanner}
          data-testid="bz-ad-banner"
          scale={1}
          aria-label={banner.alt}
          onClick={() => nav.push('plp/listing', { query: banner.query })}
          style={{ aspectRatio: `100 / ${banner.ratio}` }}
        >
          <img src={banner.image} alt="" draggable={false} className={crop ? styles.cropped : styles.fill} style={crop} />
        </Pressable>
      </div>
      {ad && !creativeAd && <Sponsored bottom={ad.bottom} right={ad.right} />}
    </BzModuleWrapper>
  );
}
