import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { OriginIcon } from '../../../components';
import { reviewsKeyboard, reviewsMotion as M } from '../tokens';
import styles from './MockKeyboard.module.css';

/** Key value passed to `onKey`: a letter, ' ', '\n' or 'delete'. */
export type MockKey = string;

function Key({ children, onPress, className }: { children?: ReactNode; onPress?: () => void; className?: string }) {
  return (
    <div
      className={[styles.key, className].filter(Boolean).join(' ')}
      data-live={onPress ? '' : undefined}
      // keep focus (and the caret) in the field being edited — a key must never steal it
      onMouseDown={onPress ? (e) => e.preventDefault() : undefined}
      onClick={onPress}
    >
      {children}
    </div>
  );
}

const ShiftGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 4L20.5 13H16V19H8V13H3.5L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
const DeleteGlyph = () => (
  <svg width="25" height="20" viewBox="0 0 26 20" fill="none" aria-hidden>
    <path d="M8.2 2.5H23A2.5 2.5 0 0125.5 5V15A2.5 2.5 0 0123 17.5H8.2L1 10L8.2 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M12 7.5L18 12.5M18 7.5L12 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ReturnGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 5V11.5A2.5 2.5 0 0117.5 14H5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 10L5 14L9 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const EmojiGlyph = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
    <circle cx="13" cy="13" r="11.25" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="9.2" cy="10.8" r="1.25" fill="currentColor" />
    <circle cx="16.8" cy="10.8" r="1.25" fill="currentColor" />
    <path d="M8.5 15.5C9.7 17.4 11.2 18.3 13 18.3C14.8 18.3 16.3 17.4 17.5 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export interface MockKeyboardProps {
  /** wire it and the keys type: letters / ' ' / '\n' insert, 'delete' removes. Without it the keyboard is a visual mock */
  onKey?: (key: MockKey) => void;
}

/**
 * MockKeyboard — iOS keyboard stand-in (repo src/components/Keyboard.tsx, Figma KzR8dy12uT8CtgBRHHY6Qx ·
 * 6042:140810): white keys on the #d4d8de bed, blue return, emoji + mic row. The phone preview has no OS
 * keyboard, so R&R screens show this whenever a field is focused. Pads the home indicator itself
 * (`--nk-inset-bottom`), so put it last in the screen's `footer`. Keys never take focus from the field.
 */
export function MockKeyboard({ onKey }: MockKeyboardProps) {
  const press = (k: MockKey) => (onKey ? () => onKey(k) : undefined);
  const [r1, r2, r3] = reviewsKeyboard.rows.map((r) => r.split(''));
  return (
    <div className={styles.kb} aria-hidden>
      <div className={styles.row} data-row="1">
        {r1.map((k) => (
          <Key key={k} onPress={press(k)}>
            {k}
          </Key>
        ))}
      </div>
      <div className={styles.row} data-row="2">
        {r2.map((k) => (
          <Key key={k} onPress={press(k)}>
            {k}
          </Key>
        ))}
      </div>
      <div className={styles.row} data-row="3">
        <Key className={styles.wide}>
          <ShiftGlyph />
        </Key>
        {r3.map((k) => (
          <Key key={k} onPress={press(k)}>
            {k}
          </Key>
        ))}
        <Key className={styles.wide} onPress={press('delete')}>
          <DeleteGlyph />
        </Key>
      </div>
      <div className={styles.row} data-row="4">
        <Key className={styles.mode}>ABC</Key>
        <Key onPress={press(' ')} />
        <Key className={styles.return} onPress={press('\n')}>
          <ReturnGlyph />
        </Key>
      </div>
      <div className={styles.aux}>
        <EmojiGlyph />
        <OriginIcon name="mic" size={26} color="var(--nk-color-reviews-kb-aux)" />
      </div>
    </div>
  );
}

/**
 * KeyboardDock — the keyboard rising with its height (0 → auto, 0.34s easing.ios = repo ease.drawer), so
 * whatever sits above it in the footer (the CTA) rises in lockstep instead of jumping (repo ManualReview /
 * NewReview). Height (not transform) on purpose: it is one element and must re-lay out the screen.
 */
export function KeyboardDock({ visible, onKey }: { visible: boolean; onKey?: (key: MockKey) => void }) {
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div key="kb" className={styles.dock} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={M.keyboard}>
          <MockKeyboard onKey={onKey} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Apply a mock key to a string (helper for `onKey`): `setText((t) => applyKey(t, key, 1000))`. */
export const applyKey = (text: string, key: MockKey, max = Infinity) => (key === 'delete' ? text.slice(0, -1) : text.length < max ? text + key : text);
