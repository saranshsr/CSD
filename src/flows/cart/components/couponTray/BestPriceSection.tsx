import { Fragment, useRef, type MutableRefObject, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Lottie, MaskIcon } from '../../../../components';
import { useReduceMotion } from '../../../../motion/recipes';
import dots from '@assets/cart/coupon-tray/coupon-tray-best-price-dots.webp';
import plus from '@assets/cart/coupon-tray/plus.svg';
import bestPriceLottie from '@assets/cart/coupon-tray/coupon-tray-best-price-en.lottie';
import type { CouponTray } from '../../data.couponTray';
import { couponTrayMotion as M } from '../../tokens';
import { TrayOffer, type TrayOfferShared } from './TrayOffer';
import styles from './tray.module.css';

/**
 * NoonSalesCouponTrayBestPriceSection — the deep-green card on top: dotted texture, "Save …" header (only with 2+
 * offers), the "Best price" Lottie, then the offers joined on one white card with "+" separators.
 */
export function BestPriceSection({ bestPrice, shared, activeId, onApply, onRemove }: { bestPrice: NonNullable<CouponTray['bestPrice']>; shared: TrayOfferShared; activeId: string | null; onApply: (id: string, code: string) => void; onRemove: (id: string, code: string) => void }) {
  const many = bestPrice.offers.length > 1;
  const last = bestPrice.offers.length - 1;
  return (
    <div className={styles.bestPrice} data-testid="coupon-tray-best-price">
      <img src={dots} className={styles.bestPriceDots} alt="" />
      <div className={styles.bestPriceHeader}>
        {many && bestPrice.header && <span className={styles.bestPriceSavings}>{bestPrice.header}</span>}
        <Lottie src={bestPriceLottie} loop style={{ height: 22, width: '100%' }} />
      </div>
      <div className={styles.bestPriceOffers}>
        {bestPrice.offers.map((o, i) => (
          <Fragment key={o.id}>
            <TrayOffer
              offer={o}
              bestPrice
              shared={shared}
              loading={activeId === o.id}
              onApply={(code) => onApply(o.id, code)}
              onRemove={(code) => onRemove(o.id, code)}
              className={!many ? undefined : i === 0 ? styles.offerFirst : i === last ? styles.offerLast : styles.offerMiddle}
            />
            {many && i < last && (
              <div className={styles.bestPriceSeparator}>
                <span className={styles.bestPriceSeparatorLine} />
                <span className={styles.bestPriceSeparatorIcon}>
                  <MaskIcon src={plus} size={12} color="var(--nk-palette-blue-gray900)" />
                </span>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * NoonSalesCouponTrayAnimatedItem — the first 10 tray rows fade and rise in, 100ms apart (300ms later when the tray
 * opens with data); a row animates once per key, so a refresh after Remove doesn't replay it.
 */
export function TrayItem({ id, index, seen, delayed, children }: { id: string; index: number; seen: MutableRefObject<Set<string>>; delayed: boolean; children: ReactNode }) {
  const reduce = useReduceMotion();
  const animate = useRef(!reduce && index < M.maxAnimated && !seen.current.has(id)).current;
  seen.current.add(id);
  if (!animate) return <div>{children}</div>;
  const delay = (delayed ? M.delayS : 0) + index * M.staggerS;
  return (
    <motion.div initial={{ opacity: 0, y: M.startY }} animate={{ opacity: 1, y: 0 }} transition={{ opacity: { delay, duration: M.opacityS, ease: M.ease }, y: { delay, duration: M.translateS, ease: M.ease } }}>
      {children}
    </motion.div>
  );
}
