import { DashedDivider, MaskIcon } from '../../../../components';
import salesReturn16 from '@assets/pdp/new-pdp/icons/sales-return-filled-16.svg';
import solidStar16 from '@assets/pdp/new-pdp/icons/solid-star-16.svg';
import ratingStar from '@assets/pdp/new-pdp/icons/rating-star-12.svg';
import microTag from '@assets/pdp/new-pdp/icons/micro-tag-16.svg';
import chevron16 from '@assets/pdp/new-pdp/icons/mini-chevron-right-16.svg';
import chevron20 from '@assets/pdp/new-pdp/icons/mini-chevron-right-20.svg';
import appleSellerLogo from '@assets/pdp/new-pdp/seller-logo-apple.png';
import { useNav } from '../../../../kit/Navigator';
import { copy, money, type PdpContent } from '../../data';
import { assets as assetsUrl } from '../Asset';
import { Card } from '../Sections';
import styles from './SfSellerCard.module.css';

type Seller = PdpContent['seller'];
type Metric = Seller['metrics'][number];
/** Optional Storefront fields the lead may add to PdpContent['seller'] (read defensively until then). */
type SfSellerExtras = { subtitle?: string; offerCount?: number; offerFrom?: number };

/** Storefront copy not in data.ts `copy` (Figma 3499:75647). */
const sfCopy = {
  positiveLabel: 'Positive',
  offersFrom: (n: number) => `${n} ${n === 1 ? 'offer' : 'offers'} from other sellers from`,
} as const;

type ChipKind = 'returns' | 'ratings' | 'partner' | 'described' | 'other';
const chipKind = (m: Metric): ChipKind =>
  m.kind === 'years' ? 'partner' : /return/i.test(m.title) ? 'returns' : /rating/i.test(m.title) ? 'ratings' : m.kind === 'percent' || /described|shown/i.test(m.title) ? 'described' : 'other';

/** Trust-chip glyph, the exact New PDP 64:5728 vectors: lsicon:sales-return-filled for low returns, solid/star for the others. */
const chipIcons: Record<ChipKind, string> = { returns: salesReturn16, ratings: solidStar16, partner: solidStar16, described: solidStar16, other: solidStar16 };
const metricIcon = (m: Metric): string => chipIcons[chipKind(m)];
/** Seller logo: the Figma 64:5728 image (Apple mark) for an official Apple store, else NoonSeller's default shop glyph. */
const sellerLogoFor = (content: PdpContent) => (content.officialStore && content.brand === 'Apple' ? appleSellerLogo : assetsUrl.sellerLogo);

/** Figma chip order: low returns · recent ratings · partner since · item as described. */
const chipOrder = (m: Metric) => ['returns', 'ratings', 'partner', 'described', 'other'].indexOf(chipKind(m));

/** "{n} offers from other sellers from Đ{min}": seller.offerCount / offerFrom, else the buying options; null → generic copy. */
function offersSummary(content: PdpContent): { count: number; from: number } | null {
  const s = content.seller as Seller & SfSellerExtras;
  if (s.offerCount && s.offerFrom !== undefined) return { count: s.offerCount, from: s.offerFrom };
  const opts = content.buyingOptions ?? [];
  if (opts.length === 0) return null;
  return { count: opts.length, from: Math.min(...opts.map((o) => o.price)) };
}

/**
 * Seller widget (New PDP 64:5728 / Storefront 3499:75647): white r16 card with shadow/sm; 48px seller logo (NoonSeller
 * `seller-logo.webp`, 1px #F3F5F7 r10) + "Sold by {name}" ›, rating pill "4.3 (128)" and "74% Positive Seller Ratings";
 * wrapping trust chips (r18); brand subtitle row; dashed divider; alice-blue offers row with the tag glyph.
 * Replaces SellerCard (same props): the seller block toasts the seller name, the offers row calls `onOffers`.
 */
export function SfSellerCard({ content, onOffers }: { content: PdpContent; onOffers: () => void }) {
  const nav = useNav();
  const s = content.seller as Seller & SfSellerExtras;
  const subtitle = s.subtitle ?? (content.officialStore ? `Official ${content.brand} partner on noon` : undefined);
  const offers = offersSummary(content);
  return (
    <Card className={styles.root} contentGap={16}>
      <div className={styles.top}>
        <button type="button" className={styles.head} onClick={() => nav.toast(`${copy.soldBy} ${s.name}`)}>
          <span className={styles.logo}>
            <img alt="" src={sellerLogoFor(content)} className={styles.logoImg} />
          </span>
          <span className={styles.headText}>
            <span className={styles.nameRow}>
              {/* flex drops the space between items: keep it inside the label (Figma "Sold by Anker UAE Inc.") */}
              <span className={styles.soldBy}>{`${copy.soldBy} `}</span>
              <span className={styles.name}>{s.name}</span>
              <MaskIcon src={chevron16} size={16} color="var(--nk-color-text-primary)" />
            </span>
            <span className={styles.pills}>
              <span className={styles.rating}>
                <MaskIcon src={ratingStar} width={12} height={11.5} color="var(--nk-palette-emerald-green)" />
                <span className={styles.ratingText}>
                  <span className={styles.ratingScore}>{s.rating.toFixed(1)}</span>
                  {s.ratingCount !== undefined && <span className={styles.ratingCount}> ({s.ratingCount})</span>}
                </span>
              </span>
              <span className={styles.positive}>
                <span>
                  <span className={styles.positivePct}>{copy.percent(s.positive)}</span> <span className={styles.positiveWord}>{sfCopy.positiveLabel}</span> {copy.sellerRatings}
                </span>
              </span>
            </span>
          </span>
        </button>
        <div className={styles.trust}>
          {s.metrics.length > 0 && (
            <div className={styles.chips}>
              {[...s.metrics].sort((a, b) => chipOrder(a) - chipOrder(b)).map((m) => (
                <span key={m.title} className={styles.chip}>
                  <MaskIcon src={metricIcon(m)} size={16} color="var(--nk-color-text-muted)" />
                  <span className={styles.chipText}>
                    {m.title}
                    {m.kind === 'years' && m.value !== undefined && <> {copy.partnerSince(m.value)}</>}
                    {m.kind === 'percent' && m.value !== undefined && (
                      <>
                        {' '}
                        <span className={styles.chipValue}>{copy.percent(m.value)}</span>
                      </>
                    )}
                  </span>
                </span>
              ))}
            </div>
          )}
          {subtitle && (
            <div className={styles.subtitle}>
              <span className={styles.subtitleText}>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
      <DashedDivider inset={0} color="var(--nk-color-border-subtle)" />
      <div className={styles.offersWrap}>
        <button type="button" className={styles.offers} onClick={onOffers}>
          <MaskIcon src={microTag} size={16} color="var(--nk-color-text-muted)" style={{ transform: 'scaleX(-1)' }} />
          <span className={styles.offersText}>
            {offers ? (
              <>
                {sfCopy.offersFrom(offers.count)} <span className={styles.offersPrice}>{money(offers.from)}</span>
              </>
            ) : (
              copy.moreOffers
            )}
          </span>
          <MaskIcon src={chevron20} size={20} color="var(--nk-color-text-primary)" />
        </button>
      </div>
    </Card>
  );
}
