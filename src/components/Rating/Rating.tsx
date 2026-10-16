import { motion, useAnimate } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Icon } from '../Icon/Icon';
import { OriginIcon } from '../Icon/OriginIcon';
import { Pressable } from '../Pressable/Pressable';
import { field, fontWeight, radius, ref, spacing } from '../../foundations/tokens';
import { fieldMotion } from '../../motion/presets';
import { useReduceMotion } from '../../motion/reducedMotion';

/** NoonReviewUtil.noonReviewColorV2: ≤1.9 orange, ≤2.9 amber, ≤3.9 green, else dark green */
export const starColor = (r: number) => ref.color(r < 2 ? 'starLow' : r < 3 ? 'starMid' : r < 4 ? 'starGood' : 'starGreat');
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));

/** NoonProductRating pill: #F7F8FA, r6, star tinted by score, 12/600 score + (1.2K) count. */
export function RatingPill({ rating, count, size = 'sm' }: { rating: number; count?: number; size?: 'sm' | 'lg' }) {
  const lg = size === 'lg';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.s4,
        background: ref.color('bgPill'),
        borderRadius: radius.r6,
        padding: lg ? `0 ${spacing.s6}px` : `${spacing.s2}px ${spacing.s6}px`,
        height: lg ? 26 : undefined,
        font: ref.type(lg ? 'text14SemiboldLh16' : 'captionBold'),
        color: ref.color('textStrong'),
        width: 'fit-content',
      }}
    >
      <span style={{ fontWeight: lg ? fontWeight.bold : fontWeight.semibold }}>{rating.toFixed(1)}</span>
      <Icon name="star" size={11} color={starColor(rating)} fill={starColor(rating)} strokeWidth={0} />
      {count !== undefined && (
        <span style={{ fontWeight: lg ? fontWeight.semibold : fontWeight.regular, color: lg ? ref.color('textBody') : ref.color('textSecondary') }}>
          {lg ? `${compact(count)} ratings` : `(${compact(count)})`}
        </span>
      )}
    </span>
  );
}

/** Row of 5 stars (reviews, order rating). `variant="field"` = the Field DS RatingInput (see `FieldStars`). */
export function Stars({
  value,
  size = 16,
  onChange,
  variant = 'default',
  clearable = true,
  disabled,
  emoji,
  label,
}: {
  value: number;
  /** default: any px (16); field: 20 | 28 | 32 (default 28) */
  size?: number;
  onChange?: (v: number) => void;
  /** default = kit stars; field = Field M-Rating/Input (interactive, animated) */
  variant?: 'default' | 'field';
  /** field: tapping the current value clears to 0 (Field always does) */
  clearable?: boolean;
  /** field: muted stars, no presses */
  disabled?: boolean;
  /** field: glyph shown at the selected star instead of a filled star (Field `emojis` + `emoji`, e.g. "😊") */
  emoji?: string;
  /** field: radiogroup accessible name (default "Rating, n out of 5") */
  label?: string;
}) {
  if (variant === 'field') {
    const fieldSize = size === 20 || size === 32 ? size : 28;
    return <FieldStars value={value} size={fieldSize} onChange={onChange} clearable={clearable} disabled={!!disabled} emoji={emoji} label={label} />;
  }
  return (
    <span style={{ display: 'inline-flex', gap: spacing.s4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} onClick={onChange ? () => onChange(i) : undefined} style={{ cursor: onChange ? 'pointer' : undefined, display: 'flex' }}>
          <Icon name="star" size={size} strokeWidth={i <= value ? 0 : 1.5} color={i <= value ? ref.color('starMid') : ref.color('borderStrong')} fill={i <= value ? ref.color('starMid') : 'none'} />
        </span>
      ))}
    </span>
  );
}

const FIELD_STAR_COUNT = 5;
const FIELD_STAR_GAP = { 20: spacing.s4, 28: spacing.s6, 32: spacing.s8 } as const;
/** RATING_BOUNCE_PEAK_SCALE */
const FIELD_BOUNCE_PEAK = 1.15;
/** Star press scale (RatingInput Star: 1 → 0.92 on motion.spring.interaction) */
const FIELD_STAR_PRESS = 0.92;

