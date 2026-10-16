import { AnimatePresence, motion, useReducedMotionConfig } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button, Screen } from '../../components';
import type { ScreenProps } from '../../kit/types';
import { useNav } from '../../kit/Navigator';
import { haptic } from '../../motion/haptics';
import { AiToggle, applyKey, ReviewFooter, ReviewHeader, ReviewProductHeader, ReviewTextField, type MockKey } from './components';
import { RateFeedbackCard, RateQuestionsSkeleton } from './components/RateChecklist';
import { attributesFor, copy } from './data';
import { pickCount, rateProductFor, reviewsActions, reviewsNav, useReviewParams, useReviews, type ReviewParams } from './store';
import { reviewsMotion as M } from './tokens';
import styles from './components/RateScreen.module.css';

/** repo ManualReviewScreen inline timings */
const FOCUS_MANUAL_MS = 50; // AI off → focus the manual field once the swap has started
const SCROLL_AFTER_KEYBOARD_MS = 360; // OptionalTextArea: scroll the field into view once the keyboard (0.34s) has risen
const CTA_DISABLED_SCALE = 0.985; // Footer: disabled CTA sits a hair smaller

/**
 * Rate your purchase — port of repo src/screens/ManualReviewScreen.tsx (Figma KzR8dy12uT8CtgBRHHY6Qx · 6042:140824,
 * keyboard 6042:140810). Variant A = bike phone holder, B = iPhone 16 Pro (`store.variant`).
 *
 * Fixed top: back · product header (56×64 tile, name, tappable 24px stars) · "Write with AI" card. Below it the
 * content swaps (blur cross-fade, mode wait) between
 *  - AI on: "What went well?" ((rating − 1) × 2 rows) / "What could have been better?" checkbox cards + the optional
 *    note; a rating change clears the picks and shows a 600ms skeleton before the new list staggers in;
 *  - AI off: one large "write your own" field, focused with the mock keyboard up.
 * Footer: "Craft my review" (AI on: ≥ 1 pick or a note) / "Next" (AI off: any text) → reviewsNav.craft.
 * The mock keyboard rises with the CTA when a field is focused and drops on a user scroll of the list.
 */
