import type { CSSProperties } from 'react';
import { fontWeight } from '../../foundations/tokens';
import styles from './HtmlText.module.css';

/** tag → inline style, like bappzaar HtmlView `stylesheet`. `p` styles the root. */
export type HtmlStylesheet = Partial<Record<string, CSSProperties>>;

const UNITLESS = new Set(['fontWeight', 'opacity', 'lineHeight', 'zIndex', 'flex', 'flexGrow', 'flexShrink', 'order']);
const toCss = (s: CSSProperties) =>
  Object.entries(s)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${typeof v === 'number' && !UNITLESS.has(k) ? `${v}px` : v}`)
    .join(';');

function render(value: string, sheet: HtmlStylesheet) {
  let html = value.replace(/<\/?p(\s[^>]*)?>/gi, '');
  // <b>/<strong> are always an explicit 700 (not the UA's relative `bolder`), plus any sheet override
  for (const tag of new Set(['b', 'strong', ...Object.keys(sheet)])) {
    if (tag === 'p') continue;
    const css = (tag === 'b' || tag === 'strong' ? `font-weight:${fontWeight.bold};` : '') + toCss(sheet[tag] ?? {});
    html = html.replace(new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi'), `<span style="${css}">`).replace(new RegExp(`</${tag}>`, 'gi'), '</span>');
  }
  return html;
}

export interface HtmlTextProps {
  value: string | null | undefined;
  /** per-tag inline styles (`p` = root), e.g. `{ p: { fontSize: 14 }, highlight: { color: '#38AE04' } }` */
  stylesheet?: HtmlStylesheet;
  /**
   * apply bappzaar's HtmlView base stylesheet (`src/components/HtmlView/styles.ts`): 13px #404553 root and the
   * shared custom tags (`<highlight> <steel> <emerald> <strike> <big> …`). Zero specificity, so a `className`
   * sheet always wins.
   */
  base?: boolean;
  /** clamp to N lines */
  lines?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Server-HTML text (bappzaar `<HtmlView>`): renders the custom inline tags the APIs send
 * (`<b> <highlight> <green> <red> <orange> <steel> <strike> <h4> …`, `<br/>`; `<p>` wrappers are unwrapped).
 *
 * Two ways to style it, matching how the ported screens did it:
 *   - `stylesheet` — HtmlView's per-tag style map (checkout session copy, payment methods).
 *   - `base` + `className` — CSS sheets targeting `:global(highlight)` etc. (cart).
 */
export function HtmlText({ value, stylesheet, base, lines, className, style }: HtmlTextProps) {
  if (!value) return null;
  const rootStyle = { ...stylesheet?.p, ...(lines ? { WebkitLineClamp: lines } : null), ...style };
  return (
    <span
      className={[base && styles.base, lines && styles.clamp, className].filter(Boolean).join(' ') || undefined}
      style={rootStyle}
      dangerouslySetInnerHTML={{ __html: stylesheet ? render(value, stylesheet) : value }}
    />
  );
}
