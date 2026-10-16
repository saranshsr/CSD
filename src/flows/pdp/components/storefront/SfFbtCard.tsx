import { Fragment, useState } from 'react';
import { OriginIcon, ProductImage } from '../../../../components';
import etaExpressToday from '@assets/pdp/new-pdp/eta-express-today.svg';
import { useDemoStore } from '../../../../kit/DemoStore';
import { products, type Product } from '../../../../data';
import { copy, money } from '../../data';
import { pdpTokens } from '../../tokens';
import { Card } from '../Sections';
import styles from './SfFbtCard.module.css';

/** Storefront copy (Figma 3499:75702); sentence case as drawn. */
const sfCopy = { title: 'Frequently bought together', buyAll: (price: string) => `Buy all for ${price}` } as const;

/**
 * Storefront Frequently bought together (Figma 3499:75702): 15/700 title; equal tiles (140-tall image r8, 1px blue-gray/200,
 * 24px check disc at top/end −5) joined by 24px "+" discs; title 12/500 (2 lines), price 12/700, "express Today" ETA pill;
 * full-width "Buy all for Đ{total}" (white, 1px sky blue, r8). Replaces FbtCard (same props, same behaviour):
 * tile tap toggles the item, the button adds every selected item via useDemoStore().addToCart and shows
 * "Added to cart" for pdpTokens.fbtAddedMs; nothing selected → disabled. < 2 products → null.
 */
export function SfFbtCard({ ids }: { ids?: string[] }) {
  const { addToCart } = useDemoStore();
  const items = (ids ?? []).map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
  const [selected, setSelected] = useState<string[]>(items.map((p) => p.id));
  const [added, setAdded] = useState(false);
  if (items.length < 2) return null;
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const buy = () => {
    selected.forEach((id) => addToCart(id, 1));
    setAdded(true);
    setTimeout(() => setAdded(false), pdpTokens.fbtAddedMs);
  };
  const total = items.filter((p) => selected.includes(p.id)).reduce((sum, p) => sum + p.price, 0);
  const disabled = selected.length === 0;
  return (
    <Card contentGap={12}>
      <h3 className={styles.title}>{sfCopy.title}</h3>
      <div className={styles.list} data-scroll={items.length > 3 || undefined}>
        {items.map((p, i) => {
          const on = selected.includes(p.id);
          return (
            <Fragment key={p.id}>
              {i > 0 && (
                <span className={styles.plusCol} aria-hidden>
                  <span className={styles.plus}>
                    <OriginIcon name="plus" size={16} color="var(--nk-color-text-primary)" />
                  </span>
                </span>
              )}
              <div className={styles.tile}>
                <button type="button" className={styles.imageBtn} onClick={() => toggle(p.id)} aria-pressed={on} aria-label={p.title}>
                  <span className={styles.image}>
                    <ProductImage product={p} width="100%" height="100%" emojiScale={0.5} />
                    <span className={styles.overlay} />
                  </span>
                </button>
                <span className={styles.check} aria-hidden>
                  <OriginIcon name="check-circle" filled={on} size={24} color={on ? 'var(--nk-color-link)' : 'var(--nk-color-text-tertiary)'} />
                </span>
                <div className={styles.info}>
                  <span className={styles.itemTitle}>
                    {p.brand && p.brand !== 'Generic' ? `${p.brand} ` : null}
                    {p.title}
                  </span>
                  <span className={styles.price}>{money(p.price)}</span>
                  {p.express && (
                    <span className={styles.eta}>
                      {/* New PDP 64:5732 "HP ETA": the express · Today pill (101.667 × 15) */}
                      <img src={etaExpressToday} alt="express Today" className={styles.etaImg} />
                    </span>
                  )}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
      <button type="button" className={styles.buy} data-added={added || undefined} disabled={disabled} onClick={buy}>
        {added && <OriginIcon name="cart-check-filled" size={20} color="var(--nk-color-link)" />}
        {added ? copy.addedToCart : disabled ? copy.buyTogether(0) : sfCopy.buyAll(money(total))}
      </button>
    </Card>
  );
}
