import { ProductImage, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { currency, formatPrice, type Product } from '../../../data';
import type { BzWrap } from '../data.feed';
import { BzModuleWrapper, Sponsored } from './BzModuleWrapper';
import styles from './AdProductLedDisplay.module.css';

/**
 * adProductLedDisplayModule → AdProductLedDisplayModule, stacked card (adFormat ≠ 1; features/admon/…/
 * AdProductLedDisplayCard): margin 0 12 (366 wide), #F7F8FA, 1px #F2F3F7, r16. No logo in the fill → no header row;
 * image 16 : 9 (364 × 204.75) contain with the overlay and the dark Sponsored "Ad" at top 8 right 8; white footer
 * (p12, gap 12, bottom r15): title 20/26 600 #212121 2 lines, price column (max 55%, end) sale 26/30 bold #1D2539
 * over the struck 11/15 #989FB3 was price and the 11/15 600 #02A31E discount. Card → PDP.
 */
export function AdProductLedDisplay({ wrap, product: p }: { wrap: BzWrap; product: Product }) {
  const nav = useNav();
  const pct = p.was ? Math.round(((p.was - p.price) / p.was) * 100) : 0;
  return (
    <BzModuleWrapper wrap={wrap}>
      <Pressable className={styles.card} scale={1} onClick={() => nav.push('pdp/detail', { productId: p.id })} aria-label={`${p.brand} ${p.title}, sponsored`}>
        <span className={styles.media}>
          <ProductImage product={p} height="100%" />
          <span className={styles.adTag}>
            <Sponsored top={0} right={0} />
          </span>
        </span>
        <span className={styles.footer}>
          <span className={styles.title}>{p.title.startsWith(p.brand) ? p.title : `${p.brand} ${p.title}`}</span>
          <span className={styles.prices}>
            <b>
              {currency} {formatPrice(p.price)}
            </b>
            {pct > 0 && (
              <span className={styles.was}>
                <em>{pct}% off</em>
                <s>{formatPrice(p.was!)}</s>
              </span>
            )}
          </span>
        </span>
      </Pressable>
    </BzModuleWrapper>
  );
}
