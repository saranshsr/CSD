import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button, Divider, Pressable, Screen } from '../../components';
import { palette } from '../../foundations/palette';
import { ref } from '../../foundations/tokens';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { haptic } from '../../motion/haptics';
import { supermall } from '../../motion/presets';
import { AddPhotos, applyKey, AttributeChips, DraftCard, EditReviewSheet, ReviewFooter, ReviewHeader, ReviewProductHeader, RewriteSheet, ReviewTextField, StarRatingInput, type MockKey } from './components';
import { attributesFor, copy, reviewer, reviewPhotos, type ReviewProduct } from './data';
import { pastOrderProducts, reviewsActions, reviewsNav, useReviewParams, useReviews, type ReviewParams, type ReviewPicks } from './store';
import { reviewsMotion as M, reviewsTokens } from './tokens';
import styles from './PastOrdersScreen.module.css';

type Phase = 'input' | 'generating' | 'generated';
type PickKind = keyof ReviewPicks;

/** Per-product review state (repo ProductState) — switching in the strip never loses anything. */
interface ProductState {
  rating: number;
  picks: ReviewPicks;
  note: string;
  phase: Phase;
  draft: string;
  photos: string[];
}
const emptyState = (): ProductState => ({ rating: 0, picks: { positives: [], improvements: [] }, note: '', phase: 'input', draft: '', photos: [] });

/** repo header swap: title fades out over scroll 60 → 140, the docked product fades / rises in over 90 → 170 */
const DOCK = { titleOut: [60, 140], dockIn: [90, 170], rise: 10, live: 130 } as const;
/** repo: extra bottom room once the draft is showing, so the draft can scroll to the top of the page */
const DRAFT_ROOM = 340;

/**
 * Rate your past orders — multi-product review (repo src/screens/RatePastOrdersScreen.tsx; Figma
 * KzR8dy12uT8CtgBRHHY6Qx · 9129:106814). Reached from Submitted after the iPhone 16 Pro review.
 *
 *   X · "Rate your past orders" (16/22 SemiBold, centred) — cross-fades into the docked product (28×32 image +
 *       editable 24px stars) as the page scrolls past the strip, like NewReview's docked header
 *   Product strip — 88-wide tiles (80×80 image, one-line 11/14 name), horizontal scroll, selected = dark border
 *   Panel — 33px stars · divider · What went well? / What could have been better? (36px chips; an unrated product
 *       shows the 4★ arrangement) · "Anything else you would like to add" note
 *   Draft + Add photos appear BELOW on craft (shimmer 2.2s → text), the page scrolls down to them
 *   Sticky CTA: Craft my review (needs a star AND a chip) → Submit review (disabled while crafting)
 *
 * Every product keeps its own rating, chips, note, draft and photos. Switching products swaps the panel with the
 * R&R blur cross-fade (blur 4, y ±6, .18s). After a draft exists, a chip tap asks "Rewrite your review?" first
 * (Keep review drops the tap; Edit picks applies it, clears the draft and scrolls back up). Edit review opens the
 * docked edit sheet with the mock keyboard. Submit → reviewsNav.submitPastOrders → Submitted → orders list.
 */
