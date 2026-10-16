import { AnimatePresence, motion } from 'motion/react';
import type { Ref, RefObject } from 'react';
import { Button } from '../../../components';
import { palette } from '../../../foundations/palette';
import { spacing } from '../../../foundations/tokens';
import { haptic } from '../../../motion/haptics';
import { copy } from '../data';
import type { ReviewPicks } from '../store';
import { reviewsMotion as M, reviewsTokens as T } from '../tokens';
import { AttributeChips } from './AttributeChips';
import { ReviewTextField } from './ReviewTextField';
import { newReviewMotion as NM, newReviewTokens as NT } from './NewReviewTokens';
import styles from './NewReviewPicks.module.css';

/** blur cross-fade for the AI ⇄ manual swap (repo: blur 4, y ±6, duration.base ease.out) */
const swap = {
  initial: { opacity: 0, filter: `blur(${M.swap.blur}px)`, y: M.swap.y },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  exit: { opacity: 0, filter: `blur(${M.swap.blur}px)`, y: -M.swap.y },
  transition: { duration: M.duration.base, ease: M.ease.out },
};

export interface NewReviewPicksProps {
  positives: string[];
  improvements: string[];
  picks: ReviewPicks;
  onToggle: (kind: keyof ReviewPicks, item: string) => void;
  note: string;
  onNote: (note: string) => void;
  noteFocused: boolean;
  onNoteFocus: () => void;
  onNoteBlur: () => void;
  noteRef: RefObject<HTMLTextAreaElement | null>;
}

/**
 * Picks card (repo NewReviewScreen input zone, AI on; Figma 7629:275417 + 10562-228822): "What went well?" /
 * "What could have been better?" AttributeChips, then the optional note. Focusing the note folds both chip groups away
 * (fold spring), and the bordered note box melts into the whole card — border fades, padding goes to 0, min-height
 * grows to 174 — with the caret in it and a counter + "Add note" row folding in at the bottom.
 */
export function NewReviewPicks({ positives, improvements, picks, onToggle, note, onNote, noteFocused, onNoteFocus, onNoteBlur, noteRef }: NewReviewPicksProps) {
  const pad = noteFocused ? { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 } : { paddingTop: spacing.s12, paddingBottom: spacing.s12, paddingLeft: spacing.s14, paddingRight: spacing.s14 };
  return (
    <motion.div key="picks" className={styles.card} {...swap}>
      <motion.div className={styles.fold} data-folded={noteFocused || undefined} initial={false} animate={{ height: noteFocused ? 0 : 'auto', opacity: noteFocused ? 0 : 1 }} transition={M.spring.fold}>
        <div className={styles.groups}>
          <AttributeChips title={copy.wentWell} items={positives} selected={picks.positives} onToggle={(i) => onToggle('positives', i)} />
          <AttributeChips title={copy.couldBeBetter} items={improvements} selected={picks.improvements} onToggle={(i) => onToggle('improvements', i)} />
        </div>
      </motion.div>

      <motion.div
        className={styles.note}
        onClick={() => noteRef.current?.focus()}
        initial={false}
        // motion can't tween var() colours: the palette value behind --nk-color-border, faded to transparent
        animate={{ borderColor: noteFocused ? `${palette.lightGreyColor}00` : palette.lightGreyColor, ...pad, minHeight: noteFocused ? NT.noteFocusMinH : 0 }}
        transition={{ ...M.spring.fold, minHeight: NM.noteGrow }}
      >
        <ReviewTextField
          className={styles.noteField}
          value={note}
          onChange={onNote}
          placeholder={copy.noteNew}
          size="note"
          minHeight={24}
          maxLength={T.noteMax}
          onFocus={onNoteFocus}
          onBlur={onNoteBlur}
          inputRef={noteRef as Ref<HTMLTextAreaElement>}
        />
        <AnimatePresence initial={false}>
          {noteFocused && (
            <motion.div key="note-actions" className={styles.noteActions} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={M.spring.fold}>
              <div className={styles.noteRow}>
                <span className={styles.counter}>
                  {note.length}/{T.noteMax}
                </span>
                <Button
                  variant="dark"
                  size="md"
                  className={styles.addNote}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic('tap');
                    noteRef.current?.blur();
                  }}
                >
                  {copy.addNote}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/**
 * Manual mode (Write with AI off): one "write your own" card — white r16, 1px `border`, min 168h, 16/24 Medium field
 * that grows with the text (min 136). Focuses itself as it mounts (repo focusing callback ref), which raises the keyboard.
 */
export function NewReviewManual({ value, onChange, onFocus, onBlur, inputRef }: { value: string; onChange: (v: string) => void; onFocus: () => void; onBlur: () => void; inputRef: (el: HTMLTextAreaElement | null) => void }) {
  return (
    <motion.div key="manual" className={styles.manual} {...swap}>
      <ReviewTextField className={styles.manualField} value={value} onChange={onChange} placeholder={copy.manualPlaceholderNew} size="large" minHeight={136} onFocus={onFocus} onBlur={onBlur} inputRef={inputRef} />
    </motion.div>
  );
}
