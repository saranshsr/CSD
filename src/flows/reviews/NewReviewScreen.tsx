import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { useReduceMotion } from '../../motion/reducedMotion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { haptic } from '../../motion/haptics';
import { AddPhotos, AiToggle, applyKey, DraftCard, ReviewFooter, RewriteSheet, type MockKey } from './components';
import { GrowEditor, PinnedEditor, SheetEditor } from './components/NewReviewEditors';
import { NewReviewMorphHeader } from './components/NewReviewMorphHeader';
import { NewReviewManual, NewReviewPicks } from './components/NewReviewPicks';
import { newReviewMotion as NM, newReviewTokens as NT } from './components/NewReviewTokens';
import { attributesFor, copy, reviewer, reviewPhotos } from './data';
import { editVariantOf, newProductFor, pickCount, reviewsActions, reviewsNav, useReviewParams, useReviews, type ReviewPicks, type ReviewParams } from './store';
import { reviewsMotion as M, reviewsTokens as T } from './tokens';
import styles from './NewReviewScreen.module.css';

type Phase = 'input' | 'generating' | 'generated';

/** focus a field with the caret at the end */
const focusEnd = (ta: HTMLTextAreaElement | null) => {
  if (!ta) return;
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
};

/** A rating / chip change asked for after a draft exists — held until "Edit picks" confirms it. */
type PendingChange = { kind: 'rating'; value: number } | { kind: keyof ReviewPicks; item: string };

/**
 * Write a review — R&R 2.0 single scroll (repo src/screens/NewReviewScreen.tsx; Figma KzR8dy12uT8CtgBRHHY6Qx ·
 * 7629:275417 "New approach", + 8194-101662 header, 10562-228822 note, 9782-204273 / 9782-207423 / 9802-54954 editors).
 * The whole review lives on ONE scroll; nothing is pushed:
 *
 *   ┌ Product (image · name · ★)   ── NewReviewMorphHeader, docks into the nav as the page scrolls
 *   ├ Write with AI (AiToggle raised)
 *   ├ Picks card: chips + optional note (AI on) · "write your own" card (AI off)
 *   ├ Draft card: appears below the picks on "Craft my review" — shimmer (2.2s) → generated text
 *   ├ Add photos (rides in with the draft; always there in manual mode)
 *   └ [ Craft my review · Submit review · Continue · Save ]   ── ReviewFooter (+ KeyboardDock)
 *
 * Products (store `product`): bike → pinned editor · iphone → grow editor · iphone16 → top-sheet editor
 * (`editVariantOf`). Changing a star or chip once a draft exists asks first (RewriteSheet). The mock keyboard rises with
 * every focused field and its keys type into the note / manual field / editor.
 */
