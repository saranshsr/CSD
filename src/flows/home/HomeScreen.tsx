import { memo, useCallback, useState } from 'react';
import { Screen, Text } from '../../components';
import { AdBannerModule } from './components/AdBannerModule';
import { AdProductLedDisplay } from './components/AdProductLedDisplay';
import { BannerCarousel, SnappedBannerCarousel } from './components/BannerCarousel';
import { BannerScroller } from './components/BannerScroller';
import { BzModuleWrapper } from './components/BzModuleWrapper';
import { EasyBannerScroller } from './components/EasyBannerScroller';
import { EidBanners } from './components/EidBanners';
import { HomeHeader } from './components/HomeHeader';
import { ItemCarousel } from './components/ItemCarousel';
import { MegaDeals } from './components/MegaDeals';
import { ProductCarousel } from './components/ProductCarousel';
import { homeFeed, type BzModule } from './data.feed';
import styles from './home2025.module.css';

/**
 * Home — the noon app home feed 1:1 with bappzaar master (ba159e20): NoonHomeScreen → NoonHomeToggle header (kept as
 * the kit's custom header: switcher, address, search; collapses past 100px) → NoonHomeToggleContent → StaticPage →
 * Module / ModuleRenderer. The feed renders the live home CMS payload's modules in its order (`homeFeed` in
 * data.feed.ts, one `switch`); spacing comes from each module's ModuleWrapper (innerPadding / bottomMargin), not a feed
 * gap. Hero creatives are the Eid Figma's (Af34gfmhQ1D0wstXUEHSIF · 89:34722) at the live carousel geometry.
 * Mapping: FIGMA-MAPPING.md → "Home feed · bappzaar modules". The previous bappzaar port is `home/classic`.
 */
export function HomeScreen() {
  const [collapsed, setCollapsed] = useState(false);
  // scroll only flips one boolean; the feed is memoised below, so a flip re-renders the header, not every rail
  const onScroll = useCallback((y: number) => {
    setCollapsed(y >= 100);
  }, []);
  return (
    <Screen
      header={<HomeHeader collapsed={collapsed} />}
      background="bgSurface"
      withTabBar
      safeTop={false}
      onScroll={onScroll}
    >
      <HomeFeed />
    </Screen>
  );
}

/** Everything under the header; memoised so scroll-driven state in HomeScreen doesn't re-render it. */
const HomeFeed = memo(function HomeFeed() {
  return (
    <div className={styles.feed}>
      {homeFeed.filter((m) => !m.hidden).map((m) => (
        <FeedModule key={m.key} m={m} />
      ))}
    </div>
  );
});

/** ModuleRenderer: CMS module type → component. */
function FeedModule({ m }: { m: BzModule }) {
  switch (m.type) {
    case 'adBannerModuleCarousel':
      return <SnappedBannerCarousel wrap={m.wrap} banners={m.banners} flat={m.flat} />;
    case 'noonDynamicCarousel':
      return (
        <BzModuleWrapper wrap={m.wrap}>
          <EidBanners />
        </BzModuleWrapper>
      );
    case 'bannerModuleScroller':
      return <BannerScroller wrap={m.wrap} header={m.header} rows={m.rows} numPerRow={m.numPerRow} banners={m.banners} />;
    case 'adBannerModule':
    case 'bannerModule':
      return <AdBannerModule wrap={m.wrap} header={m.header} banner={m.banner} ad={m.ad} creativeAd={m.creativeAd} crop={m.crop} />;
    case 'productCarousel':
      return <ProductCarousel wrap={m.wrap} header={m.header} products={m.products} />;
    case 'easyBannerScroller':
    case 'adEasyBannerScroller':
      return <EasyBannerScroller wrap={m.wrap} header={m.header} numPerView={m.numPerView} rows={m.rows} banners={m.banners} />;
    case 'hpMegaDealModule':
      return <MegaDeals wrap={m.wrap} header={m.header} />;
    case 'adProductLedDisplayModule':
      return <AdProductLedDisplay wrap={m.wrap} product={m.product} />;
    case 'itemCarousel':
      return <ItemCarousel wrap={m.wrap} header={m.header} />;
    case 'bannerModuleCarousel':
      return <BannerCarousel wrap={m.wrap} header={m.header} banners={m.banners} numPerView={m.numPerView} mediaHeader={m.mediaHeader} />;
  }
}

/** A feed module with the 2025 section title (Figtree Bold 17/22, `new-black`, x=14); `gap` = title → content (Figma, default 8). Kept for the 2025 components. */
export function Module({ title, gap, children }: { title: string; gap?: number; children: React.ReactNode }) {
  return (
    <section className={styles.module} style={gap === undefined ? undefined : { gap }}>
      <Text variant="heading" as="h2" color="var(--nk-palette-new-black)" className={styles.title}>
        {title}
      </Text>
      {children}
    </section>
  );
}
