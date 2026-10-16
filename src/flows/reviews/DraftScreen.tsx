import { LayoutGroup, motion } from 'motion/react';
import { useState } from 'react';
import { Button, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { FadeIn } from '../../motion/recipes';
import { haptic } from '../../motion/haptics';
import { AddPhotos, DraftCard, EditReviewSheet, ReviewFooter, ReviewHeader } from './components';
import { DraftProductTop } from './components/DraftProductTop';
import { copy, reviewer, reviewPhotos } from './data';
import { rateProductFor, reviewsActions, reviewsNav, reviewsStore, useReviewParams, useReviews, type ReviewParams } from './store';
import { reviewsMotion as M } from './tokens';
import { reviewsDraft as D } from './tokens.draft';
import styles from './DraftScreen.module.css';

/**
 * Review draft A — port of repo src/screens/ReviewDraftScreen.tsx (Figma KzR8dy12uT8CtgBRHHY6Qx · 7116:43925;
 * edit sheet 7125:36853). Reached from rate variant A (bike) via the AI loader or "Next".
 *
 * One review card: grey product top with a tilted polaroid (DraftProductTop) + `DraftCard look="review"` (long
 * text collapses with show more / show less, Hide Name ⇄ Show name anonymises to "Customer since 5 months", Edit
 * review), then Add photos. Edit review opens the floating EditReviewSheet over an ink scrim with the mock keyboard
 * (keys type, counter, Save keeps the edit, scrim tap discards it). Cards FadeRise in (photos 80ms later) and re-flow
 * on the gentle spring when the text expands. Submit review → reviewsNav.submit (stack resets to Submitted).
 */
export function DraftScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  const nav = useNav();
  const product = rateProductFor('A');
  const rating = useReviews((s) => s.rating);
  const hideName = useReviews((s) => s.hideName);
  const photos = useReviews((s) => s.photos);
  const [text, setText] = useState(() => reviewsStore.get().draft || product.generatedText);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const openEdit = () => {
    setEditText(text);
    setEditing(true);
  };
  const save = () => {
    haptic('tap');
    setText(editText);
    reviewsActions.setDraft(editText);
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
      overlay={<EditReviewSheet open={editing} look="floating" text={editText} onChange={setEditText} onSave={save} onDismiss={() => setEditing(false)} />}
    >
      <LayoutGroup>
        <div className={styles.content}>
          <FadeIn y={M.fadeRise.y}>
            <DraftCard
              look="review"
              className={styles.reviewCard}
              header={<DraftProductTop product={product} rating={rating} />}
              text={text}
              reviewerName={hideName ? reviewer.hiddenName : reviewer.name}
              hideName={hideName}
              onToggleName={reviewsActions.toggleHideName}
              onEdit={openEdit}
            />
          </FadeIn>
          <FadeIn y={M.fadeRise.y} delay={D.photosDelay}>
            <motion.div layout transition={M.spring.gentle}>
              <AddPhotos
                photos={photos}
                onCamera={() => reviewsActions.addPhotos(reviewPhotos.camera)}
                onGallery={() => reviewsActions.addPhotos(reviewPhotos.gallery)}
                onRemove={reviewsActions.removePhoto}
              />
            </motion.div>
          </FadeIn>
        </div>
      </LayoutGroup>
    </Screen>
  );
}

