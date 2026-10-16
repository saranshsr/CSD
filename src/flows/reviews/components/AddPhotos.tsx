import { AnimatePresence, motion } from 'motion/react';
import { OriginIcon, Pressable } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { haptic } from '../../../motion/haptics';
import { copy, reviewPhotos } from '../data';
import { reviewsMotion as M, reviewsTokens } from '../tokens';
import styles from './AddPhotos.module.css';

export interface PhotoThumbsProps {
  photos: readonly string[];
  /** shows a small × on each thumb */
  onRemove?: (index: number) => void;
  /** pop in one after another on mount (Submitted: scale .7 → 1, 150ms + 50ms apart, gentle spring bounce .5) */
  appear?: boolean;
  width?: number;
  height?: number;
}

/** Photo thumbnails, 72×85 r10 (repo SubmittedScreen ReviewCard). */
export function PhotoThumbs({ photos, onRemove, appear, width = reviewsTokens.photoThumb.width, height = reviewsTokens.photoThumb.height }: PhotoThumbsProps) {
  return (
    <div className={styles.thumbs}>
      <AnimatePresence initial={!!appear}>
        {photos.map((src, i) => (
          <motion.div
            key={`${src}-${i}`}
            className={styles.thumb}
            style={{ width, height }}
            initial={{ opacity: 0, scale: M.photoPop.from }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: M.photoPop.from }}
            transition={{ ...M.photoPop.spring, delay: appear ? M.photoPop.delay + i * M.photoPop.stagger : 0 }}
          >
            <img src={src} alt="" />
            {onRemove && (
              <Pressable className={styles.remove} scale={0.9} aria-label="Remove photo" onClick={() => onRemove(i)}>
                <OriginIcon name="cross" size={12} />
              </Pressable>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export interface AddPhotosProps {
  /** attached photos (store `photos`); shown as thumbnails above the tiles */
  photos?: readonly string[];
  /** Camera tile. Demo default (when wiring the store): reviewsActions.addPhotos(reviewPhotos.camera) */
  onCamera?: () => void;
  /** Gallery tile. Demo default: reviewsActions.addPhotos(reviewPhotos.gallery) */
  onGallery?: () => void;
  onRemove?: (index: number) => void;
  /** cap (repo hint: "up to 5 images"); tiles dim once reached */
  max?: number;
  className?: string;
}

/**
 * AddPhotos — "Add photos" card: 16/24 Bold title, Camera + Gallery tiles (84h, r12, 1px `border`, Origin
 * `camera` / `gallery` 24px in `textMuted`, 14/20 Medium label) and the "You can attach up to 5 images" hint with
 * `info-circle` (repo AddPhotosCard in ReviewDraftScreen / ReviewDraftScreenB / NewReviewScreen /
 * RatePastOrdersScreen; Figma 7116:43925). Added photos appear as PhotoThumbs above the tiles. Tiles press with
 * the kit press, `tap` haptic.
 */
export function AddPhotos({ photos = [], onCamera, onGallery, onRemove, max = reviewPhotos.max, className }: AddPhotosProps) {
  const full = photos.length >= max;
  const tile = (label: string, icon: 'camera' | 'gallery', onPress?: () => void) => (
    <Pressable
      className={styles.tile}
      data-disabled={full || undefined}
      onClick={
        full
          ? undefined
          : () => {
              haptic('tap');
              onPress?.();
            }
      }
    >
      <OriginIcon name={icon} size={24} color={ref.color('textMuted')} />
      {label}
    </Pressable>
  );
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      <span className={styles.title}>{copy.addPhotos}</span>
      {photos.length > 0 && <PhotoThumbs photos={photos} onRemove={onRemove} />}
      <div className={styles.tiles}>
        {tile(copy.camera, 'camera', onCamera)}
        {tile(copy.gallery, 'gallery', onGallery)}
      </div>
      <div className={styles.hint}>
        <OriginIcon name="info-circle" size={16} color={ref.color('textTertiary')} />
        {copy.photosHint}
      </div>
    </div>
  );
}
