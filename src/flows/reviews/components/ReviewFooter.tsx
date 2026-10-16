import type { ReactNode } from 'react';
import { KeyboardDock, type MockKey } from './MockKeyboard';
import styles from './ReviewFooter.module.css';

export interface ReviewFooterProps {
  /** the CTA(s): `<Button variant="dark" size="lg" block>` (flow tokens make `dark` the R&R #101628) */
  children?: ReactNode;
  /** mocked keyboard under the CTA; while visible the bar drops its home-indicator inset (the keyboard pads it) */
  keyboard?: { visible: boolean; onKey?: (key: MockKey) => void };
  /** hide the CTA row (NewReview grow / sheet editors and the focused note keep only the keyboard) */
  hideBar?: boolean;
  /**
   * 'tight' = 12px inline padding instead of 16 (repo PastOrderRatingScreen / B footer `padding: 12`, Figma Next at x 12).
   * @extended-by DeckScreen, SliderScreen: optional, default unchanged.
   */
  gutter?: 'default' | 'tight';
}

/**
 * ReviewFooter — sticky R&R footer for `<Screen footer>`: transparent (merges with the page gradient), 12px 16px
 * padding, home-indicator inset, optional KeyboardDock below so the CTA rises in lockstep with the keyboard
 * (repo ManualReviewScreen / NewReviewScreen Footer + keyboard). Several children sit side by side, flex 1.
 */
export function ReviewFooter({ children, keyboard, hideBar, gutter }: ReviewFooterProps) {
  return (
    <div className={styles.footer} data-keyboard={keyboard?.visible || undefined} data-gutter={gutter === 'tight' ? 'tight' : undefined}>
      {!hideBar && children && <div className={styles.bar}>{children}</div>}
      {keyboard && <KeyboardDock visible={keyboard.visible} onKey={keyboard.onKey} />}
    </div>
  );
}
