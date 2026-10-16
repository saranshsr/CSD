import { Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import type { BzBanner, BzHeader, BzWrap } from '../data.feed';
import { bz } from '../tokens.feed';
import { BzModuleWrapper } from './BzModuleWrapper';
import styles from './BannerModules.module.css';

/**
 * bannerModuleScroller → BannerModule `renderScroller`: banners chunked into columns of `rows` (rowsPerGroup, default 2),
 * free horizontal scroll (no snap), no scroll bar on these instances.
 *   bannerWidth = floor((W − 2 · iS − (numPerRow − 1) · iS) / numPerRow), iS 15
 *   → category icons (3.7): floor(319.5 / 3.7) = 86, height 86 · 139.08 / 100 = 119.6
 *   → kids' fashion (3.5, 1 row): floor(322.5 / 3.5) = 92, height 92 · 158.54 / 100 = 145.9
 * Column gap and row gap iS (15), 15 in from both ends, radius 20 (BannerContent), labels baked into the creatives.
 */
export function BannerScroller({ wrap, header, rows, numPerRow, banners }: { wrap: BzWrap; header?: BzHeader; rows: number; numPerRow: number; banners: BzBanner[] }) {
  const nav = useNav();
  const w = bz.scrollerWidth(numPerRow);
  const ratio = banners[0]?.ratio ?? 100;
  const columns: BzBanner[][] = [];
  for (let i = 0; i < banners.length; i += rows) columns.push(banners.slice(i, i + rows));
  return (
    <BzModuleWrapper wrap={wrap} header={header}>
      <div className={`nk-hscroll ${styles.freeRail}`} style={{ gap: 15 }}>
        {columns.map((col, c) => (
          <div key={c} className={styles.column} style={{ width: w, gap: 15 }}>
            {col.map((s, i) => (
              <Pressable key={i} className={styles.tile} scale={1} aria-label={s.alt} onClick={() => nav.push('plp/listing', { query: s.query })} style={{ width: w, aspectRatio: `100 / ${ratio}` }}>
                <img src={s.image} alt="" loading="lazy" draggable={false} className={styles.fill} />
              </Pressable>
            ))}
          </div>
        ))}
      </div>
    </BzModuleWrapper>
  );
}
