import { motion } from 'motion/react';
import { useState } from 'react';
import { Pressable } from '../../../components';
import { haptic } from '../../../motion/haptics';
import noonLogo from '@assets/couponsearch/mp-noon.svg';
import minutesLogo from '@assets/couponsearch/mp-minutes.webp';
import supermallA from '@assets/couponsearch/mp-supermall-a.svg';
import supermallB from '@assets/couponsearch/mp-supermall-b.svg';
import expressLogo from '@assets/couponsearch/mp-express.svg';
import chipFilter from '@assets/couponsearch/chip-filter.svg';
import chipChevron from '@assets/couponsearch/chip-chevron.svg';
import pillBg from '@assets/couponsearch/pill-bg.svg';
import pillArrow from '@assets/couponsearch/pill-arrow.svg';
import pillFilter from '@assets/couponsearch/pill-filter.svg';
import shareIcon from '@assets/couponsearch/share.svg';
import heroBanner from '@assets/couponsearch/beauty10-hero.webp';
import { beautyCategories, copy, coupon } from '../data';
import styles from '../listing.module.css';

const logos: Record<string, React.ReactNode> = {
  noon: <img src={noonLogo} alt="" width={53} height={18} />,
  minutes: <img src={minutesLogo} alt="" width={76} height={17} />,
  supermall: (
    <span className={styles.mpSupermall}>
      <img src={supermallA} alt="" width={33.6} height={10.2} style={{ marginTop: 2.7 }} />
      <img src={supermallB} alt="" width={23.8} height={10.1} />
    </span>
  ),
  express: <img src={expressLogo} alt="" width={63.7} height={19} />,
};

/** 04 · Eligible items "Marketplace tabs": four equal tabs, logo · 11 / 14 label · 3 × 72 r2 indicator, hairline under. */
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

/** The frames' filter chips: 32 high, #EBEAEA hairline, r8, 14 / 19.6 Medium; Filter leads with its icon, Sort / Price carry a chevron. */
export function FilterChips({ beauty, onPress }: { beauty: boolean; onPress: () => void }) {
  const chips: { label: string; icon?: boolean; chevron?: boolean }[] = [
    { label: copy.chips.filter, icon: true },
    { label: copy.chips.sort, chevron: true },
    { label: copy.chips.price, chevron: true },
    ...(beauty ? [{ label: copy.chips.face }, { label: copy.chips.eyes }] : []),
  ];
  return (
    <div className={`nk-hscroll ${styles.chips}`}>
      {chips.map((c) => (
        <Pressable key={c.label} className={styles.chip} data-chevron={c.chevron || undefined} scale={0.96} onClick={onPress}>
          {c.icon && <img src={chipFilter} alt="" width={16} height={16} />}
          <span>{c.label}</span>
          {c.chevron && <img src={chipChevron} alt="" width={20} height={20} />}
        </Pressable>
      ))}
    </div>
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
