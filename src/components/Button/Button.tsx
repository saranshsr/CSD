import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Pressable, type PressableProps } from '../Pressable/Pressable';
import { Icon, type IconName } from '../Icon/Icon';
import { Spinner, type SpinnerProps } from '../Spinner/Spinner';
import { button as t } from '../../foundations/tokens';
import { fieldMotion } from '../../motion/presets';
import { useReduceMotion } from '../../motion/reducedMotion';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary' // #3866DF — Add to cart, View cart
  | 'checkout' // #0057FF — cart Checkout, Cancel selected
  | 'bright' // #0F7EFF — Create pill, View cart floating
  | 'dark' // #0E0E0E — Login, Continue shopping
  | 'outline' // white + #3866DF border — Buy now
  | 'secondary' // white + #EAECF0 border — Cancel, Clear all
  | 'soft' // #EBF4FF + #0F61FF text — wishlist ATC, View options
  | 'danger' // #DE1C1C — Yes, sign out
  | 'ghost' // text only
  // bappzaar marketplaces/noon/components/NoonButton presets (r12, padding 14/24, 16/600):
  | 'noon' // variant primary: #0076FF / white; disabled #0E0E0E0A / #0E0E0E3D
  | 'noonSecondary' // variant secondary: white, #0076FF text + 1px border; disabled grey text + border
  | 'noonGhost' // type ghost (primary): transparent, no padding, #0076FF text
  | 'noonGhostSecondary' // type ghost, variant secondary: newTextPrimary text
  | 'noonDotted' // type dotted: no padding, newTextPrimary text over a 0.5/3 round-dotted SVG line
  // Field DS (@field-ds/components Button/*) — opt-in, sized by `fieldSize`:
  | 'fieldPrimary' // PrimaryButton: #0F7EFF → pressed #0F61FF, white
  | 'fieldSecondary' // SecondaryButton: white + #D6E9FF border, #0F61FF text → pressed #EBF4FF
  | 'fieldSecondaryNeutral' // SecondaryNeutralButton: white + #EAECF0 border, #1D2539 text → pressed #F9F9FB / #475067
  | 'fieldNeutral' // NeutralButton: #101628 → pressed #1D2539, white
  | 'fieldText' // TextButton (M-TextButtonBlue): transparent, #0F61FF text → pressed #EBF4FF
  | 'fieldNeutralText' // NeutralTextButton: transparent, #1D2539 text → pressed #F9F9FB
  | 'fieldRound'; // RoundButton (M-NeutralRoundButton): pill, white + #EAECF0 border → pressed #F9F9FB / #475067

/**
 * Field button sizes. Rectangular variants: H56 (default) · H52 · H48 · H40 · H36 · H32 (H32 ships on Field
 * NeutralButton only). Text variants: A14 (28h, default) · A12 (24h); H sizes map H36/H32 → A12, others → A14.
 * Round: H40 (default) · H36; H32 / A12 → H36, others → H40. A14 / A12 on rectangular variants → H40 / H36.
 */
export type FieldButtonSize = 'H56' | 'H52' | 'H48' | 'H40' | 'H36' | 'H32' | 'A14' | 'A12';

const NOON = new Set<ButtonVariant>(['noon', 'noonSecondary', 'noonGhost', 'noonGhostSecondary', 'noonDotted']);
type FieldVariant = Extract<ButtonVariant, `field${string}`>;
const isField = (v: ButtonVariant): v is FieldVariant => v.startsWith('field');

