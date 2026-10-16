import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { MarketplaceTag, ProductImage } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { cartAddOns, FOUPON_VALUE, type CartLine } from '../../../kit/DemoStore';
import { currency, formatPrice } from '../../../data';
import chevronDown from '@assets/checkout/figma/footer-chevron-down.svg';
import discountIcon from '@assets/checkout/figma/item-discount.svg';
import pillExpress from '@assets/checkout/figma/pill-express.svg';
import supermallA from '@assets/checkout/figma/supermall-a.svg';
import supermallB from '@assets/checkout/figma/supermall-b.svg';
import wave from '@assets/checkout/figma/footer-wave.svg';
import waveWide from '@assets/checkout/figma/footer-wave-wide.svg';
import infoIcon from '@assets/checkout/checkout-info-icon.webp';
import radioChecked from '@assets/shared/icons/radio2-checked.webp';
import radioUnchecked from '@assets/shared/icons/radio2-unchecked.webp';
import { COMBO_PRODUCT_IDS, t, tf } from '../data';
import type { CheckoutShipment as Shipment, ShipmentMarketplace, ShipmentPromise } from '../data.shipment';
import { checkoutStore } from '../store';
import { formatAmount } from '../utils';
import styles from './CheckoutShipment.module.css';

const DURATION = 0.3; // ANIMATION_DURATION 300
const money = (n: number) => `${currency}${formatPrice(n)}`;

/**
 * Figma "Vector 6919" — the #F9F9FB tab behind "Get it …". Exported as two widths (215.431 / 242 frame, svg
 * 231.046 / 257.658 incl. the drop-shadow bleed). In Figma its right slope sits ~26px after the promise text, so
 * the frame is offset from the measured text end; the long variant is used when the short one would expose its
 * left notch (frame left > −16).
 */
const WAVES = {
  short: { src: wave, frameW: 215.431, w: 231.046, h: 68.4021 },
  wide: { src: waveWide, frameW: 242, w: 257.658, h: 68.3523 },
};
const WAVE_GAP = 26;
const WAVE_MAX_LEFT = -16;
const WAVE_BLEED_X = 9.8; // inset −4.55% / −4.05% of the frame
const WAVE_BLEED_Y = 7.6; // top −5 + inset −5%

function FooterWave({ textEnd }: { textEnd: number | null }) {
  const right = (textEnd ?? 174) + WAVE_GAP;
  let v = WAVES.short;
  let left = right - v.frameW;
  if (left > WAVE_MAX_LEFT) {
    v = WAVES.wide;
    left = Math.min(WAVE_MAX_LEFT, right - v.frameW);
  }
  return <img className={styles.wave} src={v.src} width={v.w} height={v.h} style={{ left: left - WAVE_BLEED_X, top: -WAVE_BLEED_Y }} alt="" />;
}

/** Figma "Fulfilments for shipments" — supermall 63×20 r4.185 #2122B8 with the two wordmark layers; express 57×17.1 svg. */
function FulfilmentPill({ kind }: { kind: ShipmentMarketplace }) {
  if (kind === 'supermall') {
    return (
      <span className={styles.pillSupermall} role="img" aria-label="supermall">
        <img src={supermallA} width={30.8683} height={10.1028} className={styles.supermallA} alt="" />
        <img src={supermallB} width={21.875} height={10.089} className={styles.supermallB} alt="" />
      </span>
    );
  }
  if (kind === 'express') {
    return (
      <span className={styles.pillExpressBox}>
        <img src={pillExpress} width={57} height={17.1} alt="express" />
      </span>
    );
  }
  // not in the Figma frame — shared marketplace pill
  return <MarketplaceTag kind="global" height={20} />;
}

