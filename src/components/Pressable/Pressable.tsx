import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';
import { spring } from '../../motion/presets';
import { button } from '../../foundations/tokens';

/**
 * Port of bappzaar's AnimatedPressable: scales down on press with a spring.
 * Use for anything tappable so the whole prototype shares one press feel.
 * Default press scale: `button.pressScale` token (= motion `pressScale`, 0.96).
 */
export interface PressableProps extends HTMLMotionProps<'button'> {
  scale?: number;
  /** render as a div (for nesting inside other buttons) */
  asDiv?: boolean;
}

export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(function Pressable(
  { scale = button.pressScale, style, asDiv, type = 'button', className, ...rest },
  ref,
) {
  // resets live in global.css under :where(.nk-pressable) — zero specificity, so any class or inline style wins
  const common = {
    whileTap: { scale },
    transition: spring.press,
    style,
    className: ['nk-pressable', className].filter(Boolean).join(' '),
  };
  if (asDiv) return <motion.div role="button" tabIndex={0} {...common} {...(rest as HTMLMotionProps<'div'>)} />;
  return <motion.button ref={ref} type={type} {...common} {...rest} />;
});
