import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { spring, PRESS_SCALE } from '../motion.js';

// Pressable — press feedback via a critically damped spring scale. Interruptible by nature.
const Pressable = forwardRef(function Pressable(
  { as = 'button', onTap, onClick, className, style, children, disabled, ...rest }, ref,
) {
  const Comp = as === 'div' ? motion.div : motion.button;
  const extra = as === 'div' ? { role: rest.role || 'button' } : { type: rest.type || 'button' };
  return (
    <Comp
      ref={ref}
      {...extra}
      {...rest}
      disabled={as === 'div' ? undefined : disabled}
      className={className}
      style={style}
      whileTap={disabled ? undefined : { scale: PRESS_SCALE }}
      transition={spring.press}
      onClick={(e) => { onClick?.(e); if (!disabled) onTap?.(e); }}
    >
      {children}
    </Comp>
  );
});
export default Pressable;