export function RateScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  const nav = useNav();
  const reduce = useReducedMotionConfig();
  const { rating, variant, aiEnabled, picks, note, manualText } = useReviews();
  const product = rateProductFor(variant);
  const { positives, improvements } = attributesFor(product, rating);
  const canCraft = aiEnabled ? pickCount({ picks }) > 0 || note.trim().length > 0 : manualText.trim().length > 0;

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const ratingChanged = useRef(false);
  const focused = useRef<'note' | 'manual'>('note');
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const manualRef = useRef<HTMLTextAreaElement | null>(null);

  // AI off → keyboard up + focus the manual field; AI on → keyboard down
  useEffect(() => {
    if (!aiEnabled) {
      setKeyboardVisible(true);
      focused.current = 'manual';
      const t = setTimeout(() => manualRef.current?.focus(), FOCUS_MANUAL_MS);
      return () => clearTimeout(t);
    }
    setKeyboardVisible(false);
  }, [aiEnabled]);

  // a real rating change (not the mount) flashes the skeleton: old list blurs out → shimmer → new list staggers in
  useEffect(() => {
    if (!ratingChanged.current) return;
    ratingChanged.current = false;
    setIsRecomputing(true);
    const t = setTimeout(() => setIsRecomputing(false), M.timing.recomputeMs);
    return () => clearTimeout(t);
  }, [rating]);

  const handleRate = (n: number) => {
    if (n === rating) return;
    ratingChanged.current = true;
    reviewsActions.rate(n, product, 'clear'); // picks from the old question set must not linger
  };

  // a user gesture on the list (wheel / touch move) dismisses the keyboard; programmatic scroll-into-view doesn't
  const dismissKeyboardOnScroll = () => {
    if (!keyboardVisible) return;
    (document.activeElement as HTMLElement | null)?.blur?.();
    setKeyboardVisible(false);
  };

  const onKey = (key: MockKey) => {
    if (focused.current === 'manual') reviewsActions.setManualText(applyKey(manualText, key));
    else reviewsActions.setNote(applyKey(note, key));
  };

  const swap = reduce ? { initial: { opacity: 0 }, exit: { opacity: 0 } } : { initial: { opacity: 0, filter: `blur(${M.swap.blur}px)`, y: M.swap.y }, exit: { opacity: 0, filter: `blur(${M.swap.blur}px)`, y: -M.swap.y } };
  const swapIn = { opacity: 1, filter: 'blur(0px)', y: 0 };
  const listSwap = reduce ? { initial: { opacity: 0 }, exit: { opacity: 0 } } : { initial: { opacity: 0, filter: `blur(${M.swap.blur}px)` }, exit: { opacity: 0, filter: `blur(${M.swap.blur}px)` } };
  const listIn = { opacity: 1, filter: 'blur(0px)' };
  const item = { hidden: reduce ? { opacity: 0 } : { opacity: 0, y: M.stagger.y }, show: { opacity: 1, y: 0, transition: M.spring.gentle } };

  const header = (
    <>
      <ReviewHeader leading="back" />
      <div className={styles.product}>
        <ReviewProductHeader product={product} rating={rating} onRate={handleRate} variant="rate" />
      </div>
      <div className={styles.ai}>
        <AiToggle enabled={aiEnabled} onChange={reviewsActions.setAiEnabled} look="outline" />
      </div>
    </>
  );

  const footer = (
    <ReviewFooter keyboard={{ visible: keyboardVisible, onKey }}>
      <Button
        variant="dark"
        size="lg"
        block
        disabled={!canCraft}
        initial={false}
        animate={{ scale: canCraft ? 1 : CTA_DISABLED_SCALE }}
        transition={M.spring.snappy}
        onClick={() => {
          haptic('tap');
          reviewsNav.craft(nav, aiEnabled);
        }}
      >
        {aiEnabled ? copy.craft : copy.next}
      </Button>
    </ReviewFooter>
  );

  return (
    <Screen background="reviewsPage" header={header} footer={footer} contentStyle={{ paddingBottom: 0, display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait" initial={false}>
        {aiEnabled ? (
          <motion.div
            key="ai"
            className={styles.aiPanel}
            onWheel={dismissKeyboardOnScroll}
            onTouchMove={dismissKeyboardOnScroll}
            initial={swap.initial}
            animate={swapIn}
            exit={swap.exit}
            transition={{ duration: M.duration.base, ease: M.ease.out }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isRecomputing ? (
                <motion.div key="skeleton" initial={listSwap.initial} animate={listIn} exit={listSwap.exit} transition={{ duration: M.duration.fast, ease: M.ease.out }}>
                  <RateQuestionsSkeleton positiveCount={positives.length} negativeCount={improvements.length} />
                </motion.div>
              ) : (
                <motion.div key={`questions-${rating}`} initial={listSwap.initial} animate={listIn} exit={listSwap.exit} transition={{ duration: M.duration.fast, ease: M.ease.out }}>
                  <motion.div
                    className={styles.stack}
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { delayChildren: M.stagger.delay, staggerChildren: M.stagger.gap } } }}
                  >
                    {positives.length > 0 && (
                      <motion.div variants={item}>
                        <RateFeedbackCard title={copy.wentWell} items={positives} selected={picks.positives} onToggle={(i) => reviewsActions.togglePick('positives', i)} />
                      </motion.div>
                    )}
                    {improvements.length > 0 && (
                      <motion.div variants={item}>
                        <RateFeedbackCard title={copy.couldBeBetter} items={improvements} selected={picks.improvements} onToggle={(i) => reviewsActions.togglePick('improvements', i)} />
                      </motion.div>
                    )}
                    <motion.div variants={item}>
                      <ReviewTextField
                        size="optional"
                        value={note}
                        onChange={reviewsActions.setNote}
                        placeholder={copy.optionalNote}
                        inputRef={noteRef}
                        onFocus={() => {
                          focused.current = 'note';
                          setKeyboardVisible(true);
                          setTimeout(() => noteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), SCROLL_AFTER_KEYBOARD_MS);
                        }}
                        onBlur={() => {
                          if (!note) setKeyboardVisible(false);
                        }}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="manual" className={styles.manualPanel} initial={swap.initial} animate={swapIn} exit={swap.exit} transition={{ duration: M.duration.base, ease: M.ease.out }}>
            <ReviewTextField
              size="large"
              autoGrow={false}
              value={manualText}
              onChange={reviewsActions.setManualText}
              placeholder={copy.manualPlaceholderRate}
              inputRef={manualRef}
              onFocus={() => {
                focused.current = 'manual';
                setKeyboardVisible(true);
              }}
              onBlur={() => {
                if (!manualText) setKeyboardVisible(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