/**
 * Field DS M-Rating/Input (`@field-ds/components` RatingInput/RatingInput.tsx, Figma 1214:646): controlled 5-star
 * input, whole stars. Filled surface/yellow-bold #F5C400, outline text-n-icon/tertiary #666D85, disabled text muted.
 * Gap 4 / 6 / 8 at 20 / 28 / 32px. Each star cross-fades over 200ms (standard ease) with a 25ms stagger — left → right
 * on fill, right → left on unfill — and pops to 1.15 over 100ms then settles on springLight; press 0.92 on the
 * interaction spring. radiogroup / radio semantics; re-tapping the current value clears to 0 when `clearable`.
 */
function FieldStars({ value, size, onChange, clearable, disabled, emoji, label }: { value: number; size: 20 | 28 | 32; onChange?: (v: number) => void; clearable: boolean; disabled: boolean; emoji?: string; label?: string }) {
  const v = Number.isFinite(value) ? Math.max(0, Math.min(FIELD_STAR_COUNT, Math.floor(value))) : 0;
  const interactive = !!onChange && !disabled;
  const select = (i: number) => {
    if (!interactive) return;
    onChange?.(clearable && i === v ? 0 : i);
  };
  return (
    <span role="radiogroup" aria-label={label ?? `Rating, ${v} out of 5`} aria-disabled={disabled || undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: FIELD_STAR_GAP[size] }}>
      {Array.from({ length: FIELD_STAR_COUNT }, (_, k) => {
        const i = k + 1;
        const mode: FieldStarMode = emoji && i === v ? 'emoji' : i <= v ? 'filled' : 'outline';
        return <FieldStar key={i} index={i} mode={mode} size={size} emoji={emoji} disabled={disabled} interactive={interactive} checked={i === v} onPress={() => select(i)} />;
      })}
    </span>
  );
}

type FieldStarMode = 'outline' | 'filled' | 'emoji';

function FieldStar({ index, mode, size, emoji, disabled, interactive, checked, onPress }: { index: number; mode: FieldStarMode; size: number; emoji?: string; disabled: boolean; interactive: boolean; checked: boolean; onPress: () => void }) {
  const reduce = useReduceMotion();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const prevMode = useRef(mode);
  const filledNow = mode === 'filled';
  const wasFilled = prevMode.current === 'filled';
  // direction-aware stagger: fill sweeps 1 → 5, unfill sweeps 5 → 1
  const delay = reduce ? 0 : (wasFilled && !filledNow ? FIELD_STAR_COUNT - index : index - 1) * fieldMotion.delay.stagger;
  const fade = { duration: reduce ? 0 : fieldMotion.duration.base, ease: fieldMotion.ease.standard, delay };

  useEffect(() => {
    const was = prevMode.current;
    prevMode.current = mode;
    if (reduce || mode !== 'filled' || was === 'filled' || !scope.current) return;
    let cancelled = false;
    const el = scope.current;
    animate(el, { scale: FIELD_BOUNCE_PEAK }, { duration: fieldMotion.duration.xs, ease: fieldMotion.ease.standard, delay }).then(() => {
      if (!cancelled) animate(el, { scale: 1 }, fieldMotion.spring.springLight);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const filledColor = disabled ? field.textMuted : field.surfaceYellowBold;
  const outlineColor = disabled ? field.textMuted : field.textTertiary;
  const layer = { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' } as const;

  return (
    <Pressable
      role="radio"
      aria-checked={checked}
      aria-label={`Rate ${index} out of 5`}
      disabled={!interactive}
      scale={interactive && !reduce ? FIELD_STAR_PRESS : 1}
      transition={fieldMotion.spring.interaction}
      onClick={onPress}
      style={{ display: 'flex', cursor: interactive ? undefined : 'default' }}
    >
      <span ref={scope} style={{ position: 'relative', display: 'block', width: size, height: size }}>
        <motion.span style={layer} initial={false} animate={{ opacity: mode === 'outline' ? 1 : 0 }} transition={fade}>
          <OriginIcon name="star" size={size} color={outlineColor} />
        </motion.span>
        <motion.span style={layer} initial={false} animate={{ opacity: mode === 'filled' ? 1 : 0 }} transition={fade}>
          <OriginIcon name="star-filled" size={size} color={filledColor} />
        </motion.span>
        {emoji && (
          <motion.span style={{ ...layer, fontSize: size * 0.95, lineHeight: `${size}px` }} initial={false} animate={{ opacity: mode === 'emoji' ? 1 : 0 }} transition={fade} aria-hidden>
            {emoji}
          </motion.span>
        )}
      </span>
    </Pressable>
  );
}
