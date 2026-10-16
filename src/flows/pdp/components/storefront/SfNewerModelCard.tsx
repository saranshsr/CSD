import { OriginIcon, Pressable, ProductImage } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { products, type Product } from '../../../../data';
import { money } from '../../data';
import styles from './SfNewerModelCard.module.css';

/** Storefront copy not in data.ts `copy` (Figma 3499:75232). */
const sfCopy = { newerModel: 'Newer model available', viewNewer: 'View newer model' } as const;

const TIERS: Record<string, number> = { '': 0, mini: 0, lite: 0, fe: 0, plus: 1, pro: 2, max: 3, 'pro max': 3, ultra: 3, fold: 4 };
type Model = { line: string; gen: number; tier: string };

/** "iPhone 17 Pro" → { line: 'iphone', gen: 17, tier: 'pro' }; "Galaxy S25 Ultra Dual SIM …" → { 'galaxy s', 25, 'ultra' }. */
function parseModel(p: Product): Model | null {
  const src = p.attributes?.model ?? p.title;
  const m = /^(.*?)(\d+)\s*(pro max|pro|plus|ultra|max|mini|lite|fe|fold)?\b/i.exec(src);
  if (!m || m[1].trim().length < 2) return null;
  return { line: m[1].trim().toLowerCase(), gen: Number(m[2]), tier: (m[3] ?? '').toLowerCase() };
}

/**
 * Successor of a product (derived; no `successor` field in the mocks): same brand + category + model line
 * ("iPhone", "Galaxy S", "Pixel") with a higher generation — same tier first, then the next generation, closest
 * storage / colour. When there is none, the next tier of the same generation (iPhone 17 Pro → 17 Pro Max). Else null.
 */
export function successorFor(product: Product): Product | null {
  const cur = parseModel(product);
  if (!cur) return null;
  const pool = products
    .filter((c) => c.id !== product.id && c.brand === product.brand && c.category === product.category)
    .map((c) => ({ c, m: parseModel(c) }))
    .filter((x): x is { c: Product; m: Model } => !!x.m && x.m.line === cur.line);
  const match = (c: Product) => (c.attributes?.storage === product.attributes?.storage ? 2 : 0) + (c.attributes?.color === product.attributes?.color ? 1 : 0) + (c.image ? 1 : 0);
  const newer = pool
    .filter((x) => x.m.gen > cur.gen)
    .sort((a, b) => Number(b.m.tier === cur.tier) - Number(a.m.tier === cur.tier) || a.m.gen - b.m.gen || match(b.c) - match(a.c));
  if (newer[0]) return newer[0].c;
  const rank = TIERS[cur.tier] ?? 0;
  const upgrade = pool
    .filter((x) => x.m.gen === cur.gen && (TIERS[x.m.tier] ?? 0) > rank)
    .sort((a, b) => (TIERS[a.m.tier] ?? 0) - (TIERS[b.m.tier] ?? 0) || match(b.c) - match(a.c));
  return upgrade[0]?.c ?? null;
}

/**
 * Storefront "OrderHistoryItems" newer-model card (Figma 3499:75229): purple → white "Newer model available" strip,
 * 55×68 thumb, 2-line title, price, round chevron button. Tap → nav.push('pdp/detail', { productId }) (push, so Back
 * returns to the old model). `successor` overrides the derived one; renders nothing when there is none.
 */
export function SfNewerModelCard({ product, successor }: { product: Product; successor?: Product | null }) {
  const nav = useNav();
  const next = successor === undefined ? successorFor(product) : successor;
  if (!next) return null;
  return (
    <Pressable scale={0.98} className={styles.card} aria-label={`${sfCopy.viewNewer}: ${next.title}`} onClick={() => nav.push('pdp/detail', { productId: next.id })}>
      <span className={styles.strip}>
        <OriginIcon name="thunder-square" size={18} color="var(--nk-palette-deep-purple)" />
        <span className={styles.stripText}>{sfCopy.newerModel}</span>
      </span>
      <span className={styles.body}>
        <span className={styles.thumb}>
          <ProductImage product={next} width="100%" height="100%" emojiScale={0.5} />
        </span>
        <span className={styles.info}>
          <span className={styles.title}>{next.title}</span>
          <span className={styles.price}>{money(next.price)}</span>
        </span>
        <span className={styles.go} aria-hidden>
          <OriginIcon name="chevron-right" size={14} color="var(--nk-color-text-primary)" className="pdp-flip" />
        </span>
      </span>
    </Pressable>
  );
}
