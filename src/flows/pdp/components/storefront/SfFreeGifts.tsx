import { OriginIcon, Pressable } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { npbCopy, type PdpFreebie } from '../../data.npB';
import styles from './SfFreeGifts.module.css';

/**
 * "Free gifts for you" (New PDP, Figma Af34gfmhQ1D0wstXUEHSIF · 64:5591) over bappzaar NoonFreebie: white r16 card,
 * 16/700 title, a horizontal rail (px 12, gap 8) of freebie cards — 284 wide when there are several (one fills the row),
 * 1px blue-gray/300 r12, p 8: 56 × 55 image with the sapphire "Free" ribbon, 15/600 title, 12/500 subtitle, blue
 * "View eligible products ›". Tapping a card with eligible products opens them (bappzaar link_url → the catalog);
 * renders nothing without freebies.
 */
export function SfFreeGifts({ items }: { items: PdpFreebie[] }) {
  const nav = useNav();
  if (items.length === 0) return null;
  const several = items.length > 1;
  return (
    <section className={styles.card} aria-label={npbCopy.freeGifts}>
      <h2 className={styles.title}>{npbCopy.freeGifts}</h2>
      <div className={`${styles.rail} nk-hscroll`}>
        {items.map((g) => (
          <Pressable
            key={g.id}
            className={styles.item}
            data-several={several || undefined}
            scale={0.98}
            disabled={!g.eligibleQuery}
            onClick={() => g.eligibleQuery && nav.push('plp/listing', { query: g.eligibleQuery })}
          >
            <span className={styles.media}>
              <img alt="" src={g.image} className={styles.image} draggable={false} />
              <span className={styles.ribbon}>{npbCopy.free}</span>
            </span>
            <span className={styles.text}>
              <span className={styles.name}>{g.title}</span>
              <span className={styles.sub}>{g.subtitle}</span>
              {g.eligibleQuery && (
                <span className={styles.link}>
                  {npbCopy.viewEligible}
                  <OriginIcon name="chevron-right" size={14} color="var(--nk-color-brand-blue)" className="pdp-flip" />
                </span>
              )}
            </span>
          </Pressable>
        ))}
      </div>
    </section>
  );
}
