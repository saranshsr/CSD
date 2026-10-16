import type { ReactNode } from 'react';
import { useNav } from '../../kit/Navigator';
import { Icon, type IconName } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import { iconButton } from '../../foundations/tokens';
import { fieldMotion } from '../../motion/presets';
import styles from './Header.module.css';

export type IconButtonVariant =
  | 'outline'
  | 'glass'
  | 'plain'
  | 'subtle'
  // Field DS M-IconButton emphasis (@field-ds/components Button/IconButton.tsx):
  | 'fieldDefault' // white + #F2F3F7 border, #1D2539 icon
  | 'fieldGhost' // white, no border, #1D2539 icon
  | 'fieldAction'; // #EBF4FF + #D6E9FF border, #0F61FF icon

const FIELD_ICON_VARIANTS = new Set<IconButtonVariant>(['fieldDefault', 'fieldGhost', 'fieldAction']);

/**
 * 40px circular icon button — back, share, search, more (bappzaar NoonBackButton).
 * `variant="field*"` = Field M-IconButton: circle, `size` 40 (pad 10) or 36 (pad 8), icon 20, pressed + disabled bg
 * surface/secondary #F9F9FB, disabled icon #989FB3; press scale 0.98 (xs in, snappy out) like the Field buttons.
 */
export function IconButton({
  icon,
  onPress,
  size = iconButton.size,
  iconSize,
  variant = 'outline',
  badge,
  label,
  disabled,
}: {
  icon: IconName;
  onPress?: () => void;
  /** px; Field variants: 40 (H40, default) or 36 (H36) */
  size?: number;
  /** default 20 */
  iconSize?: number;
  variant?: IconButtonVariant;
  badge?: number;
  label?: string;
  disabled?: boolean;
}) {
  const isField = FIELD_ICON_VARIANTS.has(variant);
  const fieldMotionProps = isField
    ? {
        whileTap: disabled ? undefined : { scale: iconButton.fieldPressScale, transition: { duration: fieldMotion.duration.xs, ease: fieldMotion.ease.standard } },
        transition: fieldMotion.spring.snappy,
      }
    : undefined;
  return (
    <Pressable
      className={`${styles.iconBtn} ${styles[variant]}`}
      style={{ width: size, height: size, padding: isField ? (size <= 36 ? iconButton.fieldH36Padding : iconButton.fieldH40Padding) : undefined }}
      onClick={onPress}
      aria-label={label ?? icon}
      disabled={disabled}
      data-disabled={disabled || undefined}
      {...fieldMotionProps}
    >
      <Icon name={icon} size={iconSize ?? (isField ? iconButton.fieldIconSize : iconButton.iconSize)} flipRtl={icon === 'back' || icon === 'chevronRight'} />
      {!!badge && <span className={styles.badge}>{badge}</span>}
    </Pressable>
  );
}

export interface HeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** show back button (default: when there is something to go back to) */
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  /** centered title (checkout/cancel style) vs left aligned (wishlist style) */
  align?: 'center' | 'left';
  /**
   * `field` = Field DS M-PageHeader `title` (align left: H16 Bold) / `title-center` (B16 SemiBold): white, 56h,
   * padding 8/12, gap 4, `fieldDefault` back button, B12 subtitle. Other M-PageHeader types (search-bar, search-pill,
   * location, breadcrumb, icons) are not ported.
   */
  variant?: 'surface' | 'transparent' | 'page' | 'field';
  bordered?: boolean;
  /** 38×38 r8 image before the title (M-PageHeader `imageSource`) */
  image?: string;
  children?: ReactNode;
}

/** Top bar used by most pushed screens. Includes the top safe-area inset. */
export function Header({ title, subtitle, back, onBack, right, align = 'center', variant = 'surface', bordered, image, children }: HeaderProps) {
  const nav = useNav();
  const showBack = back ?? nav.canGoBack;
  return (
    <div className={`${styles.header} ${styles[variant]} ${bordered ? styles.bordered : ''}`}>
      <div className={styles.row} data-align={align} data-field={variant === 'field' || undefined}>
        <div className={styles.side}>{showBack && <IconButton icon="back" onPress={onBack ?? nav.back} label="Back" variant={variant === 'field' ? 'fieldDefault' : undefined} />}</div>
        {image && <img className={styles.image} src={image} alt="" />}
        <div className={styles.titleWrap}>
          {typeof title === 'string' ? <span className={styles.title}>{title}</span> : title}
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
        <div className={`${styles.side} ${styles.right}`}>{right}</div>
      </div>
      {children}
    </div>
  );
}
