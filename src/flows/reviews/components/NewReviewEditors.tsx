import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, type MouseEvent, type RefObject } from 'react';
import { Button, OriginIcon, Pressable } from '../../../components';
import { haptic } from '../../../motion/haptics';
import { copy } from '../data';
import { reviewsMotion as M, reviewsTokens as T } from '../tokens';
import { newReviewMotion as NM, newReviewTokens as NT } from './NewReviewTokens';
import styles from './NewReviewEditors.module.css';

/** keep focus (and the caret) in the editor when a button inside it is pressed */
const keepFocus = (e: MouseEvent) => e.preventDefault();

interface FieldProps {
  text: string;
  onChange: (text: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

/** "123/1000" */
const Counter = ({ value, className }: { value: string; className?: string }) => (
  <span className={[styles.counter, className].filter(Boolean).join(' ')}>
    {value.length}/{T.editMax}
  </span>
);

/**
 * Character-count ring for the top-sheet editor (Figma 9802-54954): `reviewsRingTrack` track, `textPrimary` arc
 * filling as the review approaches the 1000 cap.
 */
export function ProgressRing({ value, max }: { value: number; max: number }) {
  const { size, r, stroke } = NT.ring;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, value / max);
  const mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className={styles.ring}>
      <circle cx={mid} cy={mid} r={r} strokeWidth={stroke} fill="none" className={styles.ringTrack} />
      <circle cx={mid} cy={mid} r={r} strokeWidth={stroke} fill="none" className={styles.ringArc} strokeDasharray={`${c * frac} ${c}`} strokeLinecap="round" transform={`rotate(-90 ${mid} ${mid})`} />
    </svg>
  );
}

/**
 * Pinned editor (bike, Figma 9782-204273): the card fills the stage from 12px under the docked nav to 12px above the
 * footer ("Save" + keyboard); text flexes to fill, counter bottom-right. Fades in place (a pinned element carries no
 * transform). The footer's "Save" and the header's back chevron close it.
 */
export function PinnedEditor({ open, text, onChange, inputRef }: FieldProps & { open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="pinned" className={styles.card} data-kind="pinned" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: M.duration.base, ease: M.ease.out }}>
          <textarea ref={inputRef} className={styles.input} data-kind="pinned" value={text} maxLength={T.editMax} inputMode="none" onChange={(e) => onChange(e.target.value)} />
          <div className={styles.pinnedFoot}>
            <Counter value={text} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Grow editor (iPhone 16 Pro, Figma 9782-207423): opens morphing its height from the read card's size down to the hug
 * size (repo fold spring) — floors at 320, grows with typing until 24px above the keyboard, then the text scrolls
 * inside. Counter + a small "Save changes" settle in under the text 180ms in. The background (scroll, header) carries
 * its own 2px layer blur; an invisible tap-catcher behind the card saves & closes.
 */
export function GrowEditor({ open, text, onChange, inputRef, startHeight, onSave }: FieldProps & { open: boolean; startHeight: number | null; onSave: () => void }) {
  // textarea auto-grow; flex is neutralised while measuring (flex-grow would stretch it), then restored so the
  // controls row stays pinned to the card bottom and, at the cap, flex-shrink hands the overflow to the textarea
  useLayoutEffect(() => {
    const ta = inputRef.current;
    if (!ta || !open) return;
    ta.style.flex = 'none';
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
    ta.style.flex = '1 1 auto';
  }, [text, open, inputRef]);
  const morph = startHeight != null;
  return (
    <AnimatePresence>
      {open && (
        <div key="catcher" className={styles.catcher} onClick={onSave} />
      )}
      {open && (
        <motion.div
          key="grow"
          className={styles.card}
          data-kind="grow"
          style={{ minHeight: NT.growMinH, maxHeight: `calc(100% - ${NT.editorTop + NT.growCapGap}px)` }}
          initial={morph ? { opacity: 0, height: startHeight } : { opacity: 0 }}
          animate={morph ? { opacity: 1, height: 'auto', transition: { opacity: { duration: NM.growFade }, height: M.spring.fold } } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: M.duration.base, ease: M.ease.out }}
        >
          <textarea ref={inputRef} className={styles.input} data-kind="grow" value={text} maxLength={T.editMax} inputMode="none" onChange={(e) => onChange(e.target.value)} />
          <motion.div className={styles.growFoot} initial={{ opacity: 0, y: NM.growControls.y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: M.duration.base, ease: M.ease.out, delay: NM.growControls.delay }}>
            <Counter value={text} />
            <Button
              variant="dark"
              size="sm"
              className={styles.saveSmall}
              onMouseDown={keepFocus}
              onClick={() => {
                haptic('tap');
                onSave();
              }}
            >
              {copy.saveChanges}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Top-sheet editor (exchanged iPhone 16, Figma 9802-54954): a frosted scrim (2px backdrop blur) over the page and a
 * full-width sheet rising in step with the keyboard (repo .34s ease.drawer = `reviewsMotion.keyboard`), clipped to the
 * stage so it never paints over the keys. Back chevron + centred "Edit review", the text, then a bottom bar with the
 * progress ring + counter and "Save changes". Scrim tap / back / Save all save & close.
 */
export function SheetEditor({ open, text, onChange, inputRef, onSave }: FieldProps & { open: boolean; onSave: () => void }) {
  const save = () => {
    haptic('tap');
    onSave();
  };
  return (
    <AnimatePresence>
      {open && <motion.div key="frost" className={styles.frost} onClick={onSave} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: M.scrimFade }} />}
      {open && (
        <div key="clip" className={styles.sheetClip}>
          <motion.div
            className={styles.sheet}
            style={{ top: T.morphHeader.nav - NT.sheetOverlap }}
            role="dialog"
            aria-modal="true"
            aria-label={copy.editReview}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={M.keyboard}
          >
            <div className={styles.sheetHead}>
              <Pressable className={styles.sheetBack} aria-label="Back" onClick={save}>
                <OriginIcon name="chevron-left" size={20} className="nk-flip-rtl" />
              </Pressable>
              <span className={styles.sheetTitle}>{copy.editReview}</span>
            </div>
            <textarea ref={inputRef} className={styles.input} data-kind="sheet" value={text} maxLength={T.editMax} inputMode="none" onChange={(e) => onChange(e.target.value)} />
            <div className={styles.sheetBar}>
              <div className={styles.sheetCount}>
                <ProgressRing value={text.length} max={T.editMax} />
                <Counter value={text} className={styles.counterLarge} />
              </div>
              <Button variant="dark" size="md" className={styles.saveSheet} onMouseDown={keepFocus} onClick={save}>
                {copy.saveChanges}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
