import type { CSSProperties, ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import { GlassFade } from '../Glass/Glass';
import styles from './ActionBar.module.css';

export type ActionBarLayout = 'single' | 'stacked' | 'split' | 'leadingTrailing';
export type ActionBarTone = 'action' | 'neutral';

/** One ActionBar button. Same shape as `SheetFooter`'s `primary` / `secondary`. */
export type ActionBarAction = { label: ReactNode; onPress: () => void } & Pick<ButtonProps, 'disabled' | 'loading' | 'icon' | 'iconRight'>;

export interface ActionBarProps {
  /** default `'single'` */
  layout?: ActionBarLayout;
  /** `'action'` (default): fieldPrimary + fieldSecondary · `'neutral'`: fieldNeutral + fieldSecondaryNeutral */
  tone?: ActionBarTone;
  /** dominant CTA (top in `stacked`, trailing in `split` / `leadingTrailing`) */
  primary?: ActionBarAction;
  /** second CTA: `stacked` (below the primary) and `split` (leading half) */
  secondary?: ActionBarAction;
  /** content above the buttons (`single` / `stacked`) — Field `topSlot` */
  top?: ReactNode;
  /** content before the buttons (`leadingTrailing`, or `split` instead of the secondary) — Field `leading` */
  leading?: ReactNode;
  /** add the bottom safe area (`var(--nk-inset-bottom)`) under the 12px padding. Default `true`; pass `false` inside a sheet */
  inset?: boolean;
  /**
   * `'glass'`: the Liquid Glass sticky footer of bappzaar `noon/ios/liquid-upgrade` (NoonNativeStickyBar
   * `placement="embedded"` → NoonStickyBarComponentView: a "clear" glass surface, r24, from the top of the footer down
   * behind the bottom tab, `embeddedBottomPadding` 10). Default `'solid'` (surface/primary).
   */
  surface?: 'solid' | 'glass';
  /** on a screen with the bottom tab bar: dock the content `floatingGap` (10) above the bar; a glass surface runs on behind it */
  aboveTabBar?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * M-ActionBar — port of Field Design System `packages/components/src/ActionBar/ActionBar.tsx` (Figma 698:11068,
 * 1735:119). White `surface/primary`, padding 12. Layouts × tones = 8 variants:
 *   single           one full-width H52 button (optional `top` slot above, gap 12)
 *   stacked          primary over secondary, full width, H52, gap 12
 *   split            secondary | primary side by side, flex 1 each, H52, gap 12
 *   leadingTrailing  `leading` slot (flex 1) + primary (flex 1), H48, gap 8
 * Tone `action` = Field PrimaryButton + SecondaryButton; `neutral` = NeutralButton + SecondaryNeutralButton.
 * Full-screen use: pass it to `<Screen footer>` (adds the bottom safe area). In a sheet use `<SheetFooter layout>`.
 *
 *   <ActionBar layout="split" tone="neutral" secondary={{ label: 'Reset', onPress: reset }} primary={{ label: 'Apply', onPress: apply }} />
 *   <ActionBar layout="leadingTrailing" leading={<Price />} primary={{ label: 'Add to cart', onPress: add }} />
 */
export function ActionBar({ layout = 'single', tone = 'action', primary, secondary, top, leading, inset = true, surface = 'solid', aboveTabBar, className, style }: ActionBarProps) {
  const fieldSize = layout === 'leadingTrailing' ? 'H48' : 'H52';
  const horizontal = layout === 'split' || layout === 'leadingTrailing';
  const btn = (a: ActionBarAction | undefined, role: 'primary' | 'secondary') =>
    a && (
      <Button
        variant={role === 'primary' ? (tone === 'action' ? 'fieldPrimary' : 'fieldNeutral') : tone === 'action' ? 'fieldSecondary' : 'fieldSecondaryNeutral'}
        fieldSize={fieldSize}
        block
        className={horizontal ? styles.flex : undefined}
        disabled={a.disabled}
        loading={a.loading}
        icon={a.icon}
        iconRight={a.iconRight}
        onClick={a.onPress}
      >
        {a.label}
      </Button>
    );
  return (
    <div className={[styles.bar, inset && !aboveTabBar && styles.inset, className].filter(Boolean).join(' ')} data-layout={layout} data-tone={tone} data-surface={surface} data-tab={aboveTabBar || undefined} data-glass-footer={surface === 'glass' ? '' : undefined} style={style}>
      {surface === 'glass' && (
        <>
          <GlassFade className={styles.glassFade} />
          <span className={styles.glassSurface} aria-hidden />
        </>
      )}
      {!horizontal && top != null && <div className={styles.top}>{top}</div>}
      {horizontal && leading != null && <div className={styles.leading}>{leading}</div>}
      {layout === 'split' && leading == null && btn(secondary, 'secondary')}
      {btn(primary, 'primary')}
      {layout === 'stacked' && btn(secondary, 'secondary')}
    </div>
  );
}
