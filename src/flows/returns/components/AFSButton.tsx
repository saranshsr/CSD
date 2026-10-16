import type { CSSProperties, ReactNode } from 'react';
import { Pressable, Spinner } from '../../../components';
import { returnsTokens } from '../tokens';
import styles from './afs.module.css';

/**
 * features/afs/common/components/AFSButton — r12, min-height 44/48/52, text 15/16/18 600, press spring 0.98.
 * Variants: primary #0F7EFF · outline white/#EAECF0 · danger #DE1C1C · inverted #101628 (MAPPING.md §2).
 */
export function AFSButton({
  title,
  onPress,
  size = 'md',
  variant = 'primary',
  disabled,
  loading,
  icon,
  className,
  style,
  textClassName,
}: {
  title: ReactNode;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'danger' | 'inverted';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  textClassName?: string;
}) {
  const locked = disabled || loading;
  return (
    <Pressable
      className={[styles.btn, styles[`btn_${size}`], styles[`btn_${variant}`], disabled && styles.btnDisabled, className].filter(Boolean).join(' ')}
      scale={locked ? 1 : returnsTokens.pressScale}
      transition={returnsTokens.pressSpring}
      disabled={locked}
      onClick={onPress}
      style={style}
    >
      {loading ? (
        <Spinner size={24} color={variant === 'outline' ? 'var(--nk-palette-dark-navy)' : 'var(--nk-color-text-inverse)'} />
      ) : (
        <span className={styles.btnContent}>
          {icon}
          <span className={[styles.btnText, styles[`btnText_${size}`], textClassName].filter(Boolean).join(' ')}>{title}</span>
        </span>
      )}
    </Pressable>
  );
}

/** AFSContainerButton — any pressable surface, spring to 0.98 */
export function Tap({ children, className, onPress, scale = returnsTokens.pressScale, disabled, style }: { children: ReactNode; className?: string; onPress?: () => void; scale?: number; disabled?: boolean; style?: CSSProperties }) {
  return (
    <Pressable className={className} scale={disabled ? 1 : scale} transition={returnsTokens.pressSpring} disabled={disabled} onClick={onPress} style={style}>
      {children}
    </Pressable>
  );
}

/** AFSSvgImage — CDN svg copied locally */
export function Svg({ src, size, width, height, className, flipRtl }: { src: string; size?: number; width?: number; height?: number; className?: string; flipRtl?: boolean }) {
  return <img src={src} alt="" aria-hidden width={width ?? size} height={height ?? size} className={[styles.svg, flipRtl && styles.flipRtl, className].filter(Boolean).join(' ')} />;
}
