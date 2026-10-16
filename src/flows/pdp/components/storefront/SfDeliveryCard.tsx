import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { HtmlText, MarketplaceTag, OriginIcon, Pressable } from '../../../../components';
import globalMap from '@assets/pdp/storefront/b/global-map.webp';
import { useNav } from '../../../../kit/Navigator';
import { useIsNoonOneMember } from '../../../../kit/membership';
import { tween } from '../../../../motion/presets';
import { currency } from '../../../../data';
import { copy, money, type PdpContent } from '../../data';
import { fasterLanesFor, npbCopy, type FasterLane } from '../../data.npB';
import { Asset } from '../Asset';
import { Card } from '../Sections';
import styles from './SfDeliveryCard.module.css';

/** Storefront copy not in data.ts `copy` (Figma 3499:75275, PDP Redesign 3583:109620). */
const sfCopy = {
  fasterDeliveryOptions: 'Faster Delivery Options',
  freeTodayWith: 'Get it today for free with',
  getBy: 'Get by',
  freeShippingOver: (min: number) => `Free Shipping over ${money(min).replace(/\s+/g, '')}`,
} as const;

type BuyingOption = NonNullable<PdpContent['buyingOptions']>[number];

/**
 * The five Figma variants of "Delivery information" (PDP Redesign xPr9Ln37JGSBGvNtrsyD0y · 3583:109620):
 * - `crossSell` (Variant6, 8238:299758): express box + "Faster Delivery Options" foot, noon One banner, "Other Delivery Options"
 * - `noCrossSell` (No MP cross sell, 3583:109621): the same without "Other Delivery Options"
 * - `market` (3583:110101) / `express` (express only, 3583:110533): one compact row — pill, "Get by {date}", countdown chip
 * - `global` (3583:110179): the compact row with the Global pill + a "Free Shipping over …" strip
 */
export type DeliveryVariant = 'crossSell' | 'noCrossSell' | 'market' | 'express' | 'global';
export const deliveryVariants: DeliveryVariant[] = ['crossSell', 'noCrossSell', 'market', 'express', 'global'];

/**
 * The variant a product's data calls for: other-marketplace options → crossSell; faster lanes (rocket options, or the
 * express lane's Today / Tomorrow upgrades — New PDP 64:5590) → noCrossSell; else the single compact lane.
 */
export function deliveryVariantFor(content: PdpContent): DeliveryVariant {
  const options = content.buyingOptions ?? [];
  if (options.some((o) => o.code !== 'rocket')) return 'crossSell';
  if (fasterLanesFor(content).length) return 'noCrossSell';
  return content.deliveryLogo === 'rocket' || content.deliveryLogo === 'express' ? 'express' : 'market';
}

/** "Order in 21 hrs" / "Order in 45 mins" (the compact rows' chip) */
const orderIn = (min?: number) => (min ? `${copy.orderIn} ${min >= 60 ? `${Math.floor(min / 60)} hrs` : `${min} mins`}` : undefined);

/**
 * Storefront "Delivery information": 15/700 title (+ noon One "member" mark for members in the cross-sell variants),
 * then the variant's body. Same data and behaviour as before: buying-option rows switch SKU (`nav.replace`) or toast,
 * the noon One banner opens the noon One landing, accordions start closed. `variant` defaults to `deliveryVariantFor`.
 */
export function SfDeliveryCard({ content, variant = deliveryVariantFor(content), freeShippingMin = 99 }: { content: PdpContent; variant?: DeliveryVariant; freeShippingMin?: number }) {
  const isMember = useIsNoonOneMember();
  const nav = useNav();
  const options = content.buyingOptions ?? [];
  const faster = fasterLanesFor(content);
  const other = options.filter((o) => o.code !== 'rocket');
  const crossSell = variant === 'crossSell' || variant === 'noCrossSell';
  const chip = orderIn(content.orderWithinMin);

  return (
    <Card contentGap={12}>
      <div className={styles.header}>
        <span className={styles.title}>{copy.deliveryInfo}</span>
        {crossSell && isMember && (
          <span className={styles.member}>
            <Asset name="noonOne" width="var(--nk-layout-pdp-noon-one-w)" height="var(--nk-layout-pdp-noon-one-h)" />
            {copy.member}
          </span>
        )}
      </div>

      {crossSell ? (
        <div className={styles.stack}>
          <div className={styles.express} data-no-foot={faster.length === 0 || undefined}>
            <div className={styles.expressBody}>
              <div className={styles.expressRow}>
                {content.deliveryLogo === 'rocket' ? (
                  <Asset name="rocketPdp" width="var(--nk-layout-pdp-rocket-w)" height="var(--nk-layout-pdp-icon20)" />
                ) : (
                  <Asset name="expressPdp" className={styles.expressLogo} />
                )}
                <HtmlText value={content.delivery.replace(/^Get it( by)?/i, npbCopy.getBy)} className={styles.estimate} />
                {chip && <span className={`${styles.chip} ${styles.chipEnd}`}>{chip}</span>}
              </div>
            </div>
            {faster.length > 0 && (
              <Accordion title={sfCopy.fasterDeliveryOptions} variant="foot" defaultOpen>
                <FasterRows lanes={faster} />
              </Accordion>
            )}
          </div>
          <Pressable className={styles.banner} scale={0.98} onClick={() => nav.push('noonone/landing', { source: '/pdp' })} aria-label={`${sfCopy.freeTodayWith} noon One`}>
            <span aria-hidden className={styles.streak} />
            <span className={styles.bannerText}>{sfCopy.freeTodayWith}</span>
            <Asset name="noonOne" width="var(--nk-layout-pdp-noon-one-w)" height="var(--nk-layout-pdp-noon-one-h)" />
            <span className={styles.bannerChevron}>
              <OriginIcon name="chevron-right" size={20} color="var(--nk-color-bg-subtle)" className="pdp-flip" />
            </span>
          </Pressable>
          {variant === 'crossSell' && (
            <Accordion title={copy.otherDeliveryOptions} variant="box">
              {/* other-marketplace lanes; without any, the product's own lane is the one other option */}
              <OptionRows options={other.length ? other : [{ code: content.deliveryLogo === 'rocket' ? 'rocket' : 'express', html: content.delivery, price: 0 }]} />
            </Accordion>
          )}
        </div>
      ) : (
        <div className={styles.compact} data-bordered={variant === 'global' || undefined} data-strip={variant === 'global' || undefined}>
          <div className={styles.compactRow}>
            <span className={styles.compactLead}>
              {variant === 'express' ? (
                <Asset name="expressPdp" className={styles.expressLogo} />
              ) : (
                <MarketplaceTag kind={variant === 'global' ? 'global' : 'market'} height={20} />
              )}
              <HtmlText value={content.delivery.replace(/^Get it( by)?/i, sfCopy.getBy)} className={styles.getBy} />
            </span>
            {chip && <span className={styles.chip}>{chip}</span>}
          </div>
          {variant === 'global' && (
            <Pressable className={styles.strip} scale={1} onClick={() => nav.toast(sfCopy.freeShippingOver(freeShippingMin))}>
              <img aria-hidden alt="" src={globalMap} className={styles.stripMap} />
              <span className={styles.stripText}>{sfCopy.freeShippingOver(freeShippingMin)}</span>
              <span className={styles.stripChevron}>
                <OriginIcon name="chevron-right" size={20} color="var(--nk-color-text-primary)" className="pdp-flip" />
              </span>
            </Pressable>
          )}
        </div>
      )}
    </Card>
  );
}

