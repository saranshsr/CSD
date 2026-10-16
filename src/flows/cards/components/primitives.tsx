import { motion, type HTMLMotionProps } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { cardsSprings } from '../tokens';
import { MaskIcon, Spinner } from '../../../components';
import s from './components.module.css';
import { ref } from '../../../foundations/tokens';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'danger' | 'outline' | 'elevated';
  icon?: { src: string; w: number; h: number };
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLMotionProps<'button'>, 'onClick' | 'title' | 'style'>;

const iconColor = { primary: ref.color('textInverse'), danger: ref.color('textInverse'), elevated: ref.color('textInverse'), outline: 'var(--nk-color-cards-dark-navy)' } as const;

/** components/PaymentButtonV2 — spring press 0.96, noon variants (primary = blueGray900, elevated = charcoalNavy). */
export function PaymentButtonV2({ title, onPress, disabled, isLoading, size = 'md', variant = 'primary', icon, className, style, ...rest }: ButtonProps) {
  const inactive = disabled || isLoading;
  return (
    <motion.button
      type="button"
      className={[s.btn, s[`btn_${size}`], s[`btn_${variant}`], disabled && s.btnDisabled, className].filter(Boolean).join(' ')}
      style={style}
      whileTap={inactive ? undefined : { scale: 0.96 }}
      transition={cardsSprings.press}
      onClick={inactive ? undefined : onPress}
      disabled={disabled}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <Spinner color={variant === 'outline' ? 'var(--nk-color-cards-dark-navy)' : ref.color('textInverse')} gap="right" duration={0.75} />
      ) : (
        <span className={s.btnContent}>
          {icon && <MaskIcon src={icon.src} width={20} height={20} color={disabled ? 'var(--nk-color-cards-disabled-text)' : iconColor[variant]} />}
          <span className={s.btnText}>{title}</span>
        </span>
      )}
    </motion.button>
  );
}

/** components/PaymentScreenHeaderButton — 36pt circle, pressed scale 0.92, `transparent` = dark glass variant. */
export function HeaderButton({ icon, onPress, transparent, reversed, label }: { icon: { src: string; w: number; h: number }; onPress: () => void; transparent?: boolean; reversed?: boolean; label?: string }) {
  return (
    <motion.button type="button" aria-label={label} className={[s.headerBtn, transparent && s.headerBtnTransparent].filter(Boolean).join(' ')} whileTap={{ scale: 0.92 }} transition={{ duration: 0 }} onClick={onPress}>
      <MaskIcon src={icon.src} width={icon.w} height={icon.h} color={transparent ? ref.color('textInverse') : 'var(--nk-color-cards-dark-navy)'} style={reversed ? { transform: 'scaleX(-1)' } : undefined} />
    </motion.button>
  );
}

/** components/PaymentAdditionContainer — white 16pt card with an optional bold title row. */
export function AdditionContainer({ title, className, children }: { title?: string; className?: string; children?: ReactNode }) {
  return (
    <div className={[s.additionContainer, className].filter(Boolean).join(' ')}>
      {title && <div className={s.additionTitle}>{title}</div>}
      {children}
    </div>
  );
}
