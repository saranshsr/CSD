import { motion } from 'motion/react';
import { OriginIcon, ProductImage } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { keepShoppingItems, type BzHeader, type BzWrap } from '../data.feed';
import { bz } from '../tokens.feed';
import { BzModuleWrapper } from './BzModuleWrapper';
import styles from './ItemCarousel.module.css';

/**
 * itemCarousel "Keep shopping for" → NoonItemCarouselModule (user_search_history hits): rail 4 under the header,
 * padding 0 16, gap 12, free scroll. Card 138 wide (NoonMetrics.productBoxCarouselWidth), white r12, gap 4; image box
 * 138 × 169 r12 contain with the 2% overlay; info padding 0 6 8, gap 4: title 14/18 500 #101628 2 lines, description
 * pill (#F1F7FD, p2, r4) 12/600 #0076FF + 12 arrow. Tap → the search listing (opacity 0.7 on press, TouchableOpacity).
 */
export function ItemCarousel({ wrap, header }: { wrap: BzWrap; header?: BzHeader }) {
  const nav = useNav();
  return (
    <BzModuleWrapper wrap={wrap} header={header}>
      <div className={`nk-hscroll ${styles.rail}`}>
        {keepShoppingItems.map((it) => (
          <motion.button key={it.id} type="button" className={`nk-pressable ${styles.card}`} style={{ width: bz.productWidth }} whileTap={{ opacity: 0.7 }} onClick={() => nav.push('plp/listing', { query: it.query })} aria-label={it.title}>
            <span className={styles.image} style={{ height: bz.productImageHeight }}>
              <ProductImage product={{ image: it.image, title: it.title, emoji: '', tint: '' }} height="100%" />
            </span>
            <span className={styles.info}>
              <span className={styles.title}>{it.title}</span>
              <span className={styles.pill}>
                <span>{it.description}</span>
                <OriginIcon name="arrow-right" size={12} color="var(--nk-color-home-bz-item-pill-ink)" />
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </BzModuleWrapper>
  );
}