export function NewReviewScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  // repo NewReview starts with the name shown (its own useState(false)); openNew() does the same via start()
  useEffect(() => reviewsActions.setHideName(false), []);
  const nav = useNav();
  const reduce = useReduceMotion();
  const s = useReviews();
  const product = newProductFor(s.product);
  const editVariant = editVariantOf(s.product);
  const { positives, improvements } = attributesFor(product, s.rating);

  const [phase, setPhase] = useState<Phase>('input');
  const [editing, setEditing] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // manual mode: "Continue" (keyboard up, composing) → committed → "Submit review"; re-focusing flips it back
  const [manualCommitted, setManualCommitted] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const [pending, setPending] = useState<PendingChange | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLTextAreaElement | null>(null);
  const manualRef = useRef<HTMLTextAreaElement | null>(null);
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // header progress: 0 expanded → 1 docked over the first 72px of scroll (also plays during the craft auto-scroll)
  const { scrollY } = useScroll({ container: scrollRef });
  const headerProgress = useTransform(scrollY, [0, NT.collapse], [0, 1], { clamp: true });

  // the editor stage ends where the footer begins (CTA and/or keyboard): mirror the footer's live height into a CSS
  // var so the editors pin to it while the keyboard rises — no re-render per frame
  useLayoutEffect(() => {
    const footer = footerRef.current;
    const stage = stageRef.current;
    if (!footer || !stage) return;
    const sync = () => stage.style.setProperty('--nr-footer-h', `${footer.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(footer);
    return () => ro.disconnect();
  }, []);

  const smooth: ScrollBehavior = reduce ? 'auto' : 'smooth';

  // "Crafting your draft" dwell → the product's text lands
  useEffect(() => {
    if (phase !== 'generating') return;
    const id = window.setTimeout(() => {
      reviewsActions.setDraft(product.generatedText);
      setPhase('generated');
      haptic('land');
    }, M.timing.generateMs);
    return () => clearTimeout(id);
  }, [phase, product.generatedText]);

  // reveal: scroll the crafting card to the top as it appears (picks stay mounted above)
  useEffect(() => {
    if (phase !== 'generating') return;
    const id = window.setTimeout(() => draftRef.current?.scrollIntoView({ behavior: smooth, block: 'start' }), M.timing.revealScrollMs);
    return () => clearTimeout(id);
  }, [phase, smooth]);

  // ─── picks (guarded once a draft exists) ───
  const draftExists = phase !== 'input';
  const applyRating = (n: number) => reviewsActions.rate(n, product, 'prune');
  const toggle = (kind: keyof ReviewPicks, item: string) => (draftExists ? setPending({ kind, item }) : reviewsActions.togglePick(kind, item));
  const rate = (n: number) => {
    if (n === s.rating) return;
    if (draftExists) return setPending({ kind: 'rating', value: n });
    applyRating(n);
  };
  const keepReview = () => setPending(null);
  const editPicks = () => {
    const pc = pending;
    setPending(null);
    setEditing(false);
    setKeyboardVisible(false);
    reviewsActions.setDraft('');
    setPhase('input');
    if (!pc) return;
    if (pc.kind === 'rating') applyRating(pc.value);
    else reviewsActions.togglePick(pc.kind, pc.item);
  };

  // ─── edit patterns ───
  const editStartHeight = useRef<number | null>(null);
  // frozen pre-edit text for the frosted card behind the grow editor (nothing behind the blur moves while typing)
  const editStartText = useRef<string | null>(null);
  // how far Add photos moves (transform only) while the grow editor is open, so the gap under it reads GROW_GAP
  const bgShift = useRef(0);

  const openEditor = () => {
    setEditing(true);
    setKeyboardVisible(true);
    later(() => focusEnd(editRef.current), NM.focusMs);
  };
  const startEdit = () => {
    if (editVariant === 'grow') {
      draftRef.current?.scrollIntoView({ behavior: smooth, block: 'start' });
      later(
        () => {
          const card = draftRef.current;
          editStartHeight.current = card?.getBoundingClientRect().height ?? null;
          editStartText.current = s.draft;
          const textH = card?.querySelector('[data-draft-text]')?.getBoundingClientRect().height ?? 0;
          const settled = Math.max(NT.growMinH, Math.round(textH) + NT.growChrome);
          bgShift.current = (editStartHeight.current ?? settled) - settled + (T.cardGap - NT.growGap);
          openEditor();
        },
        reduce ? 0 : NM.growOpenMs,
      );
      return;
    }
    openEditor();
    if (editVariant === 'pinned') later(() => draftRef.current?.scrollIntoView({ behavior: smooth, block: 'start' }), NM.focusMs);
  };
  const saveEdit = () => {
    editRef.current?.blur();
    setEditing(false);
    setKeyboardVisible(false);
  };

  // ─── manual mode ───
  // focus the field once, as it attaches (repo focusing callback ref) — the shared field re-invokes ref callbacks on
  // every render, so remember which element already got its focus
  const autoFocused = useRef(new WeakSet<HTMLTextAreaElement>());
  const manualCb = useCallback((el: HTMLTextAreaElement | null) => {
    manualRef.current = el;
    if (el && !autoFocused.current.has(el)) {
      autoFocused.current.add(el);
      focusEnd(el);
    }
  }, []);
  const commitManual = () => {
    manualRef.current?.blur();
    setKeyboardVisible(false);
    setManualCommitted(true);
  };
  const toggleAi = (on: boolean) => {
    setEditing(false);
    setKeyboardVisible(false);
    setManualCommitted(false);
    reviewsActions.setAiEnabled(on);
  };

  // ─── keyboard ───
  const onKey = (k: MockKey) => {
    if (editing) {
      reviewsActions.setDraft(applyKey(s.draft, k, T.editMax));
      editRef.current?.focus();
    } else if (noteFocused) {
      reviewsActions.setNote(applyKey(s.note, k, T.noteMax));
      noteRef.current?.focus();
    } else if (!s.aiEnabled) {
      reviewsActions.setManualText(applyKey(s.manualText, k));
      manualRef.current?.focus();
    }
  };
  // scrolling never blurs a field being written in; it only clears an orphaned keyboard
  const dismissKeyboardOnScroll = () => {
    if (editing || !keyboardVisible) return;
    const el = document.activeElement as HTMLElement | null;
    if (el?.tagName === 'TEXTAREA') return;
    el?.blur?.();
    setKeyboardVisible(false);
  };

  const submit = () => reviewsNav.submit(nav, { hideName: s.hideName });
  const startGenerate = () => {
    setEditing(false);
    setPhase('generating');
  };

  // ─── footer: Craft my review → (crafting, disabled) Submit review → Submit review · manual Continue → Submit · Save ───
  const canCraft = pickCount(s) > 0 || s.note.trim().length > 0;
  const hasManual = s.manualText.trim().length > 0;
  let label: string = copy.submit;
  let enabled = true;
  let action: (() => void) | undefined = submit;
  if (editing) [label, enabled, action] = [copy.save, true, saveEdit];
  else if (!s.aiEnabled) [label, enabled, action] = manualCommitted ? [copy.submit, hasManual, submit] : [copy.continue, hasManual, commitManual];
  else if (phase === 'input') [label, enabled, action] = [copy.craft, canCraft, startGenerate];
  else if (phase === 'generating') [label, enabled, action] = [copy.submit, false, undefined];

  const showDraft = s.aiEnabled && phase !== 'input';
  const showAddPhotos = showDraft || !s.aiEnabled;
  const growEditing = editing && editVariant === 'grow';
  const pinnedEditing = editing && editVariant === 'pinned';
  const bgDimmed = growEditing || noteFocused;
  const hideBar = (editing && editVariant !== 'pinned') || noteFocused;
  const dim = (on: boolean) => (on ? { filter: `blur(${NM.dim.blur}px)`, opacity: NM.dim.opacity } : { filter: 'blur(0px)', opacity: 1 });
  const dimT = { duration: M.duration.base, ease: M.ease.out };

  return (
    <>
      <Screen
        ref={scrollRef}
        background="reviewsPage"
        overlayHeader
        safeTop={false}
        header={<NewReviewMorphHeader progress={headerProgress} product={product} rating={s.rating} onRate={rate} onClose={() => reviewsNav.close(nav)} editing={pinnedEditing} onBack={saveEdit} blurred={bgDimmed} />}
        contentStyle={{ paddingBottom: 0, overflowY: editing ? 'hidden' : undefined }}
        footer={
          <div ref={footerRef}>
            <ReviewFooter hideBar={hideBar} keyboard={{ visible: keyboardVisible, onKey }}>
              <Button
                variant="dark"
                size="lg"
                block
                disabled={!enabled}
                // keep focus in the field through mousedown so one tap commits (the handler dismisses the keyboard)
                onMouseDown={(e) => e.preventDefault()}
                onClick={
                  enabled && action
                    ? () => {
                        haptic('tap');
                        action();
                      }
                    : undefined
                }
              >
                {label}
              </Button>
            </ReviewFooter>
          </div>
        }
        overlay={
          <div ref={stageRef} className={styles.stage}>
            <PinnedEditor open={pinnedEditing} text={s.draft} onChange={reviewsActions.setDraft} inputRef={editRef} />
            <GrowEditor open={growEditing} text={s.draft} onChange={reviewsActions.setDraft} inputRef={editRef} startHeight={reduce ? null : editStartHeight.current} onSave={saveEdit} />
            <SheetEditor open={editing && editVariant === 'sheet'} text={s.draft} onChange={reviewsActions.setDraft} inputRef={editRef} onSave={saveEdit} />
          </div>
        }
      >
        <motion.div
          className={styles.scroll}
          style={{ paddingBottom: showDraft ? NT.scrollPadDraft : NT.scrollPadIdle }}
          onWheel={dismissKeyboardOnScroll}
          onTouchMove={dismissKeyboardOnScroll}
          initial={false}
          animate={dim(growEditing)}
          transition={dimT}
        >
          <div className={styles.spacer} />

          <motion.div className={styles.gutter} initial={false} animate={dim(noteFocused)} transition={dimT}>
            <AiToggle look="raised" enabled={s.aiEnabled} onChange={toggleAi} />
          </motion.div>

          <div className={styles.gutter}>
            <AnimatePresence mode="wait" initial={false}>
              {s.aiEnabled ? (
                <NewReviewPicks
                  key="picks"
                  positives={positives}
                  improvements={improvements}
                  picks={s.picks}
                  onToggle={toggle}
                  note={s.note}
                  onNote={reviewsActions.setNote}
                  noteFocused={noteFocused}
                  noteRef={noteRef}
                  onNoteFocus={() => {
                    setNoteFocused(true);
                    setKeyboardVisible(true);
                    later(() => noteRef.current?.scrollIntoView({ behavior: smooth, block: 'nearest' }), NM.noteScrollMs);
                  }}
                  onNoteBlur={() => {
                    setNoteFocused(false);
                    setKeyboardVisible(false);
                  }}
                />
              ) : (
                <NewReviewManual
                  key="manual"
                  value={s.manualText}
                  onChange={reviewsActions.setManualText}
                  inputRef={manualCb}
                  onFocus={() => {
                    setManualCommitted(false);
                    setKeyboardVisible(true);
                  }}
                  onBlur={() => setKeyboardVisible(false)}
                />
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false}>
            {showDraft && (
              <motion.div
                key="draft"
                ref={draftRef}
                className={`${styles.gutter} ${styles.draft}`}
                initial={{ opacity: 0, y: NM.riseY }}
                // grow editing: the read card hides; the editor overlay IS this card morphing (layout slot untouched)
                animate={{ opacity: growEditing ? 0 : 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: growEditing ? NM.growFade : M.duration.base, ease: M.ease.out }}
              >
                <DraftCard
                  look="inline"
                  phase={phase === 'generating' ? 'generating' : 'generated'}
                  text={growEditing && editStartText.current != null ? editStartText.current : s.draft}
                  editing={pinnedEditing}
                  onEdit={startEdit}
                  reviewerName={s.hideName ? reviewer.hiddenName : reviewer.name}
                  hideName={s.hideName}
                  onToggleName={reviewsActions.toggleHideName}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {showAddPhotos && !pinnedEditing && (
              <motion.div
                key="photos"
                className={styles.gutter}
                initial={{ opacity: 0, y: NM.riseY }}
                animate={{ opacity: 1, y: growEditing ? -bgShift.current : 0 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: M.duration.base, ease: M.ease.out, delay: phase === 'generating' ? NM.photosLag : 0 }, y: M.spring.fold }}
              >
                <AddPhotos
                  photos={s.photos}
                  onCamera={() => reviewsActions.addPhotos(reviewPhotos.camera, reviewPhotos.max)}
                  onGallery={() => reviewsActions.addPhotos(reviewPhotos.gallery, reviewPhotos.max)}
                  onRemove={reviewsActions.removePhoto}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Screen>
      <RewriteSheet open={!!pending} onKeepReview={keepReview} onEditPicks={editPicks} />
    </>
  );
}
