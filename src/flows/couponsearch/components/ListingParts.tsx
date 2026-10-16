import { motion } from 'motion/react';
import { useState } from 'react';
import { MarketplaceTag, Pressable } from '../../../components';
import { haptic } from '../../../motion/haptics';
import noonLogo from '@assets/plp/fulfillment/noon-wide-assortment.png';
import pillBg from '@assets/couponsearch/pill-bg.svg';
import pillArrow from '@assets/couponsearch/pill-arrow.svg';
import pillFilter from '@assets/couponsearch/pill-filter.svg';
import shareIcon from '@assets/couponsearch/share.svg';
import heroBanner from '@assets/couponsearch/beauty10-hero.webp';
import { beautyCategories, copy, coupon } from '../data';
import styles from '../listing.module.css';

/** the kit's marketplace marks (the PLP fulfilment tabs' noon logo and MarketplaceTag), in the frame's order */
const logos: Record<string, React.ReactNode> = {
  noon: <img src={noonLogo} alt="" width={79} height={18} style={{ objectFit: 'contain' }} />,
  minutes: <MarketplaceTag kind="minutes" height={18} />,
  supermall: <MarketplaceTag kind="supermall" height={18} />,
  express: <MarketplaceTag kind="express" height={18} />,
};

/**
 * 04 · Eligible items "Marketplace tabs": four equal tabs (noon · Minutes · supermall · express), logo · 11 / 14 label ·
 * 3 × 72 r2 indicator, hairline under. The kit's MarketplaceStrip is five fixed tabs in another order with other labels,
 * so the frame's four-tab strip stays, drawn with the kit's marks.
 */
export function MarketplaceTabs() {
  const [active, setActive] = useState('noon');
  return (
    <nav className={styles.mp} aria-label="Marketplaces">
      {copy.marketplaces.map((m) => (
        <Pressable
          key={m.id}
          className={styles.mpTab}
          scale={1}
          aria-current={m.id === active || undefined}
          onClick={() => {
            if (m.id === active) return;
            haptic('tap');
            setActive(m.id);
          }}
        >
          <span className={styles.mpLogo}>{logos[m.id]}</span>
          <span className={styles.mpLabel}>{m.label}</span>
          {m.id === active ? <motion.i layoutId="cs-mp-indicator" className={styles.mpIndicator} transition={{ duration: 0.2, ease: [0.455, 0.03, 0.515, 0.955] }} /> : <i className={styles.mpIndicatorSpace} />}
        </Pressable>
      ))}
    </nav>
  );
}

/** The BEAUTY10 hero (the team file's banner art: "Extra 10% off · Use code: BEAUTY10" and the 1-2-3 steps strip). */
export function Beauty10Hero() {
  return <img className={styles.hero} src={heroBanner} alt={`Extra 10% off on skincare, haircare, makeup and more. Use code ${coupon.code}. Add your favourite items to cart, use code ${coupon.code}, check out and get extra 10% off.`} />;
}

/** Category circles under the hero: 72 r36 with a #EDF0F2 hairline, label 14 / 20 SemiBold, 12 apart. */
export function CategoryCircles({ onPress }: { onPress: (query: string) => void }) {
  return (
    <div className={`nk-hscroll ${styles.cats}`}>
      {beautyCategories.map((c) => (
        <Pressable key={c.id} className={styles.cat} scale={0.95} onClick={() => onPress(c.query)}>
          <img className={styles.catImg} src={c.image} alt="" draggable={false} />
          <span className={styles.catLabel}>{c.label}</span>
        </Pressable>
      ))}
    </div>
  );
}

/** The floating "Sort ⇅ | Filter" pill (160 × 36, #3866DF) and the 36 share circle, 12 above the bottom nav. */
export function SortFilterPill({ onPress }: { onPress: () => void }) {
  return (
    <div className={styles.pillDock}>
      <Pressable className={styles.pill} scale={0.96} onClick={onPress} aria-label={`${copy.pill.sort} and ${copy.pill.filter}`}>
        <img className={styles.pillBg} src={pillBg} alt="" />
        <span className={styles.pillSort}>{copy.pill.sort}</span>
        <span className={styles.pillSortIcon} aria-hidden>
          <img src={pillArrow} alt="" style={{ transform: 'rotate(90deg)' }} />
          <img src={pillArrow} alt="" style={{ transform: 'rotate(-90deg)' }} />
        </span>
        <span className={styles.pillSep} aria-hidden />
        <span className={styles.pillFilter}>{copy.pill.filter}</span>
        <img className={styles.pillFilterIcon} src={pillFilter} alt="" width={24} height={24} />
      </Pressable>
      <Pressable className={styles.share} scale={0.92} onClick={onPress} aria-label={copy.pill.share}>
        <img src={shareIcon} alt="" width={24} height={24} />
      </Pressable>
    </div>
  );
}