/** NoonButton.toTitleCase — capitalises every word except the minor ones (skipped in RTL by the caller). */
const MINOR_WORDS = ['a', 'an', 'the', 'to', 'for', 'in', 'on', 'at', 'by', 'and', 'or', 'but', 'nor', 'with', 'from', 'of'];
export const toTitleCase = (s: string) =>
  s
    .toLowerCase()
    .split(' ')
    .map((w, i) => (!w ? '' : i > 0 && MINOR_WORDS.includes(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  /** kit variants only — noon variants always use the NoonButton metrics, field variants `fieldSize` */
  size?: 'sm' | 'md' | 'lg';
  /** field variants only (ignored otherwise) — Field sizing.ts; default H56 (text A14, round H40) */
  fieldSize?: FieldButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
  /**
   * Kit variants: the spinner replaces the label. Noon variants (NoonButton `isLoading`): the label stays in place
   * at opacity 0 and the loader is centred over the button, so the width never jumps. Field variants
   * (useLoadingFade): the label stays in place and cross-fades with the spinner over 160ms.
   */
  loading?: boolean;
  /** loader overrides (default: white on `noon`, #0076FF otherwise, size 24 — NoonButton `loaderColor`/`loaderSize`) */
  spinner?: SpinnerProps;
  /** NoonButton `!skipTitleCase`: title-case a string label */
  titleCase?: boolean;
  /** NoonButton `renderBefore` / `renderAfter` */
  before?: ReactNode;
  after?: ReactNode;
  /** noonDotted: line colour (NoonButton `dottedColor`, default newTextPrimary) */
  dottedColor?: string;
  children?: ReactNode;
}

/**
 * Central button. Kit variants are the noon app's filled/outline CTAs; `noon*` variants are 1:1 with bappzaar's
 * NoonButton presets (`variant` primary/secondary × `type` default/ghost/dotted, `isLoading`, `renderBefore/After`,
 * title-casing). Noon presets press like NoonButton (opacity 0.95 + scale 0.98, 200ms; ghost: none); override with
 * `whileTap` / `transition`. Their rules are zero-specificity, so a caller `className` can restyle metrics.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary' } = props;
  if (isField(variant)) return <FieldButton {...props} variant={variant} />;
  return <KitButton {...props} />;
}

function KitButton({ variant = 'primary', size = 'md', fieldSize: _fieldSize, icon, iconRight, block, loading, spinner, titleCase, before, after, dottedColor, disabled, children, className, ...rest }: ButtonProps) {
  const iconSize = t[`${size}IconSize`];
  if (NOON.has(variant)) {
    const ghost = variant === 'noonGhost' || variant === 'noonGhostSecondary' || variant === 'noonDotted';
    const label = titleCase && typeof children === 'string' ? toTitleCase(children) : children;
    const text = (
      <span className={styles.noonLabel} style={loading ? { visibility: 'hidden' } : undefined}>
        {label}
      </span>
    );
    return (
      <Pressable
        className={[styles.noonBase, styles[variant], block && styles.block, className].filter(Boolean).join(' ')}
        disabled={disabled || loading}
        data-disabled={disabled || undefined}
        scale={ghost ? 1 : t.noonPressScale}
        whileTap={ghost ? undefined : { scale: t.noonPressScale, opacity: t.noonPressOpacity }}
        transition={{ duration: t.noonPressDuration / 1000 }}
        {...rest}
      >
        {before}
        {variant === 'noonDotted' ? (
          <span className={styles.noonDottedInner}>
            {text}
            <svg height="1" width="100%" className={styles.noonDottedLine} aria-hidden>
              <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke={disabled ? t.noonDottedLineDisabled : (dottedColor ?? t.noonDottedLine)} strokeWidth="1" strokeDasharray={t.noonDottedDash} strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          text
        )}
        {loading && (
          <span className={styles.noonLoader}>
            <Spinner color={variant === 'noon' ? t.noonLoader : t.noonSecondaryLoader} size={t.noonLoaderSize} {...spinner} />
          </span>
        )}
        {after}
      </Pressable>
    );
  }
  return (
    <Pressable
      className={[styles.btn, styles[variant], styles[size], block && styles.block, className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size={t.spinnerSize} gap="right" duration={t.spinnerDuration / 1000} {...spinner} />
      ) : (
        <>
          {icon && <Icon name={icon} size={iconSize} />}
          {children}
          {iconRight && <Icon name={iconRight} size={iconSize} flipRtl />}
        </>
      )}
    </Pressable>
  );
}

type FieldKind = 'rect' | 'text' | 'round';
const FIELD_KIND: Record<FieldVariant, FieldKind> = {
  fieldPrimary: 'rect',
  fieldSecondary: 'rect',
  fieldSecondaryNeutral: 'rect',
  fieldNeutral: 'rect',
  fieldText: 'text',
  fieldNeutralText: 'text',
  fieldRound: 'round',
};

/** Field size → CSS size class + icon / spinner px (button token group). */
function fieldSpec(variant: FieldVariant, size: FieldButtonSize | undefined) {
  const kind = FIELD_KIND[variant];
  if (kind === 'text') {
    const s = size === 'A12' || size === 'H36' || size === 'H32' ? 'A12' : 'A14';
    const iconSize = t[`fieldText${s}IconSize`];
    return { sizeClass: `fT${s}`, iconSize, spinnerSize: iconSize };
  }
  if (kind === 'round') {
    const s = size === 'H36' || size === 'H32' || size === 'A12' ? 'H36' : 'H40';
    return { sizeClass: `fR${s}`, iconSize: t[`fieldRound${s}IconSize`], spinnerSize: t[`fieldRound${s}SpinnerSize`] };
  }
  const s = size === 'A14' ? 'H40' : size === 'A12' ? 'H36' : (size ?? 'H56');
  if (s === 'H40' && variant !== 'fieldPrimary') {
    // BUTTON_SIZE_H40_OVERRIDES: 16 padding, gap 6, r10, 20px icon; secondary keeps A12 text
    return {
      sizeClass: variant === 'fieldSecondary' ? 'fH40Wide fH40WideA12' : 'fH40Wide',
      iconSize: t.fieldH40WideIconSize,
      spinnerSize: variant === 'fieldNeutral' ? t.fieldH40NeutralSpinnerSize : t.fieldH40WideSpinnerSize,
    };
  }
  return { sizeClass: `f${s}`, iconSize: t[`field${s}IconSize`], spinnerSize: t[`field${s}SpinnerSize`] };
}

/**
 * Field DS buttons (@field-ds/components Button: _RectButton + sizing.ts, TextButton, NeutralTextButton, RoundButton).
 * Press: scale 0.98 in `fieldMotion.duration.xs`, back with `fieldMotion.spring.snappy`; pressed bg / border / text
 * colours tween over 120ms (PRESS_TRANSITION). `loading` keeps the label in place (no width jump) and cross-fades it
 * with the spinner over 160ms, ease standard (useLoadingFade). Rules are low-specificity, so a caller `className` wins.
 */
function FieldButton({ variant, fieldSize, size: _size, icon, iconRight, block, loading, spinner, titleCase, before, after, dottedColor: _dotted, disabled, children, className, ...rest }: ButtonProps & { variant: FieldVariant }) {
  const reduce = useReduceMotion();
  const inert = !!(disabled || loading);
  const spec = fieldSpec(variant, fieldSize);
  // spinner stays mounted until its fade-out finishes
  const [spinning, setSpinning] = useState(!!loading);
  useEffect(() => {
    if (loading) setSpinning(true);
  }, [loading]);
  const fade = { duration: reduce ? 0 : t.fieldLoadingFadeDuration / 1000, ease: fieldMotion.ease.standard };
  const label = titleCase && typeof children === 'string' ? toTitleCase(children) : children;
  const sizeClasses = spec.sizeClass.split(' ').map((c) => styles[c]);
  return (
    <Pressable
      className={[styles.fieldBase, styles[variant], ...sizeClasses, block && styles.block, className].filter(Boolean).join(' ')}
      disabled={inert}
      data-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      whileTap={inert ? undefined : { scale: t.fieldPressScale, transition: { duration: fieldMotion.duration.xs, ease: fieldMotion.ease.standard } }}
      transition={fieldMotion.spring.snappy}
      {...rest}
    >
      <motion.span className={styles.fieldContent} aria-hidden={loading || undefined} initial={false} animate={{ opacity: loading ? 0 : 1 }} transition={fade}>
        {before}
        {icon && <Icon name={icon} size={spec.iconSize} />}
        {label != null && <span className={styles.fieldLabel}>{label}</span>}
        {iconRight && <Icon name={iconRight} size={spec.iconSize} flipRtl />}
        {after}
      </motion.span>
      <motion.span
        className={styles.fieldLoader}
        aria-hidden
        initial={false}
        animate={{ opacity: loading ? 1 : 0 }}
        transition={fade}
        onAnimationComplete={() => {
          if (!loading) setSpinning(false);
        }}
      >
        {spinning && <Spinner size={spec.spinnerSize} {...spinner} />}
      </motion.span>
    </Pressable>
  );
}
