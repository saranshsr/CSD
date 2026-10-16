import { ProductCard } from '../../../components';
import type { Product } from '../../../data';
import { Stagger } from '../../../motion/recipes';
import type { BzHeader, BzWrap } from '../data.feed';
import { bz } from '../tokens.feed';
import { BzModuleWrapper } from './BzModuleWrapper';
import styles from './ProductCarousel.module.css';

/**
 * productCarousel → ModuleWrapper → ProductCarouselModuleSwitch → NoonOptimizedProductCarousel (NoonProductCard; the
 * legacy ProductCarouselModule + NoonProductBoxVertical has the same box). numPerRow absent → 2.6:
 *   card = round((W − staticPagePadding 15 − floor(2.6) · productBoxCarousellMargin 8) / 2.6) = round(359 / 2.6) = 138
 *   image = round((138 − 2 · 6 − 2) · 1.361) = 169
 * 8 apart, first 15 from the edge, last 15 from the end; free scroll (no snap). The card is the central `ProductCard`
 * in its `carousel` variant; tap → PDP, "+" quick-adds.
 */
export function ProductCarousel({ wrap, header, products }: { wrap: BzWrap; header?: BzHeader; products: Product[] }) {
  if (!products.length) return null;
  return (
    <BzModuleWrapper wrap={wrap} header={header}>
      <Stagger className={`nk-hscroll ${styles.rail}`}>
        {products.map((p, i) => (
          <ProductCard key={`${p.id}-${i}`} product={p} carousel width={bz.productWidth} />
        ))}
      </Stagger>
    </BzModuleWrapper>
  );
}