/** NoonBuyingOption rows (same behaviour as DeliveryCard: another SKU → replace, else toast). */
function OptionRows({ options }: { options: BuyingOption[] }) {
  const nav = useNav();
  return (
    <div className={styles.rows}>
      {options.map((o) => (
        <Pressable
          key={o.code + o.html}
          className={styles.row}
          onClick={() => (o.productId ? nav.replace('pdp/detail', { productId: o.productId }) : nav.toast(copy.otherDeliveryOptions))}
        >
          <span className={styles.rowText}>
            <Asset name={o.code === 'rocket' ? 'rocketPdp' : 'expressPdp'} className={o.code === 'rocket' ? styles.rowRocket : styles.expressLogo} />
            <HtmlText value={o.html} className={styles.rowHtml} />
          </span>
          <span className={styles.rowPrice}>
            {o.price > 0 ? money(o.price) : 'Free'}
            <OriginIcon name="chevron-right" size={16} color="var(--nk-color-text-primary)" className="pdp-flip" />
          </span>
        </Pressable>
      ))}
    </div>
  );
}

/**
 * "Faster Delivery Options" body (New PDP 64:5590): a rule, then "Get it **Today**" / "Get it **Tomorrow** [before 12pm]"
 * rows (20 high, gap 10) with "+ ₳ 14.00" at the end, and a white "Select these options on checkout" callout. The lanes are
 * chosen at checkout; a lane that is another offer (bappzaar buying option) still switches to it (`nav.replace`).
 */
function FasterRows({ lanes }: { lanes: FasterLane[] }) {
  const nav = useNav();
  return (
    <>
      <div className={styles.lanes}>
        <span className={styles.lanesRule} aria-hidden />
        {lanes.map((l) => (
          <div
            key={l.day + (l.note ?? '')}
            className={styles.lane}
            role={l.productId ? 'button' : undefined}
            tabIndex={l.productId ? 0 : undefined}
            onClick={l.productId ? () => nav.replace('pdp/detail', { productId: l.productId! }) : undefined}
          >
            <span className={styles.laneText}>
              {l.offer ? 'Get' : 'Get it'} <b>{l.day}</b>
              {l.note && <span className={styles.laneNote}> {l.note}</span>}
            </span>
            <span className={styles.lanePrice}>
              {!l.offer && '+ '}
              <span className={styles.laneCurrency}>{currency}</span> {l.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.callout}>
        <OriginIcon name="info-circle" size={16} color="var(--nk-color-text-secondary)" />
        <span className={styles.calloutText}>{npbCopy.selectOnCheckout}</span>
      </div>
    </>
  );
}

/** Collapsible (motion.md "Collapsibles"): chevron rotates 180°, body height 0 → auto with opacity. "Faster Delivery Options" starts open (New PDP). */
function Accordion({ title, variant, defaultOpen = false, children }: { title: string; variant: 'foot' | 'box'; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const t = tween('fast', 'out');
  return (
    <div className={variant === 'foot' ? styles.foot : styles.box}>
      <button type="button" className={styles.accHead} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={styles.accTitle}>{title}</span>
        <motion.span className={styles.accChevron} initial={false} animate={{ rotate: open ? 180 : 0 }} transition={t}>
          <OriginIcon name="chevron-down" size={20} color="var(--nk-color-text-primary)" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={t} style={{ overflow: 'hidden' }}>
            <div className={variant === 'foot' ? styles.footBody : styles.accBody}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
