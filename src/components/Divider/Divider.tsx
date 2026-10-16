import type { CSSProperties } from 'react';
import { field, ref } from '../../foundations/tokens';

/** Field DS M-Divider emphasis (`@field-ds/components` Divider/Divider.tsx): low = border/subtle, high = border/primary. */
export type DividerEmphasis = 'low' | 'high';
const emphasisColor = (e: DividerEmphasis | undefined) => (e === 'high' ? field.borderPrimary : ref.color('borderSubtle'));

/**
 * Solid hairline. `vertical` draws a 1px-wide bar of `length` (PLP nav-pill separator: `<Divider vertical length={24} margin="0 8px" />`).
 * `emphasis` follows Field M-Divider: `'low'` (default, border/subtle #F2F3F7) or `'high'` (border/primary #EAECF0);
 * an explicit `color` wins. Renders `role="separator"` (with `aria-orientation` when vertical).
 */
export function Divider({ color, emphasis, margin = 0, vertical, length = '100%' }: { color?: string; emphasis?: DividerEmphasis; margin?: number | string; vertical?: boolean; length?: number | string }) {
  const c = color ?? emphasisColor(emphasis);
  if (vertical) return <span role="separator" aria-orientation="vertical" style={{ width: 1, height: length, background: c, margin, flexShrink: 0 }} />;
  return <div role="separator" style={{ height: 1, background: c, margin, flexShrink: 0 }} />;
}

/**
 * Dashed separator used in account menus, cart gifting, orders (dash 4/4, #F2F3F7), drawn with a CSS gradient.
 * `gap` sets the space between dashes (default = `dash`; Field M-Divider dashed is `dash={4} gap={3}`). `emphasis` as on
 * `Divider`; an explicit `color` wins. Renders `role="separator"`.
 */
export function DashedDivider({ color, emphasis, inset = '3.5%', margin = 0, dash = 4, gap }: { color?: string; emphasis?: DividerEmphasis; inset?: string | number; margin?: number | string; dash?: number; gap?: number }) {
  const c = color ?? emphasisColor(emphasis);
  const g = gap ?? dash;
  return (
    <div
      role="separator"
      style={{
        height: 1,
        marginInline: inset,
        marginBlock: margin,
        backgroundImage: g === dash ? `linear-gradient(to right, ${c} 50%, transparent 50%)` : `linear-gradient(to right, ${c} ${dash}px, transparent ${dash}px)`,
        backgroundSize: `${dash + g}px 1px`,
        flexShrink: 0,
      }}
    />
  );
}

/**
 * SVG dashed line (react-native-svg `<Line strokeDasharray>`), 1:1 with bappzaar's SVG dividers:
 *   - `AddressDottedDivider`: defaults (1px tall, dash "2, 2", round caps)
 *   - `NoonAccountDivider`: `height={2} dash="4,4" cap="butt" width="93%" centered` (dash "2,2" + width 100% in notifications)
 */
export function DottedDivider({
  color = ref.palette('antiFlashWhite'),
  dash = '2, 2',
  cap = 'round',
  height = 1,
  width = '100%',
  centered,
  style,
}: {
  color?: string;
  /** stroke-dasharray */
  dash?: string;
  cap?: 'round' | 'butt';
  /** svg height; the 1px line sits at its vertical centre */
  height?: number;
  width?: string | number;
  /** wrap in a flex row that centres a narrower line */
  centered?: boolean;
  style?: CSSProperties;
}) {
  const svg = (
    <svg height={height} width={width} style={{ display: 'block', overflow: 'visible', ...style }} aria-hidden>
      <line x1="0" y1={height / 2} x2="100%" y2={height / 2} stroke={color} strokeWidth="1" strokeDasharray={dash} strokeLinecap={cap === 'round' ? 'round' : undefined} />
    </svg>
  );
  return centered ? <div style={{ display: 'flex', justifyContent: 'center' }}>{svg}</div> : svg;
}
