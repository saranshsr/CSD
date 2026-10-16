import { Pressable } from '../../../components';
import trendIcon from '@assets/couponsearch/trend-icon.webp';
import osnBanner from '@assets/couponsearch/osn-banner.webp';
import { copy, recentSearches, trending, viewedCategories } from '../data';
import styles from '../presearch.module.css';

/**
 * The empty search screen of the team file (05 · Search — empty, Iteration 2 empty frames), in every version:
 * "Recently searched" photo tiles (76 × 90, r8, label 13 / 20), "Trending searches" chips in two rows (40 high, r18,
 * trend icon 16 × 14, 13 / 20), the OSN+ banner (348 × 44, r22) and "Recently viewed categories" (133 × 160 r12 tiles,
 * 14 / 18 label, "n Viewed ▸" chip). Headings B16 SemiBold; sections 28 apart. Rows scroll sideways like the app.
 */
export function Presearch({ onSearch, onBanner, onCategory }: { onSearch: (q: string) => void; onBanner: () => void; onCategory: (label: string) => void }) {
  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h3 className={styles.heading}>{copy.search.recent}</h3>
        <div className={`nk-hscroll ${styles.tiles}`}>
          {recentSearches.map((r) => (
            <Pressable key={r.id} className={styles.tile} scale={0.96} onClick={() => onSearch(r.label)}>
              <img className={styles.tileImg} src={r.image} alt="" draggable={false} />
              <span className={styles.tileLabel}>{r.label}</span>
            </Pressable>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h3 className={styles.heading}>{copy.search.trending}</h3>
        <div className={`nk-hscroll ${styles.chipRows}`}>
          {trending.map((row, i) => (
            <div key={i} className={styles.chipRow}>
              {row.map((t) => (
                <Pressable key={t} className={styles.chip} scale={0.96} onClick={() => onSearch(t)}>
                  <img src={trendIcon} alt="" width={16} height={14} draggable={false} />
                  <span>{t}</span>
                </Pressable>
              ))}
            </div>
          ))}
        </div>
      </section>
      <Pressable className={styles.banner} scale={0.98} onClick={onBanner} aria-label={copy.search.banner}>
        <img src={osnBanner} alt="" draggable={false} />
      </Pressable>
      <section className={`${styles.section} ${styles.viewedSection}`}>
        <h3 className={styles.heading}>{copy.search.viewed}</h3>
        <div className={`nk-hscroll ${styles.viewed}`}>
          {viewedCategories.map((c) => (
            <Pressable key={c.id} className={styles.viewedItem} scale={0.97} onClick={() => onCategory(c.label)}>
              <img className={styles.viewedImg} src={c.image} alt="" draggable={false} />
              <span className={styles.viewedLabel}>{c.label}</span>
              <span className={styles.viewedChip}>{c.viewed} ▸</span>
            </Pressable>
          ))}
        </div>
      </section>
    </div>
  );
}
