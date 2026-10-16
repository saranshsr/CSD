import { AnimatePresence, motion, useReducedMotionConfig } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Lottie, OriginIcon, Screen } from '../../components';
import { ref } from '../../foundations/tokens';
import type { ScreenProps } from '../../kit/types';
import { useNav } from '../../kit/Navigator';
import { haptic } from '../../motion/haptics';
import { reviewsLotties } from './assets';
import { PhotoThumbs, StarRatingInput } from './components';
import { copy, reviewer, reviewPhotos, SUBMITTED_REVIEW_TEXT } from './data';
import { reviewsNav, useReviewParams, useReviews, type ReviewParams } from './store';
import { reviewsMotion as M, reviewsTokens } from './tokens';
import styles from './components/SubmittedScreen.module.css';

/** repo SubmittedScreen: the review content rises 28px on spring.gentle once the animation has finished */
const REVEAL_RISE = 28;

/**
 * Review submitted — port of repo src/screens/SubmittedScreen.tsx (Figma KzR8dy12uT8CtgBRHHY6Qx · 6042:141658).
 * The full-page review-success Lottie plays once and holds its last frame as the backdrop; on its `complete`
 * (backstop 2.6s) the review card rises in over it: 20px stars, the review text clamped to 3 lines with
 * "show more" / "show less", the photo thumbs popping in one after another, "Written by:" + name (or the anonymised
 * attribution when Hide name was on). 1.5s later it auto-advances (reviewsNav.afterSubmit). No back: a dead end.
 * The hero (badge + "Thanks, you star!") keeps its space but stays invisible — the Lottie is the hero — and only
 * shows under reduced motion, where the Lottie is skipped and the card shows at once.
 */
export function SubmittedScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  const nav = useNav();
  const reduce = !!useReducedMotionConfig();
  const { rating, hideName } = useReviews();
  const [revealed, setRevealed] = useState(reduce);
  const [expanded, setExpanded] = useState(false);
  const advanced = useRef(false);
  const reviewerName = hideName ? reviewer.hiddenNameSubmitted : reviewer.name;

  // backstop: reveal even if the Lottie never emits `complete` (e.g. failed to load)
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setRevealed(true), M.timing.submittedBackstopMs);
    return () => clearTimeout(t);
  }, [reduce]);

  // once revealed, dwell so the user can take it in, then advance
  useEffect(() => {
    if (!revealed) return;
    haptic('success'); // one beat: the review card landing over the success animation
    const t = setTimeout(() => {
      if (advanced.current) return;
      advanced.current = true;
      reviewsNav.afterSubmit(nav);
    }, M.timing.submittedAdvanceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  return (
    <Screen background="reviewsPage" safeTop={false} contentStyle={{ paddingBottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {!reduce && (
        <div className={styles.lottie} aria-hidden>
          <Lottie src={reviewsLotties.reviewSuccess} style={{ width: '100%', height: '100%' }} onComplete={() => setRevealed(true)} />
        </div>
      )}

      <div className={styles.column}>
        {/* the page header is a spacer: Submitted has no back */}
        <div className={styles.headerSpacer} />
        <AnimatePresence>
          {revealed && (
            <motion.div
              key="review"
              className={styles.reveal}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: REVEAL_RISE }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: M.duration.slow } : M.spring.gentle}
            >
              <div className={styles.scroll}>
                <div className={styles.hero} data-visible={reduce || undefined}>
                  <span className={styles.badge}>
                    <OriginIcon name="star-filled" size={32} color={ref.color('rating')} />
                  </span>
                  <div className={styles.heroText}>
                    <span className={styles.heroTitle}>{copy.thanksTitle}</span>
                    <span className={styles.heroBody}>{copy.thanksBody}</span>
                  </div>
                </div>

                <div className={styles.card}>
                  <StarRatingInput value={rating} size={reviewsTokens.stars.small} gap={2} />
                  <p className={styles.text} data-expanded={expanded || undefined} onClick={() => setExpanded((v) => !v)}>
                    {SUBMITTED_REVIEW_TEXT}
                    {expanded && <span className={styles.more}>{`  ${copy.showLess}`}</span>}
                  </p>
                  {!expanded && (
                    <span className={[styles.more, styles.showMore].join(' ')} onClick={() => setExpanded(true)}>
                      {copy.showMore}
                    </span>
                  )}
                  <PhotoThumbs photos={reviewPhotos.submitted} appear />
                  <div className={styles.attribution}>
                    <span className={styles.writtenBy}>{copy.writtenByColon}</span>
                    <span className={styles.name}>{reviewerName}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
