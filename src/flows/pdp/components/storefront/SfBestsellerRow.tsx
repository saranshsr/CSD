import { MaskIcon, Pressable } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { leafName } from '../../../../data';
import type { PdpContent } from '../../data';
import badge from '@assets/pdp/new-pdp/bestseller-badge.svg';
import chevronRight from '@assets/pdp/new-pdp/icons/mini-chevron-right-20.svg';
import styles from './SfBestsellerRow.module.css';

export const sfBestsellerCopy = {
  bestseller: (rank?: number) => (rank ? `Bestseller #${rank}` : 'Bestseller'), // Figma 3499:75642
  in: 'in', // 3499:75643
  explore: 'Explore other bestsellers', // 3499:75645 (Figma typo "bestellers")
};

/** "#38" from the SD best_seller_tag html (`<b>#38</b> in <a>…</a>`), when there is one. */
const rankOf = (html?: string) => {
  const m = html?.match(/#(\d+)/);
  return m ? Number(m[1]) : undefined;
};

/**
 * Bestseller row (New PDP 64:5727, Storefront 3499:75632): r16 card (1px white border, white → emerald/50 gradient),
 * padding 6 · 12 · 6 · 4, gap 10; a 52 × 50 medal frame with the 32px streamline star badge (#0A4F4A) at 10 / 9 and the
 * rank 16/700 white inside it, then (gap 2) "Bestseller #N" 14/700 + "in" 14/16 secondary + category 14/600 dark green
 * teal, sub line 12/14 secondary; 20px chevron-right. Opens the category PLP like CategoryBestSellerCta, which it replaces.
 */
export function SfBestsellerRow({ content }: { content: PdpContent }) {
  const nav = useNav();
  const cta = content.bestSellerCta;
  if (!cta) return null;
  const category = leafName(cta.categoryId);
  const rank = rankOf(content.bestSellerTag?.html);
  return (
    <Pressable className={styles.row} scale={0.98} onClick={() => nav.push('plp/listing', { query: category })}>
      <span className={styles.main}>
        <span className={styles.medal} aria-hidden>
          <span className={styles.badge}>
            <img alt="" src={badge} className={styles.badgeImg} />
            {rank !== undefined && <span className={styles.badgeRank}>{rank}</span>}
          </span>
        </span>
        <span className={styles.text}>
          <span className={styles.headline}>
            <span className={styles.rank}>{sfBestsellerCopy.bestseller(rank)}</span>
            {category && (
              <>
                <span className={styles.in}>{sfBestsellerCopy.in}</span>
                <span className={styles.category}>{category}</span>
              </>
            )}
          </span>
          <span className={styles.sub}>{cta.subText ?? sfBestsellerCopy.explore}</span>
        </span>
      </span>
      <MaskIcon src={chevronRight} size={20} color="var(--nk-color-text-primary)" className="pdp-flip" />
    </Pressable>
  );
}