function ItemRow({ line, multiple }: { line: CartLine; multiple: boolean }) {
  const p = line.product;
  const pct = p.was && p.was > p.price ? Math.round(((p.was - p.price) / p.was) * 100) : 0;
  const warranty = line.warranty ? cartAddOns[line.warranty] : null;
  const combo = COMBO_PRODUCT_IDS.includes(p.id);
  return (
    <div className={styles.item} data-multiple={multiple || undefined}>
      <div className={styles.image}>
        <span className={styles.imageInner}>
          <ProductImage product={p} width={64} height={88.615} emojiScale={0.5} style={{ background: 'transparent', mixBlendMode: 'multiply' }} />
        </span>
        <span className={styles.qty}>
          <span className={styles.qtyX}>{tf.qtyX}</span>
          <span className={styles.qtyValue}>{line.qty}</span>
        </span>
      </div>
      <div className={styles.itemContent}>
        <span className={styles.itemTitle}>{p.title}</span>
        <span className={styles.priceRow}>
          {p.price === 0 ? <span className={styles.price}>{t.noon_free}</span> : <span className={styles.price}>{money(p.price)}</span>}
          {pct > 0 && (
            <span className={styles.discounted}>
              <span className={styles.was}>{money(p.was!)}</span>
              <span className={styles.off}>{tf.percentOff(pct)}</span>
            </span>
          )}
        </span>
        {warranty && <span className={styles.warrantyChip}>{tf.extendedWarranty(money(warranty.price))}</span>}
        {combo && <span className={styles.comboChip}>{tf.comboItem}</span>}
        {line.foupon && (
          <span className={styles.discountRow}>
            <img src={discountIcon} width={16} height={16} alt="" />
            <span className={styles.discountText}>{tf.discount(`${currency}${formatAmount(FOUPON_VALUE)}`)}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Figma "🚧 Checkout 2.0" Shipment (14288:183975 … 183978): white r16 card, gap 9 — header "SHIPMENT n" 13/20
 * ExtraBold + item-count pill; item rows (52×70 image r8 on Blue-Gray/200 + ×qty badge, title 12/16, price /
 * was / % off, chips); footer "Get it **…**" on the #F9F9FB tab + marketplace pill; shipments with alternative
 * lanes add the gradient "Need it today?" / "Save on fees with later delivery" row that expands the lane list
 * (setShipmentOption → session reload). Horizontal item scroll when the shipment has more than one line.
 */
export function CheckoutShipment({ shipment, index, selected }: { shipment: Shipment; index: number; selected: ShipmentPromise }) {
  const nav = useNav();
  const [open, setOpen] = useState(false);
  const count = shipment.lines.reduce((n, l) => n + l.qty, 0);
  const multiple = shipment.lines.length > 1;
  const textRef = useRef<HTMLSpanElement>(null);
  const [textEnd, setTextEnd] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (el) setTextEnd(el.offsetLeft + el.offsetWidth);
  }, [selected.label]);

  const choose = (p: ShipmentPromise) => {
    if (p.deliveryDate === selected.deliveryDate) return;
    checkoutStore.update((s) => ({ promiseByShipment: { ...s.promiseByShipment, [shipment.id]: p.deliveryDate } }));
  };

  const fulfilment = (
    <div className={styles.fulfilmentWrap}>
      <FooterWave textEnd={textEnd} />
      <div className={styles.fulfilment}>
        <span className={styles.fulfilmentTexts}>
          <span ref={textRef} className={styles.fulfilmentText}>
            <span className={styles.getIt}>{tf.getIt}</span>
            <span className={styles.promiseLabel}>{selected.label}</span>
          </span>
        </span>
        <FulfilmentPill kind={shipment.marketplace} />
      </div>
    </div>
  );

  return (
    <div className={styles.shipment}>
      <div className={styles.header}>
        <span className={styles.title}>{tf.shipment(index + 1)}</span>
        <span className={styles.countPill}>{t.item(count)}</span>
      </div>

      <div className={`nk-hscroll ${styles.items}`} data-multiple={multiple || undefined}>
        {shipment.lines.map((l) => (
          <ItemRow key={l.product.id} line={l} multiple={multiple} />
        ))}
      </div>

      <div className={styles.footers}>
        {fulfilment}
        {shipment.mainCallout && (
          <div className={styles.needToday}>
            <button type="button" className={styles.needTodayRow} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              <span className={styles.needTodayText}>{shipment.mainCallout.message}</span>
              <motion.img src={chevronDown} width={16} height={16} className={styles.needTodayChevron} animate={{ rotate: open ? 180 : 0 }} transition={{ duration: DURATION }} alt="" />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div key="lanes" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DURATION, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
                  <div className={styles.lanes}>
                    {shipment.promises.map((p) => {
                      const on = p.deliveryDate === selected.deliveryDate;
                      return (
                        <button key={p.deliveryDate} type="button" className={styles.lane} onClick={() => choose(p)} disabled={on} aria-pressed={on}>
                          <img className={styles.laneRadio} src={on ? radioChecked : radioUnchecked} width={20} height={20} alt="" />
                          <span className={styles.laneText}>
                            <span className={styles.getIt}>{tf.getIt}</span> <span className={styles.promiseLabel}>{p.label}</span>
                          </span>
                          {p.info && (
                            <span
                              role="button"
                              className={styles.laneInfo}
                              onClick={(e) => {
                                e.stopPropagation();
                                nav.push('checkout/promise-info', { title: p.info!.title, textContent: p.info!.description });
                              }}
                            >
                              <img src={infoIcon} width={16} height={16} alt="info" />
                            </span>
                          )}
                          <span className={p.fee ? styles.lanePrice : styles.laneFree}>{p.fee ? `${currency}${formatAmount(p.fee)}` : t.noon_free}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
