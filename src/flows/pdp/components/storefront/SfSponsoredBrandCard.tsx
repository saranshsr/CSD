import { Badge, ExpressBadge, OriginIcon, ProductImage } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { products, type Product } from '../../../../data';
import { money } from '../../data';
import styles from './SfSponsoredBrandCard.module.css';

/** Storefront copy (Figma 3499:75701). */
const sfCopy = { tagline: 'Top quality products', shop: (brand: string) => `Shop ${brand}`, ad: 'Ad' } as const;

/** Max cards in the row. */
const MAX_CARDS = 8;

/** Sponsored products: same brand (not the current product), topped up from the same category. */
export function sponsoredBrandProducts(product: Product): Product[] {
  const others = products.filter((p) => p.id !== product.id);
  const brand = others.filter((p) => p.brand === product.brand);
  const category = others.filter((p) => p.category === product.category && p.brand !== product.brand);
  return [...brand, ...category].slice(0, MAX_CARDS);
}

/**
 * Storefront sponsored brand carousel (Figma 3499:75701, "Variant Selection" 163 tall): blue-gray/100 frame (r16, 1px white)
 * around a white r12 panel; header = 44px logo tile + "Top quality products" / "Shop {brand} ›" and the "Ad" badge;
 * h-scroll of 216-wide horizontal cards (64×71 image, 2-line 12/500 title, 12/700 price, express ETA).
 * New section (no bappzaar / kit counterpart). Header → brand listing; card → that product's PDP. < 1 product → null.
 */
export function SfSponsoredBrandCard({ product, ids }: { product: Product; ids?: string[] }) {
  const nav = useNav();
  const items = ids ? ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p) : sponsoredBrandProducts(product);
  if (items.length === 0) return null;
  const brand = product.brand;
  return (
    <section className={styles.root} aria-label={`${sfCopy.ad}: ${sfCopy.shop(brand)}`}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <button type="button" className={styles.brand} onClick={() => nav.push('plp/listing', { query: brand })}>
            <span className={styles.logo}>
              <span className={styles.logoText}>{brand}</span>
            </span>
            <span className={styles.brandText}>
              <span className={styles.tagline}>{sfCopy.tagline}</span>
              <span className={styles.shopRow}>
                <span className={styles.shop}>{sfCopy.shop(brand)}</span>
                <OriginIcon name="chevron-right" size={14} color="var(--nk-color-link)" />
              </span>
            </span>
          </button>
          <Badge bg="var(--nk-palette-border-color)" color="var(--nk-color-price-old)">
            {sfCopy.ad}
          </Badge>
        </div>
        <div className={styles.row}>
          {items.map((p) => (
            <button key={p.id} type="button" className={styles.card} onClick={() => nav.push('pdp/detail', { productId: p.id })}>
              <span className={styles.image}>
                <ProductImage product={p} width="100%" height="100%" emojiScale={0.5} />
                <span className={styles.overlay} />
              </span>
              <span className={styles.info}>
                <span className={styles.title}>
                  {p.brand && p.brand !== 'Generic' ? `${p.brand} ` : null}
                  {p.title}
                </span>
                <span className={styles.price}>{money(p.price)}</span>
                {p.express && (
                  <span className={styles.eta}>
                    <ExpressBadge height={15} />
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
