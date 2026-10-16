import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Divider, OriginIcon } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import type { Product } from '../../../../data';
import { spring } from '../../../../motion/presets';
import { abbreviate, colorName, copy, score, type PdpContent } from '../../data';
import { npdCopy } from '../../data.npD';
import { Asset } from '../Asset';
import { Card } from '../Sections';
import styles from './SfReviewsCard.module.css';

type Review = PdpContent['reviews'][number];

/** Storefront copy that is not in data.ts `copy` yet (Figma 3499:75703). */
const sfCopy = {
  avgRating: (count: string) => `Avg. rating based on ${count} reviews from trusted sources`,
  aiTitle: (count: string) => `${count} reviews,`,
  photoReviews: (n: number) => `Photo Reviews (${n})`,
  topReviews: (n: string) => `Top Reviews (${n})`,
  verifiedBuy: 'Verified Buy',
  fromTrustedSource: 'from trusted source',
  viewProduct: 'View product',
  translate: 'Translate to عربي',
};

/** Figma "Stars": 5 × `size` star-filled in Emerald/800, half star for a .5 remainder, empty in border grey. */
export function SfStars({ rating, size }: { rating: number; size: 16 | 20 | 22 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const filled = rating - full >= 0.75 ? full + 1 : full;
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <OriginIcon
          key={i}
          name={i < filled ? 'star-filled' : half && i === filled ? 'star-half-filled' : 'star-filled'}
          size={size}
          color={i < filled || (half && i === filled) ? 'var(--nk-palette-emerald-green)' : 'var(--nk-color-border)'}
        />
      ))}
    </span>
  );
}

/**
 * Storefront "Product Review Card" (3499:75703): white r16 card, p12, sections 24 apart —
 * rating summary (15/700 title, 22/800 score + 22 stars, 12/18 note + info) and the collapsible noon AI summary ·
 * Photo Reviews rail (92.8×116) · Top Reviews (bordered r16 review cards) · divider + "All customer reviews".
 * Replaces ReviewsCard (same props).
 */
