import { categoriesTokens as k } from '../tokens';
import styles from '../categories.module.css';

/**
 * src/components/ProgressLoader (DynamicLoaderScreen `renderLoader` for non-home pages, followBottomTabs):
 * full-height #F5F7FF, a 4px bar (70% wide, gradient #F5F7FF → accentColor) sweeping −width → +width every
 * 800ms (Easing.ease), pinned just above the bottom tabs (NoonNativeStickyBar). No search bar while loading —
 * StaticPage (which owns it) only mounts once the CMS response arrives.
 */
export function ProgressLoader() {
  return (
    <div className={styles.loader} role="progressbar" aria-label="Loading">
      <div className={styles.loaderTrack}>
        <div className={styles.loaderSweep} style={{ animationDuration: `${k.loaderMs}ms`, animationTimingFunction: `cubic-bezier(${k.loaderEase.join(',')})` }}>
          <div className={styles.loaderBar} style={{ width: `${k.loaderBarWidth * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
