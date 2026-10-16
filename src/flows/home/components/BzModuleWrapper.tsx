import type { CSSProperties, ReactNode } from 'react';
import { OriginIcon, Pressable } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import type { BzHeader, BzWrap } from '../data.feed';
import styles from './BzModuleWrapper.module.css';

/**
 * bappzaar ModuleWrapper (src/components/Module/ModuleWrapper, noon branch) + ModuleHeader. Spacing: paddingTop /
 * paddingBottom = CMS innerPadding (default 0), marginTop 0, marginBottom = removeExternalSpacing ? 0 : bottomMargin
 * (24); CMS outerSpacing is ignored on noon. Header row: padding 0 15, margin 0 0 12; title 18 bold `new-black`
 * (#262A33, or the CMS titleColor), 1 line when isTruncated; "View all" 15 bold accent blue (#0057FF), letter-spacing
 * 0.2, 4 vertical padding, 10 start margin, then the arrow 5 after it. Tap → listing with the CMS link as the query.
 */
export function BzModuleWrapper({ wrap, header, children, className, style }: { wrap: BzWrap; header?: BzHeader; children: ReactNode; className?: string; style?: CSSProperties }) {
  const nav = useNav();
  return (
    <section
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      style={{ paddingTop: wrap.pt, paddingBottom: wrap.pb, marginBottom: wrap.mb, background: wrap.bg, ...style }}
      aria-label={header?.title}
    >
      {header && (
        <div className={styles.header}>
          <h2 className={styles.title} data-truncate={header.truncate || undefined} style={header.color ? { color: header.color } : undefined}>
            {header.title}
          </h2>
          {header.link && (
            <Pressable className={styles.link} scale={1} onClick={() => nav.push('plp/listing', { query: header.link!.query })} style={header.color ? { color: header.color } : undefined}>
              {header.link.text}
              <OriginIcon name="arrow-right" size={16} color={header.color ?? ref.color('brandBlue')} />
            </Pressable>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * bappzaar Sponsored (src/components/Sponsored): absolute, CMS label position, bg CMS (white) at opacity 0.7, r6,
 * padding 0 5; text "Ad" 13 regular (base text) in the CMS textColor (#828282) with 2 padding.
 */
export function Sponsored({ bottom, right, top, label = 'Ad' }: { bottom?: number; right?: number; top?: number; label?: string }) {
  return (
    <span className={styles.sponsored} style={{ bottom, right, top }}>
      <span className={styles.sponsoredText}>{label}</span>
    </span>
  );
}
