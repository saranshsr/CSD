import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { OriginIcon } from '../../../../components';
import type { Product } from '../../../../data';
import { tween } from '../../../../motion/presets';
import type { PdpContent } from '../../data';
import { demoAplusImages } from '../../data.npD';
import { Card } from '../Sections';
import styles from './SfProductFeatures.module.css';

/** Storefront copy not in data.ts `copy` (Figma 3499:75700). */
const sfCopy = { title: 'Product Features', viewMore: 'View More', viewLess: 'View Less' } as const;

/** Optional A+ field the lead may add to PdpContent (read defensively until then). */
type SfAplus = { aplusImages?: string[] };

/**
 * Collapsed card height 610 (Figma) − padding 12 × 2 − title 17 − gap 12 = 557 for the body.
 * JS number because motion animates `height` from it to 'auto'.
 */
const COLLAPSED_BODY = 610 - 12 * 2 - 17 - 12;

/**
 * Storefront Product Features / A+ content (Figma 3499:75700): 15/700 title, full-width brand banners (r8), capped at
 * 610 with a white fade and a centred "View More ⌄" (13/600 brand blue). Tap expands to the full height
 * (height → 'auto', tween medium/out) and fades the gradient out; "View Less" collapses again.
 * Content: `content.aplusImages` → else the demo A+ creatives (`demoAplusImages`, New PDP 64:5729), then the description
 * and feature bullets. Nothing to show → null. Short content → no cap, fade or button.
 */
/** `product` stays in the props for callers; the creatives are content, not product photos. */
export function SfProductFeatures({ content }: { content: PdpContent; product?: Product }) {
  const aplus = (content as PdpContent & SfAplus).aplusImages;
  // New PDP 64:5729: the card is A+ brand creatives; without the product's own, the demo creatives (not its gallery photos)
  const images = aplus?.length ? aplus : demoAplusImages;
  const bullets = content.featureBullets;
  const description = content.description;

  const innerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(true);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > COLLAPSED_BODY + 1);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [images.length, bullets.length, description]);

  if (images.length === 0 && bullets.length === 0 && !description) return null;
  const capped = overflows && !open;

  return (
    <Card contentGap={12} className={styles.root}>
      <h3 className={styles.title}>{sfCopy.title}</h3>
      <div className={styles.bodyWrap}>
        <motion.div
          className={styles.body}
          initial={false}
          animate={{ height: overflows && !open ? COLLAPSED_BODY : 'auto' }}
          transition={tween('medium', 'out')}
        >
          <div ref={innerRef} className={styles.inner}>
            {images.map((src, i) => (
              <img key={`${src}-${i}`} alt="" src={src} className={styles.banner} loading="lazy" draggable={false} />
            ))}
            {description && <p className={styles.description}>{description}</p>}
            {bullets.length > 0 && (
              <ul className={styles.bullets}>
                {bullets.map((b) => (
                  <li key={b} className={styles.bullet}>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
        <AnimatePresence initial={false}>
          {capped && (
            <motion.div key="fade" className={styles.fade} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={tween('medium', 'out')}>
              <button type="button" className={styles.more} onClick={() => setOpen(true)} aria-expanded={false}>
                {sfCopy.viewMore}
                <OriginIcon name="chevron-down" size={12} color="var(--nk-color-brand-blue)" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {overflows && open && (
          <button type="button" className={`${styles.more} ${styles.less}`} onClick={() => setOpen(false)} aria-expanded>
            {sfCopy.viewLess}
            <OriginIcon name="chevron-up" size={12} color="var(--nk-color-brand-blue)" />
          </button>
        )}
      </div>
    </Card>
  );
}
