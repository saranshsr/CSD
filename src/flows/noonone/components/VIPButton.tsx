import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';
import { HtmlText, Spinner, type HtmlStylesheet } from '../../../components';
import { baseTokens } from '../tokens';

const { button: b } = baseTokens;

export interface VIPButtonProps extends Omit<HTMLMotionProps<'button'>, 'title' | 'children'> {
  onPress?: () => void;
  title?: ReactNode;
  /** HtmlView title (server html: `<s>`, `<b>` …) */
  htmlTitle?: string;
  htmlTextStyleSheet?: HtmlStylesheet;
  textClassName?: string;
  isLoading?: boolean;
  /** Loader colour (master: white) */
  loaderColor?: string;
  renderBefore?: ReactNode;
  renderAfter?: ReactNode;
}

/**
 * features/vip/components/VIPButton: unstyled pressable (callers pass the look), scale 1 → 0.97 on press-in (100ms)
 * and back on press-out (200ms), `onPress` fired 200ms after the tap; `isLoading` swaps the label for a white Loader.
 */
export function VIPButton({ onPress, title, htmlTitle, htmlTextStyleSheet, textClassName, isLoading, loaderColor = 'var(--nk-palette-white)', renderBefore, renderAfter, disabled, className, style, ...rest }: VIPButtonProps) {
  return (
    <motion.button
      type="button"
      className={['nk-pressable', className].filter(Boolean).join(' ')}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}
      whileTap={disabled ? undefined : { scale: b.pressScale, transition: { duration: b.inMs / 1000 } }}
      transition={{ duration: b.outMs / 1000 }}
      disabled={disabled}
      onClick={() => onPress && setTimeout(onPress, b.pressDelayMs)}
      {...rest}
    >
      {!isLoading && renderBefore}
      {isLoading ? (
        <Spinner color={loaderColor} />
      ) : htmlTitle ? (
        <HtmlText value={htmlTitle} stylesheet={htmlTextStyleSheet} className={textClassName} />
      ) : (
        <span className={textClassName}>{title}</span>
      )}
      {!isLoading && renderAfter}
    </motion.button>
  );
}
