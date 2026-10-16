import { currency, formatPrice } from '../../data';
import { fontWeight } from '../../foundations/tokens';
import styles from './Price.module.css';

/**
 * PriceDiscounted (src/components/PriceDiscounted): sale 16/700 #0E0E0E, was 12 #7E859B struck,
 * discount 12/600 #05AF25 "{n}% OFF". `size="lg"` is the PDP variant (22/700, was 16, discount 14/600).
 */
export function Price({
  price,
  was,
  size = 'md',
  showCurrency = true,
  showDiscount = true,
  free,
  offSuffix = true,
  currencySize = 'small',
}: {
  price: number;
  was?: number;
  size?: 'sm' | 'md' | 'lg';
  showCurrency?: boolean;
  showDiscount?: boolean;
  free?: boolean;
  /** "n% OFF" (PLP) vs "n%" (bappzaar carousels, Discount + discountPLP) */
  offSuffix?: boolean;
  /** `small` (default): 0.7em semibold sign; `sale`: sign at the sale-price size and weight (bappzaar NoonProductCard `saleCurrency` 16/700) */
  currencySize?: 'small' | 'sale';
}) {
  const pct = was ? Math.round(((was - price) / was) * 100) : 0;
  return (
    <span className={`${styles.row} ${styles[size]}`}>
      {free ? (
        <span className={styles.free}>FREE</span>
      ) : (
        <span className={styles.sale}>
          {showCurrency && <span className={currencySize === 'sale' ? undefined : styles.cur}>{currency}&nbsp;</span>}
          {formatPrice(price)}
        </span>
      )}
      {was && was > price && <span className={styles.was}>{formatPrice(was)}</span>}
      {showDiscount && pct > 0 && <span className={styles.off}>{offSuffix ? `${pct}% OFF` : `${pct}%`}</span>}
    </span>
  );
}

/** Small "AED 1,234" label */
export function Money({ value, bold }: { value: number; bold?: boolean }) {
  return (
    <span style={{ fontWeight: bold ? fontWeight.bold : undefined, whiteSpace: 'nowrap' }}>
      {currency} {formatPrice(value)}
    </span>
  );
}