export function PastOrdersScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  const nav = useNav();
  const hideName = useReviews((s) => s.hideName);

  const [selectedId, setSelectedId] = useState(pastOrderProducts[0].id);
  const [states, setStates] = useState<Record<string, ProductState>>(() => Object.fromEntries(pastOrderProducts.map((p) => [p.id, emptyState()])));
  const [editOpen, setEditOpen] = useState(false);
  const [pendingPick, setPendingPick] = useState<{ kind: PickKind; item: string } | null>(null);
  const [noteFocused, setNoteFocused] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const scrollY = useMotionValue(0);
  const titleOpacity = useTransform(scrollY, [...DOCK.titleOut], [1, 0]);
  const dockOpacity = useTransform(scrollY, [...DOCK.dockIn], [0, 1]);
  const dockY = useTransform(scrollY, [...DOCK.dockIn], [DOCK.rise, 0]);
  const dockEvents = useTransform(scrollY, (v) => (v > DOCK.live ? 'auto' : 'none'));

  const product = pastOrderProducts.find((p) => p.id === selectedId) as ReviewProduct;
  const st = states[selectedId];
  const patch = (id: string, part: Partial<ProductState> | ((s: ProductState) => Partial<ProductState>)) =>
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...(typeof part === 'function' ? part(prev[id]) : part) } }));

  const { positives, improvements } = attributesFor(product, st.rating, { unratedAs: 4 });
  const reviewerName = hideName ? reviewer.hiddenName : reviewer.name;

  // "Crafting your draft" → generated, for whichever products are generating (repo: one timer per phase change)
  const phaseKey = pastOrderProducts.map((p) => states[p.id].phase).join(',');
  useEffect(() => {
    const ids = pastOrderProducts.filter((p) => states[p.id].phase === 'generating').map((p) => p.id);
    if (ids.length === 0) return;
    const t = window.setTimeout(() => {
      setStates((prev) => {
        const next = { ...prev };
        for (const id of ids) {
          if (next[id].phase !== 'generating') continue;
          next[id] = { ...next[id], phase: 'generated', draft: pastOrderProducts.find((p) => p.id === id)!.generatedText };
        }
        return next;
      });
    }, M.timing.generateMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseKey]);

  const craft = () => {
    patch(selectedId, { phase: 'generating' });
    window.setTimeout(() => draftRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), M.timing.revealScrollMs);
  };

  const applyPick = (kind: PickKind, item: string) =>
    patch(selectedId, (s) => ({ picks: { ...s.picks, [kind]: s.picks[kind].includes(item) ? s.picks[kind].filter((x) => x !== item) : [...s.picks[kind], item] } }));
  // once a draft exists, a chip change would invalidate it — hold it and ask
  const togglePick = (kind: PickKind, item: string) => {
    if (st.phase !== 'input') return setPendingPick({ kind, item });
    applyPick(kind, item);
  };
  const keepReview = () => setPendingPick(null);
  const editPicks = () => {
    const pp = pendingPick;
    setPendingPick(null);
    patch(selectedId, { phase: 'input', draft: '' });
    if (pp) applyPick(pp.kind, pp.item);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rate = (n: number) => patch(selectedId, { rating: n });
  const select = (id: string) => {
    if (id === selectedId) return;
    haptic('tap');
    setNoteFocused(false);
    setSelectedId(id);
  };

  const canCraft = st.rating > 0 && st.picks.positives.length + st.picks.improvements.length > 0;
  const showDraft = st.phase !== 'input';
  const footerLabel = st.phase === 'input' ? copy.craft : copy.submit;
  const footerEnabled = st.phase === 'input' ? canCraft : st.phase === 'generated';
  const onFooter = () => {
    haptic('tap');
    if (st.phase === 'input') craft();
    else reviewsNav.submitPastOrders(nav, hideName);
  };
  const onNoteKey = (k: MockKey) => patch(selectedId, (s) => ({ note: applyKey(s.note, k, reviewsTokens.noteMax) }));

  const header = (
    <ReviewHeader
      leading="close"
      onLeading={() => reviewsNav.close(nav)}
      center={
        <div className={styles.headCenter} style={{ pointerEvents: 'none' }}>
          <motion.span className={styles.headTitle} style={{ opacity: titleOpacity }}>
            {copy.ratePastOrders}
          </motion.span>
          <motion.div className={styles.headDock} style={{ opacity: dockOpacity, y: dockY, pointerEvents: dockEvents }}>
            <ReviewProductHeader product={product} rating={st.rating} onRate={rate} variant="docked" />
          </motion.div>
        </div>
      }
    />
  );

  return (
    <>
      <Screen
        ref={scrollRef}
        background="reviewsPage"
        header={header}
        onScroll={(y) => scrollY.set(y)}
        contentStyle={{ paddingBottom: showDraft ? DRAFT_ROOM : 'var(--nk-space-s24)' }}
        footer={
          <ReviewFooter keyboard={{ visible: noteFocused, onKey: onNoteKey }}>
            <Button variant="dark" size="lg" block disabled={!footerEnabled} onClick={footerEnabled ? onFooter : undefined}>
              {footerLabel}
            </Button>
          </ReviewFooter>
        }
      >
        <div className={styles.page}>
          {/* product strip — horizontal scroll, selected = dark border */}
          <div className={`nk-scroll ${styles.strip}`}>
            {pastOrderProducts.map((p) => {
              const selected = p.id === selectedId;
              return (
                <Pressable
                  key={p.id}
                  className={styles.tile}
                  aria-pressed={selected}
                  aria-label={p.name}
                  initial={false}
                  // selection = stroke cross-fade, no movement (motion.md "is selected"); palette values because motion
                  // can't tween var() colours: charcoalNavy = textStrong #101628, lightGreyColor = border #eaecf0
                  animate={{ borderColor: selected ? palette.charcoalNavy : palette.lightGreyColor }}
                  transition={{ borderColor: { duration: supermall.swap.fill, ease: supermall.ease.soft } }}
                  onClick={() => select(p.id)}
                >
                  <span className={styles.tileImage}>
                    <img src={p.image} alt="" draggable={false} />
                  </span>
                  <span className={styles.tileName}>{p.name}</span>
                </Pressable>
              );
            })}
          </div>

          {/* review panel — swaps with the selected product */}
          <div className={styles.panel}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, filter: `blur(${M.swap.blur}px)`, y: M.swap.y }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: `blur(${M.swap.blur}px)`, y: -M.swap.y }}
                transition={{ duration: M.duration.fast, ease: M.ease.out }}
              >
                <StarRatingInput value={st.rating} onChange={rate} size={reviewsTokens.stars.panel} gap={6} label={`Rate ${product.name}`} />
                <Divider color={ref.color('border')} margin="var(--nk-space-s12) 0" />
                <div className={styles.groups}>
                  <AttributeChips title={copy.wentWell} items={positives} selected={st.picks.positives} onToggle={(item) => togglePick('positives', item)} size="sm" />
                  <AttributeChips title={copy.couldBeBetter} items={improvements} selected={st.picks.improvements} onToggle={(item) => togglePick('improvements', item)} size="sm" />
                  <ReviewTextField
                    value={st.note}
                    onChange={(note) => patch(selectedId, { note })}
                    placeholder={copy.noteNew}
                    size="note"
                    maxLength={reviewsTokens.noteMax}
                    inputRef={noteRef}
                    onFocus={() => {
                      setNoteFocused(true);
                      // the mock keyboard shrinks the scroll area: once it has risen, bring the note above it (what the OS does)
                      window.setTimeout(() => noteRef.current?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), (M.keyboard.duration ?? 0) * 1000);
                    }}
                    onBlur={() => setNoteFocused(false)}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* draft — appears below on craft; the page scrolls down to it */}
          <AnimatePresence initial={false}>
            {showDraft && (
              <motion.div
                key={`draft-${selectedId}`}
                ref={draftRef}
                className={styles.below}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: M.duration.base, ease: M.ease.out }}
              >
                <DraftCard
                  look="inline"
                  phase={st.phase === 'generating' ? 'generating' : 'generated'}
                  text={st.draft}
                  reviewerName={reviewerName}
                  hideName={hideName}
                  onToggleName={reviewsActions.toggleHideName}
                  onEdit={() => setEditOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* add photos — rides in with the draft */}
          <AnimatePresence initial={false}>
            {showDraft && (
              <motion.div
                key={`photos-${selectedId}`}
                className={styles.below}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: M.duration.base, ease: M.ease.out, delay: st.phase === 'generating' ? M.stagger.gap : 0 /* repo .05s behind the draft */ }}
              >
                <AddPhotos
                  photos={st.photos}
                  onCamera={() => patch(selectedId, (s) => ({ photos: [...s.photos, ...reviewPhotos.camera].slice(0, reviewPhotos.max) }))}
                  onGallery={() => patch(selectedId, (s) => ({ photos: [...s.photos, ...reviewPhotos.gallery].slice(0, reviewPhotos.max) }))}
                  onRemove={(i) => patch(selectedId, (s) => ({ photos: s.photos.filter((_, j) => j !== i) }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Screen>

      <EditReviewSheet open={editOpen} look="docked" text={st.draft} onChange={(draft) => patch(selectedId, { draft })} onSave={() => setEditOpen(false)} />
      <RewriteSheet open={!!pendingPick} onKeepReview={keepReview} onEditPicks={editPicks} />
    </>
  );
}