export function SfReviewsCard({ product, content }: { product: Product; content: PdpContent }) {
  const nav = useNav();
  const count = abbreviate(content.commentCount);
  const photos = content.reviews.flatMap((r) => r.images ?? []);
  return (
    <Card contentGap={24}>
      <div className={styles.group}>
        <div className={styles.summary}>
          <h3 className={styles.title}>{copy.reviewsTitle}</h3>
          <div className={styles.overview}>
            <div className={styles.scoreRow}>
              <span className={styles.score}>{score(product.rating)}</span>
              <SfStars rating={Number(score(product.rating))} size={22} />
            </div>
            <span className={styles.note}>
              {sfCopy.avgRating(abbreviate(product.ratingCount))}
              <OriginIcon name="info-circle" size={14} color="var(--nk-color-text-muted)" />
            </span>
          </div>
        </div>
        {content.aiSummary && content.aiSummary.length > 0 && <SfAiSummary items={content.aiSummary} count={count} />}
      </div>

      {photos.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.title}>{sfCopy.photoReviews(photos.length)}</h3>
          <div className={styles.photoRail}>
            {photos.map((src, i) => (
              <span key={`${src}-${i}`} className={styles.photo}>
                <img alt="" src={src} />
              </span>
            ))}
          </div>
        </div>
      )}

      {content.reviews.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.title}>{sfCopy.topReviews(count)}</h3>
          {content.reviews.map((r) => (
            <SfReviewItem key={r.name} review={r} fallbackChips={purchasedVariant(product)} />
          ))}
          {content.commentCount > 3 && (
            <div className={styles.allReviews}>
              <Divider />
              <button type="button" className={styles.allReviewsBtn} onClick={() => nav.toast(copy.allCustomerReviews)}>
                {copy.allCustomerReviews}
                <OriginIcon name="chevron-right" size={12} color="var(--nk-color-brand-blue)" />
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/** "Highlights" (AI summary): r8 clip; 42h gradient title row (gradient text + sparkle + chevron), 1px gap, bullet list. Tap toggles. */
function SfAiSummary({ items, count }: { items: string[]; count: string }) {
  const [open, setOpen] = useState(true);
  return (
    <button type="button" className={styles.ai} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
      <span className={styles.aiHead}>
        <span className={styles.aiTitle}>
          <span className={styles.aiText}>{sfCopy.aiTitle(count)}</span>
          {/* New PDP 64:5733: "summarised by" in solid indigo 92%, " noon AI" in the gradient; no chevron (the row still toggles) */}
          <span className={styles.aiText}>
            <span className={styles.aiBy}>{npdCopy.aiSummarisedBy}</span>
            {npdCopy.aiNoonAi}
          </span>
          <Asset name="aiSummarySparkle" size={12} />
        </span>
      </span>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span key="body" className={styles.aiBodyWrap} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={spring.gentle}>
            <span className={styles.aiBody}>
              {items.map((t) => (
                <span key={t} className={styles.aiItem}>
                  <span className={styles.aiBullet} aria-hidden />
                  <span>{t}</span>
                </span>
              ))}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** What a verified buyer bought, for reviews without their own variant chips: the product's model / colour / storage / version. */
function purchasedVariant(p: Product): string[] {
  const a = p.attributes;
  if (a) return [a.model, a.color, a.storage, a.version].filter((v): v is string => !!v);
  return [p.colors?.[0] ? colorName(p.colors[0]) : undefined, p.sizes?.[0]].filter((v): v is string => !!v);
}

/** "Review Card#2": 1px border r16, pt14 px12 pb12, gap 12 — user row + Verified Buy · chips · title / comment / translate · photos · Helpful. */
function SfReviewItem({ review, fallbackChips = [] }: { review: Review; fallbackChips?: string[] }) {
  const nav = useNav();
  const [voted, setVoted] = useState(false);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    if (ref.current && !open) setOverflows(ref.current.scrollHeight > ref.current.clientHeight + 1);
  }, [open, review.body]);
  const own = review.variants ?? (review.variant ? [review.variant] : []);
  const chips = own.length ? own : review.verified ? fallbackChips : [];
  const helpful = review.helpful + (voted ? 1 : 0);
  return (
    <article className={styles.review}>
      <div className={styles.user}>
        <div className={styles.nameRating}>
          <span className={styles.name}>{review.name}</span>
          <span className={styles.meta}>
            <SfStars rating={review.rating} size={16} />
            {!review.verified && (
              <span>
                <span className={styles.dot}>•</span> {sfCopy.fromTrustedSource}
              </span>
            )}
            <span>
              <span className={styles.dot}>•</span> {review.ago}
            </span>
          </span>
        </div>
        {review.verified && (
          <span className={styles.verified}>
            <OriginIcon name="verified" filled size={12} color="var(--nk-palette-emerald-green)" />
            {sfCopy.verifiedBuy}
          </span>
        )}
      </div>

      {chips.length > 0 && (
        <div className={styles.chips}>
          {chips.map((v) => (
            <span key={v} className={styles.chip}>
              {v}
            </span>
          ))}
          <button type="button" className={`${styles.chip} ${styles.chipLink}`} onClick={() => nav.toast(chips.join(' · '))}>
            {sfCopy.viewProduct}
            <OriginIcon name="chevron-right" size={10} color="var(--nk-color-brand-blue)" />
          </button>
        </div>
      )}

      <div className={styles.reviewBody}>
        <div className={styles.reviewText}>
          <span className={styles.reviewTitle}>{review.title}</span>
          <div className={styles.feedback}>
            {/* Figma: two lines, then "… more" inline at the end of the second; open → the full text with "Less" after it */}
            <p ref={ref} className={styles.comment} data-clamped={!open || undefined}>
              {review.body}
              {open && (
                <>
                  {' '}
                  <button type="button" className={styles.more} onClick={() => setOpen(false)}>
                    {npdCopy.less}
                  </button>
                </>
              )}
            </p>
            {overflows && !open && (
              <button type="button" className={`${styles.more} ${styles.moreInline}`} onClick={() => setOpen(true)}>
                <span className={styles.ellipsis}>.. </span>
                {npdCopy.more}
              </button>
            )}
          </div>
          <button type="button" className={styles.translate} onClick={() => nav.toast(sfCopy.translate)}>
            {sfCopy.translate}
          </button>
        </div>
        {review.images && review.images.length > 0 && (
          <div className={styles.reviewPhotos}>
            {review.images.map((src) => (
              <span key={src} className={styles.reviewPhoto}>
                <img alt="" src={src} />
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <motion.button type="button" className={styles.helpful} data-voted={voted || undefined} whileTap={{ scale: 0.95 }} transition={spring.press} onClick={() => setVoted((v) => !v)} aria-pressed={voted}>
          {/* New PDP 64:4354 / 64:4357: 12px thumb, outline by default, filled once voted; label stays Blue-Gray/1000 */}
          <OriginIcon name="thumbs-up" filled={voted} size={12} color="var(--nk-color-text-strong)" />
          {`${copy.helpful}${helpful ? ` (${helpful})` : ''}`}
        </motion.button>
      </div>
    </article>
  );
}
