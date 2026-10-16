import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Button, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { FadeIn } from '../../motion/recipes';
import { haptic } from '../../motion/haptics';
import { AddPhotos, applyKey, DraftCard, MockKeyboard, ReviewFooter, ReviewHeader, ReviewProductHeader, ReviewTextField, type MockKey } from './components';
import { copy, reviewer, reviewPhotos } from './data';
import { rateProductFor, reviewsActions, reviewsNav, reviewsStore, useReviewParams, useReviews, type ReviewParams } from './store';
import { reviewsMotion as M, reviewsTokens } from './tokens';
import { reviewsDraft as D } from './tokens.draft';
import styles from './DraftBScreen.module.css';

/**
 * Review draft B — port of repo src/screens/ReviewDraftScreenB.tsx (Figma KzR8dy12uT8CtgBRHHY6Qx · 7159:44106;
 * in-place edit 7159:44296). Reached from rate variant B (iPhone).
 *
 * One white card (`DraftCard look="field"`): compact product header (48×64 thumb, stars pop in 200ms + 60ms apart),
 * the review as an in-place grey field, "Written by" + a single Hide name ⇄ Show name pill. Tapping the field focuses
 * it where it is (caret, no sheet, no copy of the text) and slides up a Save bar + the mock keyboard together on
 * the repo sheet spring (.5s, bounce .14), over the Submit footer, with no scrim. The keys type into the field;
 * Save blurs it and slides both away. Submit review → reviewsNav.submit.
 */
export function DraftBScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  const nav = useNav();
  const product = rateProductFor('B');
  const rating = useReviews((s) => s.rating);
  const hideName = useReviews((s) => s.hideName);
  const photos = useReviews((s) => s.photos);
  const [text, setTextState] = useState(() => reviewsStore.get().draft || product.generatedText);
  const [editing, setEditing] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);

  const setText = (t: string) => {
    setTextState(t);
    reviewsActions.setDraft(t);
  };
  const onKey = (k: MockKey) => setText(applyKey(text, k, reviewsTokens.editMax));
  const save = () => {
    haptic('tap');
    fieldRef.current?.blur();
    setEditing(false);
  };

  return (
    <Screen
      background="reviewsPage"
      header={<ReviewHeader title={copy.yourReview} />}
      footer={
        <ReviewFooter>
          <Button
            variant="dark"
            size="lg"
            block
            onClick={() => {
              haptic('tap');
              reviewsNav.submit(nav, { hideName });
            }}
          >
            {copy.submit}
          </Button>
        </ReviewFooter>
      }
      overlay={
        <AnimatePresence>
          {editing && (
            <motion.div key="edit" className={styles.editDock} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={M.spring.sheet}>
              <div className={styles.saveBar}>
                <Button variant="dark" size="lg" block onMouseDown={(e) => e.preventDefault()} onClick={save}>
                  {copy.save}
                </Button>
              </div>
              <MockKeyboard onKey={onKey} />
            </motion.div>
          )}
        </AnimatePresence>
      }
    >
      <div className={styles.content}>
        <FadeIn y={M.fadeRise.y}>
          <DraftCard
            look="field"
            text={text}
            header={<ReviewProductHeader product={product} rating={rating} variant="compact" />}
            body={
              <ReviewTextField
                value={text}
                onChange={setText}
                surface="subtle"
                maxLength={reviewsTokens.editMax}
                inputMode="none"
                inputRef={fieldRef}
                onFocus={() => setEditing(true)}
              />
            }
            reviewerName={hideName ? reviewer.hiddenName : reviewer.name}
            hideName={hideName}
            onToggleName={reviewsActions.toggleHideName}
          />
        </FadeIn>
        <FadeIn y={M.fadeRise.y} delay={D.photosDelay}>
          <AddPhotos
            photos={photos}
            onCamera={() => reviewsActions.addPhotos(reviewPhotos.camera)}
            onGallery={() => reviewsActions.addPhotos(reviewPhotos.gallery)}
            onRemove={reviewsActions.removePhoto}
          />
        </FadeIn>
      </div>
    </Screen>
  );
}
