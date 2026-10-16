import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { OriginIcon } from '../Icon/OriginIcon';
import type { OriginIconName } from '../Icon/originIcons';
import { MarketplaceTag } from './MarketplaceTag';
import { field, radius, ref, spacing } from '../../foundations/tokens';

/** NoonCatalogTagV2 — "Best Seller": 20h, #0A4F4A, bottom-end radius 10 only, 12/600 white. */
export function CatalogTag({ children, bg = ref.color('bestSellerTag'), color = ref.color('textInverse') }: { children: ReactNode; bg?: string; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: `0 ${spacing.s8}px`, background: bg, color, borderEndEndRadius: radius.r10, font: ref.type('text12SemiboldLh14'), whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

/** noon express badge — Figma MarketplaceTagsPills/express (60×18), scaled to `height`. */
export function ExpressBadge({ height = 18 }: { height?: number }) {
  return <MarketplaceTag kind="express" height={height} />;
}

/** NoonDiscountTags coupon: 24h, r4, 1px dashed #BBE0DE, #E9FBF9, 12/600 #0A4F4A. */
export function CouponTag({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.s4, height: 24, padding: `0 ${spacing.s8}px`, borderRadius: radius.r4, border: `1px dashed ${ref.color('couponBorder')}`, background: ref.color('couponSurface'), color: ref.color('bestSellerTag'), font: ref.type('text12SemiboldLh1'), maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden' }}>
      <Icon name="tag" size={12} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
    </span>
  );
}

/** status chip fill: tint → white */
const fade = (from: string) => `linear-gradient(90deg, ${from}, ${ref.color('bgSurface')})`;
/** Field InfoBanner fill: subtle tint → surface/primary, start → end (flips in RTL) */
const fieldFade = (from: string) => `linear-gradient(to right, ${from}, ${field.surfacePrimary})`;
const fieldFadeRtl = (from: string) => `linear-gradient(to left, ${from}, ${field.surfacePrimary})`;

/** Field InfoBanner colours (InfoBanner.tsx SURFACES) — green, grey, blue, orange, supermall, purple, red. */
const fieldColours = {
  green: { bg: field.surfaceSuccessSubtle, fg: field.textSuccess },
  grey: { bg: field.surfaceSecondary, fg: field.textPrimary },
  blue: { bg: field.surfaceActionSubtle, fg: field.textAction },
  orange: { bg: field.surfaceWarningSubtle, fg: field.textWarning },
  supermall: { bg: field.surfaceSupermallSubtle, fg: field.textSupermall },
  purple: { bg: field.surfacePurpleSubtle, fg: field.textPurple },
  red: { bg: field.surfaceErrorSubtle, fg: field.textError },
} as const;

const tones = {
  success: { bg: fade(ref.color('successSurface')), fg: ref.color('success'), field: fieldColours.green },
  neutral: { bg: fade(ref.palette('antiFlashWhite')), fg: ref.color('textSecondary'), field: fieldColours.grey },
  info: { bg: fade(ref.color('bgInfo')), fg: ref.color('primary'), field: fieldColours.blue },
  warning: { bg: fade(ref.color('warningSurface')), fg: ref.palette('sunsetOrange'), field: fieldColours.orange },
  danger: { bg: fade(ref.palette('red100')), fg: ref.palette('dangerRed'), field: fieldColours.red },
  plain: { bg: ref.color('bgMuted'), fg: ref.color('textPrimary'), field: fieldColours.grey },
  supermall: { bg: fade(fieldColours.supermall.bg), fg: fieldColours.supermall.fg, field: fieldColours.supermall },
  purple: { bg: fade(fieldColours.purple.bg), fg: fieldColours.purple.fg, field: fieldColours.purple },
} as const;
export type Tone = keyof typeof tones;

/** Field InfoBanner geometryFor(size, shape): logical start/end padding, vertical padding, gap, icon size. */
const fieldGeometry = {
  'small-rounded': { radius: radius.full, start: spacing.s4, end: spacing.s8, block: spacing.s4, gap: spacing.s2, icon: 14 },
  'small-rectangular': { radius: radius.r6, start: spacing.s4, end: spacing.s6, block: spacing.s4, gap: spacing.s2, icon: 14 },
  'large-rounded': { radius: radius.full, start: spacing.s8, end: spacing.s8, block: spacing.s8, gap: spacing.s4, icon: 18 },
  'large-rectangular': { radius: radius.r6, start: spacing.s6, end: spacing.s6, block: spacing.s6, gap: spacing.s4, icon: 18 },
} as const;

/**
 * Status / highlight chip (O2D history highlights, return statuses).
 *
 * `variant="field"` is the opt-in Field DS M-InfoBanner (`@field-ds/components` InfoBanner/InfoBanner.tsx, Figma
 * M-InfoBannerRounded 1337:69): single-line, non-interactive, tint-to-white gradient. `size` small = B11 Medium, 14px
 * icon, padding 4 (start 4 · end 8 rounded / 6 rect), gap 2; large = B12 Medium, 18px icon, padding 8 (6 rect), gap 4.
 * `shape` rounded = full radius, rectangular = r6. Tones map to Field colours: success→green, neutral/plain→grey,
 * info→blue, warning→orange, danger→red, plus supermall and purple. Icon: `icon` (kit Icon) or `fieldIcon` (Origin).
 */
export function StatusChip({
  tone = 'neutral',
  icon,
  children,
  style,
  variant = 'default',
  size = 'small',
  shape = 'rounded',
  fieldIcon,
}: {
  tone?: Tone;
  icon?: IconName;
  children: ReactNode;
  style?: CSSProperties;
  /** default = kit 13/600 r8 chip; field = Field M-InfoBanner */
  variant?: 'default' | 'field';
  /** field only */
  size?: 'small' | 'large';
  /** field only: rounded = pill, rectangular = r6 */
  shape?: 'rounded' | 'rectangular';
  /** field only: leading Origin icon (e.g. 'verified'); `icon` wins when both are set */
  fieldIcon?: OriginIconName;
}) {
  const t = tones[tone];
  const rtl = useRtl();
  if (variant === 'field') {
    const g = fieldGeometry[`${size}-${shape}`];
    const c = t.field;
    return (
      <span
        ref={rtl.ref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: g.gap,
          paddingInlineStart: g.start,
          paddingInlineEnd: g.end,
          paddingBlock: g.block,
          borderRadius: g.radius,
          backgroundColor: c.bg,
          backgroundImage: (rtl.value ? fieldFadeRtl : fieldFade)(c.bg),
          color: c.fg,
          font: ref.type(size === 'small' ? 'fieldB11Medium' : 'fieldB12Medium'),
          letterSpacing: field.trackingB,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          width: 'fit-content',
          maxWidth: '100%',
          ...style,
        }}
      >
        {icon ? <Icon name={icon} size={g.icon} /> : fieldIcon && <OriginIcon name={fieldIcon} size={g.icon} color="currentColor" />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.s4, padding: `${spacing.s4}px ${spacing.s6}px`, borderRadius: radius.r8, background: t.bg, color: t.fg, font: ref.type('text13SemiboldLh16'), width: 'fit-content', ...style }}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  );
}

/** Reads the computed direction of the chip so the Field gradient runs start → end. */
function useRtl() {
  const [value, setValue] = useState(false);
  const elRef = useRef<HTMLSpanElement | null>(null);
  useLayoutEffect(() => {
    if (elRef.current) setValue(getComputedStyle(elRef.current).direction === 'rtl');
  }, []);
  return { ref: elRef, value };
}

/** Generic small badge (counts, "member", sponsored) */
export function Badge({ children, bg = ref.palette('whiteAlpha70'), color = ref.color('textMuted'), style }: { children: ReactNode; bg?: string; color?: string; style?: CSSProperties }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: `${spacing.s2}px ${spacing.s4}px`, borderRadius: radius.r4, background: bg, color, font: ref.type('text10MediumLh12'), ...style }}>{children}</span>;
}
