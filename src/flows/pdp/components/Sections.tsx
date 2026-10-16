import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { layout } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { useIsNoonOneMember } from '../../../kit/membership';
import { VipPreference } from './VipPreference';
import { ProductImage } from '../../../components';
import { useDemoStore } from '../../../kit/DemoStore';
import { leafName } from '../../../data';
import { products, type Product } from '../../../data';
import { copy, money, type PdpContent } from '../data';
import { nudgeIcons } from './RecoCard';
import { pdpTokens } from '../tokens';
import { Asset, assets as assetsUrl, DashedLine } from './Asset';
import { starTint as starTintFor } from './Stars';
import styles from '../pdp.module.css';

/** NoonSectionCard: white, r16, padding 12, margin 0 12 12; optional 16/700 charcoalNavy header. `gap` = the containerStyles gap. */
export function Card({ title, gap, contentGap, className, children }: { title?: string; gap?: 8 | 12 | 16 | 24; contentGap?: 8 | 12 | 16 | 24; className?: string; children: ReactNode }) {
  const g = (n?: number) => (n ? styles[`gap${n}`] : '');
  return (
    <section className={`${styles.card} ${g(gap)} ${className ?? ''}`}>
      {title && <h3 className={styles.cardTitle}>{title}</h3>}
      <div className={g(contentGap)} style={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </section>
  );
}

/** Delivery Information: header (22h) + noon One "member"; NoonDeliveryInfoItem (express logo + estimate, countdown chip). */
export function DeliveryCard({ content }: { content: PdpContent }) {
  // isLoyalCustomer → "member" badge; non-members get NoonVIPPreference instead (offer.shipping_preferences_vip)
  const isMember = useIsNoonOneMember();
  const h = content.orderWithinMin ? Math.floor(content.orderWithinMin / 60) : 0;
  const m = content.orderWithinMin ? content.orderWithinMin % 60 : 0;
  return (
    <Card contentGap={12}>
      <div className={styles.deliveryHeader}>
        <span className={styles.cardTitle}>{copy.deliveryInfo}</span>
        {isMember && (
          <span className={styles.member}>
            <Asset name="noonOne" width="var(--nk-layout-pdp-noon-one-w)" height="var(--nk-layout-pdp-noon-one-h)" />
            {copy.member}
          </span>
        )}
      </div>
      <div className={styles.deliveryItem}>
        <div className={styles.deliveryWrap}>
          {content.deliveryLogo === 'rocket' ? (
            <Asset name="rocketPdp" width="var(--nk-layout-pdp-rocket-w)" height="var(--nk-layout-pdp-icon20)" />
          ) : (
            <Asset name="expressPdp" width="var(--nk-layout-pdp-express-w)" height="var(--nk-layout-pdp-express-h)" />
          )}
          <span className={styles.deliveryText} dangerouslySetInnerHTML={{ __html: content.delivery }} />
        </div>
        {content.orderWithinMin && (
          <span className={styles.countdown}>
            {copy.orderIn} {h > 0 && `${copy.hours(h)} `}
            {m > 0 && `${copy.minutes(m)} `}
          </span>
        )}
      </div>
      {content.buyingOptions && content.buyingOptions.length > 0 && <BuyingOptions options={content.buyingOptions} />}
      {!isMember && <VipPreference />}
    </Card>
  );
}

/** NoonAccordion "Other Delivery Options" (initiallyOpen, showSeparator, slateBlueGray title) + NoonBuyingOption rows. */
function BuyingOptions({ options }: { options: NonNullable<PdpContent['buyingOptions']> }) {
  const nav = useNav();
  return (
    <Accordion title={copy.otherDeliveryOptions} initiallyOpen separator muted bodyClassName={styles.buyOptionBody}>
      {options.map((o, i) => (
        <div key={o.code}>
          {i > 0 && <div className={styles.buyOptionSep} />}
          <button type="button" className={styles.buyOption} onClick={() => (o.productId ? nav.replace('pdp/detail', { productId: o.productId }) : nav.toast(copy.otherDeliveryOptions))}>
            <span className={styles.buyOptionText}>
              <span className={o.code === 'rocket' ? styles.rocketText : styles.expressText} dangerouslySetInnerHTML={{ __html: o.html }} />
              <Asset name={o.code === 'rocket' ? 'rocketPdp' : 'expressPdp'} width={o.code === 'rocket' ? 'var(--nk-layout-pdp-rocket-w)' : 'var(--nk-layout-pdp-express-w)'} height="var(--nk-layout-pdp-icon20)" />
            </span>
            <span className={styles.buyOptionPrice}>
              <span className={styles.buyOptionSale}>{money(o.price)}</span>
              <Asset name="arrowUpRight" size={12} flip />
            </span>
          </button>
        </div>
      ))}
    </Accordion>
  );
}

/** NoonCategoryBestSeller (bottom CTA, SD best_seller_explore_cta): white → mintCyanLight card, 32px icon, html 14, darkGreenTeal chevron. */
export function CategoryBestSellerCta({ content }: { content: PdpContent }) {
  const nav = useNav();
  const cta = content.bestSellerCta;
  if (!cta) return null;
  return (
    <section className={`${styles.card} ${styles.bestSellerCta}`}>
      <button type="button" className={styles.bestSellerCtaRow} onClick={() => nav.push('plp/listing', { query: leafName(cta.categoryId) })}>
        <span className={styles.bestSellerCtaIcon}>
          <img alt="" src={nudgeIcons.rank} />
        </span>
        <span className={styles.bestSellerCtaText}>
          <span dangerouslySetInnerHTML={{ __html: cta.html }} />
          {cta.subText && <span className={styles.bestSellerCtaSub}>{cta.subText}</span>}
        </span>
        <span className={styles.bestSellerCtaArrow}>
          <Asset name="rightChevron" size={20} tint="var(--nk-color-best-seller-tag)" flip />
        </span>
      </button>
    </section>
  );
}

/**
 * NoonFrequentlyBoughtTogether (white card, header, gap 12 / 8): 100×140 tiles with a 28px check circle (top/end −8),
 * "+" between tiles, then "Buy N items together" (skyBlue outline, r8) → adds all selected → "Added to cart".
 */
export function FbtCard({ ids }: { ids?: string[] }) {
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
  const disabled = selected.length === 0;
  return (
    <Card title={copy.frequentlyBought} gap={12} contentGap={8}>
      <div className={styles.fbtList}>
        {items.map((p, i) => (
          <div key={p.id} className={styles.fbtItem} data-gap={i > 0 || undefined}>
            {i > 0 && (
              <span className={styles.fbtPlus}>
                <Asset name="frequentlyBoughtPlus" size={24} />
              </span>
            )}
            <button type="button" className={styles.fbtImageBtn} onClick={() => toggle(p.id)} aria-pressed={selected.includes(p.id)}>
              <span className={styles.fbtImage}>
                <ProductImage product={p} width="100%" height="100%" emojiScale={0.5} />
                <span className={styles.fbtImageOverlay} />
              </span>
              <span className={styles.fbtCheck}>
                <Asset name={selected.includes(p.id) ? 'checkboxBlueChecked' : 'checkboxGrey'} size={24} />
              </span>
            </button>
            <div className={styles.fbtInfo}>
              <span className={styles.fbtTitle}>
                {p.brand && p.brand !== 'Generic' ? `${p.brand} ` : null}
                {p.title}
              </span>
              <span className={styles.fbtPrice}>{money(p.price)}</span>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className={styles.buyTogether} data-added={added || undefined} disabled={disabled} onClick={buy}>
        {added && <Asset name="addedToCart" size={20} className={styles.buyTogetherIcon} />}
        {added ? copy.addedToCart : copy.buyTogether(selected.length)}
      </button>
    </Card>
  );
}

/** NoonPaymentsForYou: SD title; 90×60 logo + html message; >1 item → peeking width. */
export function PaymentsCard({ content }: { content: PdpContent }) {
  const nav = useNav();
  if (!content.payments) return null;
  const { sectionPad, containerSpacing, gap, peek } = pdpTokens.payments;
  const full = layout.deviceWidth - 2 * sectionPad - 2 * containerSpacing;
  const width = content.payments.items.length > 1 ? full - gap - peek : full;
  return (
    <Card title={content.payments.title} gap={12}>
      <div className={`${styles.hscroll} ${styles.payments}`}>
        {content.payments.items.map((it) => (
          <button key={it.html} type="button" className={styles.paymentItem} style={{ width }} onClick={() => nav.toast(`${it.logo} — learn more`)}>
            <img alt="" src={it.logo} className={styles.paymentImage} />
            <span className={styles.paymentText} dangerouslySetInnerHTML={{ __html: it.html }} />
          </button>
        ))}
      </div>
    </Card>
  );
}

/** NoonPdpReinforcement (SD offer_badges ≥ 2): 28px icon + 12/600 text tiles; 3 visible (3.5 when ≥ 4). */
export function ReinforcementCard({ content }: { content: PdpContent }) {
  const items = content.offerBadges;
  if (items.length < 2) return null;
  const { inset, gap, manyVisible } = pdpTokens.reinforcement;
  const visible = items.length >= 4 ? manyVisible : items.length;
  const width = (layout.deviceWidth - inset * 2 - gap * (visible - 1)) / visible;
  return (
    <Card>
      <div className={`${styles.hscroll} ${styles.badges}`}>
        {items.map((b) => (
          <div key={b.title} className={styles.badge} style={{ width }}>
            <Asset name={b.icon} size={28} />
            <span className={styles.badgeText}>{b.title}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** NoonAccordion: #F9F9FB header (16·12), 14/600 black title, 16px chevron rotates 180°; body height animates 150ms. */
function Accordion({ title, children, initiallyOpen, separator, muted, bodyClassName }: { title: string; children: ReactNode; initiallyOpen?: boolean; separator?: boolean; muted?: boolean; bodyClassName?: string }) {
  const [open, setOpen] = useState(!!initiallyOpen);
  const ms = pdpTokens.accordionMs / 1000;
  return (
    <div className={styles.accordion}>
      <button type="button" className={styles.accordionHead} data-separator={(separator && open) || undefined} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={styles.accordionTitle} data-muted={muted || undefined}>
          {title}
        </span>
        <motion.span className={styles.accordionChevron} initial={false} animate={{ rotate: open ? 180 : 0 }} transition={{ duration: ms }}>
          <Asset name="chevronDown" size={16} tint={muted ? 'var(--nk-color-text-muted)' : undefined} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: ms }} style={{ overflow: 'hidden' }}>
            <div className={bodyClassName ?? styles.accordionBody}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** NoonProductOverview (inside NoonSectionCard "Product Overview", gap 12 / content gap 8). AI summary = SD, not shown. */
export function OverviewCard({ content }: { content: PdpContent }) {
  return (
    <Card title={copy.productOverview} gap={12} contentGap={8}>
      <Accordion title={copy.description}>
        <p className={styles.overviewText}>{content.description}</p>
      </Accordion>
      {content.featureBullets.length > 0 && (
        <Accordion title={copy.highlights}>
          {content.featureBullets.map((f) => (
            <div key={f} className={styles.feature}>
              <Asset name="circlePoint" width="var(--nk-space-s4)" height="var(--nk-space-s4)" className={styles.featureDot} />
              <span className={styles.featureText}>{f}</span>
            </div>
          ))}
        </Accordion>
      )}
      {content.specs.length > 0 && (
        <Accordion title={copy.specifications}>
          {content.specs.map(([k, v]) => (
            <div key={k} className={styles.specRow}>
              <span className={styles.specName}>{k}</span>
              <span className={styles.specValue}>{v}</span>
            </div>
          ))}
        </Accordion>
      )}
    </Card>
  );
}

/** NoonShippingInfo in "Additional Information" (gap 12 / content gap 8): warranty · returns · TDRA rows. */
export function AdditionalInfoCard({ content }: { content: PdpContent }) {
  const nav = useNav();
  return (
    <Card title={copy.additionalInfo} gap={12} contentGap={8}>
      {content.additional.map((a) => (
        <button key={a.text} type="button" className={styles.shipItem} onClick={() => nav.toast(a.text)}>
          <Asset name={a.icon} size={22} />
          <span className={styles.shipText}>{a.text}</span>
          <Asset name="rightChevron" size={20} flip />
        </button>
      ))}
    </Card>
  );
}

/** NoonSeller + NoonDashedBorder + NoonOffers (content gap 16). */
export function SellerCard({ content, onOffers }: { content: PdpContent; onOffers: () => void }) {
  const nav = useNav();
  const s = content.seller;
  return (
    <Card contentGap={16}>
      <button type="button" className={styles.seller} onClick={() => nav.toast(`${copy.soldBy} ${s.name}`)}>
        <div className={styles.sellerRow}>
          <img alt="" src={assetsUrl.sellerLogo} className={styles.sellerLogo} />
          <div className={styles.sellerName}>
            <div className={styles.sellerNameRow}>
              <span className={styles.soldBy}>
                {copy.soldBy} <b>{s.name}</b>
              </span>
              <Asset name="rightChevron" size={20} flip />
            </div>
            <div className={styles.sellerRatings}>
              <span className={styles.sellerScore}>
                <span>
                  <Asset name="ratingStar" size={11} tint={starTintFor(s.rating)} />
                  {s.rating.toFixed(1)}
                </span>
              </span>
              <span className={styles.positive}>
                <span className={styles.positivePct}>{copy.positive(s.positive)}</span>
                <span className={styles.positiveLabel}>{copy.sellerRatings}</span>
              </span>
            </div>
          </div>
        </div>
        <div className={styles.metrics}>
          {s.metrics.map((m) => (
            <span key={m.title} className={styles.metric}>
              <Asset name={m.kind === 'years' ? 'verified' : m.kind === 'percent' ? 'returnable' : 'warranty'} size={16} />
              <span className={styles.metricText}>
                {m.title}
                {m.kind === 'years' && m.value !== undefined && <span className={styles.metricYears}>{copy.partnerSince(m.value)}</span>}
                {m.kind === 'percent' && m.value !== undefined && (
                  <span className={styles.metricValue} style={{ color: m.color }}>
                    {copy.percent(m.value)}
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>
      </button>
      <DashedLine color="var(--nk-palette-dashed-border-default)" />
      <button type="button" className={styles.offers} onClick={onOffers}>
        <Asset name="offer" size={16} />
        <span className={styles.offersText}>{copy.moreOffers}</span>
        <Asset name="rightChevron" size={20} flip />
      </button>
    </Card>
  );
}
