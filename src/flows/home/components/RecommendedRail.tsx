import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { MaskIcon, Pressable, SkuCard } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { duration, easing, tween } from '../../../motion/presets';
import { Stagger } from '../../../motion/recipes';
import { railProduct, recommendedTabs, type RailItem } from '../data.rails';
import styles from './RecommendedRail.module.css';

/**
 * Recommended for you — Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5233: the icon tab strip ("Tab Bar" 1337:5239, sticky at the
 * top of the feed while the rail is on screen) over a rail of 134px `SkuCard`s (pt16, px12, gap 12). Active tab:
 * Noontree Bold 13/16 `tabActive`, 3.2 underline (shared `layoutId`) and the white → #E0EFFF glow; inactive: Medium
 * 13/16 `textBody` over the 1px `border` baseline. Tapping a tab swaps the rail (AnimatePresence + Stagger).
 */
export function RecommendedRail() {
  const [active, setActive] = useState(recommendedTabs[0].id);
  const tab = recommendedTabs.find((t) => t.id === active) ?? recommendedTabs[0];
  return (
    <div className={styles.wrap}>
      <div className={`nk-hscroll ${styles.tabs}`} role="tablist">
        {recommendedTabs.map((t) => {
          const on = t.id === active;
          return (
            <Pressable key={t.id} role="tab" aria-selected={on} scale={0.96} className={styles.tab} data-on={on || undefined} onClick={() => setActive(t.id)}>
              <MaskIcon src={t.icon} size={28} color={on ? ref.color('tabActive') : ref.color('textBody')} />
              <span className={styles.label}>{t.label}</span>
              {on && <motion.span layoutId="home-rec-tab" className={styles.underline} transition={{ duration: duration.base, ease: easing.out }} />}
            </Pressable>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={tween('fast', 'out')}>
          <Stagger className={`nk-hscroll ${styles.rail}`}>
            {tab.items.map((item) => (
              <RailSku key={item.id} item={item} />
            ))}
          </Stagger>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** A home rail item → `SkuCard` with the Figma variations ("Free Delivery" by default). */
export function RailSku({ item }: { item: RailItem }) {
  return (
    <SkuCard
      product={railProduct(item)}
      badge={item.badge}
      sponsored={item.sponsored}
      fulfilment={item.fulfilment}
      imageSize={item.imageSize}
      deliveryNote={item.deliveryNote ?? 'Free Delivery'}
    />
  );
}
