import { SkuCard } from '../../../components';
import type { Product } from '../../../data';
import styles from './sections.module.css';

/**
 * Figma "Product Carousel" (10575:94169 offers · 10575:94308 wishlist): white r16 card, "Cards Header"
 * (Label2/Bold 16/20 #0E0E0E + optional "Sponsored" 12/14 500 #959595), then a row of 134px SKU cards (gap 12) — the central `SkuCard` in its `cart` look (Figma "SKU" 10575:94182).
 */
export function CartCarousel({ title, sponsored, items }: { title: string; sponsored?: string; items: Product[] }) {
  if (!items.length) return null;
  return (
    <section className={styles.carousel}>
      <div className={styles.cardsHeader}>
        <h3 className={styles.cardsTitle}>{title}</h3>
        {sponsored && <span className={styles.cardsSponsored}>{sponsored}</span>}
      </div>
      <div className={`nk-hscroll ${styles.carouselRow}`}>
        {items.map((p) => (
          <SkuCard key={p.id} product={p} look="cart" rating={false} imageSize={124} />
        ))}
      </div>
    </section>
  );
}
