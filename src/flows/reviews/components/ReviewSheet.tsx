import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode, Ref } from 'react';
import { Button } from '../../../components';
import { copy } from '../data';
import { reviewsMotion as M, reviewsTokens } from '../tokens';
import { ExclamationIcon } from './icons';
import { MockKeyboard, type MockKey } from './MockKeyboard';
import { ReviewTextField } from './ReviewTextField';
import styles from './ReviewSheet.module.css';

export interface ReviewSheetProps {
  open: boolean;
  /** scrim tap */
  onDismiss: () => void;
  children: ReactNode;
  /** 'navy' = repo rgba(16,22,40,.45) (NewReview) · 'ink' = kit primaryAlpha45 rgba(14,14,14,.45) (ReviewDraft A) */
  scrim?: 'navy' | 'ink';
  label?: string;
  onExitComplete?: () => void;
}

/**
 * ReviewSheet — in-screen bottom overlay: scrim fades (.2s) and the content slides up from 100% on the repo sheet
 * spring (.5s, bounce .14). An in-screen overlay, not a `nav.sheet` route, because its content is the screen's
 * live state (the draft being edited, the pick waiting for confirmation) — same pattern as returns'
 * ReturnsOverlay. Render it as a sibling of `<Screen>` (fragment) so it covers header + footer.
 */
export function ReviewSheet({ open, onDismiss, children, scrim = 'navy', label, onExitComplete }: ReviewSheetProps) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <motion.div key="sheet" className={styles.layer} initial="hidden" animate="shown" exit="hidden" variants={{ hidden: { transition: { when: 'afterChildren' } }, shown: {} }}>
          <motion.div className={styles.scrim} data-tone={scrim} onClick={onDismiss} variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }} transition={{ duration: M.scrimFade }} />
          <motion.div className={styles.sheet} role="dialog" aria-modal="true" aria-label={label} variants={{ hidden: { y: '100%' }, shown: { y: 0 } }} transition={M.spring.sheet}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * RewriteSheet — "Rewrite your review?" guard (repo NewReviewScreen ProgressSheet, also used by
 * RatePastOrdersScreen): shown when the rating or a chip changes after a draft exists. Amber 56px badge,
 * 18/24 Bold title, 14/20 body, [Keep review (kit secondary) | Edit picks (kit dark)]. Scrim tap = Keep review.
 */
export function RewriteSheet({ open, onKeepReview, onEditPicks }: { open: boolean; onKeepReview: () => void; onEditPicks: () => void }) {
  return (
    <ReviewSheet open={open} onDismiss={onKeepReview} label={copy.rewriteTitle}>
      <div className={styles.panel}>
        <div className={styles.badge}>
          <ExclamationIcon />
        </div>
        <span className={styles.title}>{copy.rewriteTitle}</span>
        <span className={styles.body}>{copy.rewriteBody}</span>
        <div className={styles.buttons}>
          <Button variant="secondary" size="lg" className={styles.sheetBtn} onClick={onKeepReview}>
            {copy.keepReview}
          </Button>
          <Button variant="dark" size="lg" className={styles.sheetBtn} onClick={onEditPicks}>
            {copy.editPicks}
          </Button>
        </div>
      </div>
    </ReviewSheet>
  );
}

export interface EditReviewSheetProps {
  open: boolean;
  text: string;
  onChange: (text: string) => void;
  /** Save (and scrim tap on 'docked') */
  onSave: () => void;
  /** scrim tap on 'floating' (ReviewDraft A closes without saving); defaults to onSave */
  onDismiss?: () => void;
  /**
   * 'docked'   — NewReview / RatePastOrders EditReviewSheet (Figma 8428:16703): top-r16 sheet with a 40×4 grabber,
   *              grey field + counter, full-width Save, keyboard flush below. Scrim tap saves.
   * 'floating' — ReviewDraft A EditSheet (Figma 7125:36853): grabber on the scrim, card inset 12px, 160h field,
   *              Save, keyboard 8px below. Scrim tap dismisses.
   */
  look?: 'docked' | 'floating';
  max?: number;
  inputRef?: Ref<HTMLTextAreaElement>;
}

/** EditReviewSheet — edit the generated review in a bottom sheet with the mock keyboard (keys type into it). */
export function EditReviewSheet({ open, text, onChange, onSave, onDismiss, look = 'docked', max = reviewsTokens.editMax, inputRef }: EditReviewSheetProps) {
  const onKey = (k: MockKey) => onChange(k === 'delete' ? text.slice(0, -1) : text.length < max ? text + k : text);
  const field = (
    <ReviewTextField
      value={text}
      onChange={onChange}
      surface="subtle"
      size="large"
      autoGrow={look === 'docked'}
      minHeight={132}
      maxHeight={look === 'docked' ? 220 : undefined}
      maxLength={max}
      counter
      inputMode="none"
      autoFocus
      inputRef={inputRef}
    />
  );
  const save = (
    <Button variant="dark" size="lg" block onClick={onSave}>
      {copy.save}
    </Button>
  );
  return (
    <ReviewSheet open={open} onDismiss={onDismiss ?? onSave} scrim={look === 'floating' ? 'ink' : 'navy'} label={copy.editReview}>
      {look === 'docked' ? (
        <div className={styles.dock}>
          <div className={styles.grabber}>
            <span />
          </div>
          <div className={styles.dockField}>{field}</div>
          <div className={styles.dockSave}>{save}</div>
        </div>
      ) : (
        <>
          <div className={styles.floatGrabber}>
            <span />
          </div>
          <div className={styles.floatCard}>
            {field}
            {save}
          </div>
          <div className={styles.kbGap} />
        </>
      )}
      <MockKeyboard onKey={onKey} />
    </ReviewSheet>
  );
}
