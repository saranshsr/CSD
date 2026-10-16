import { Pressable } from '../../../components';
import { copy, images } from '../data';
import styles from '../categories.module.css';

/**
 * FeedbackView state ERROR → EmptyView (default branch) → NoonEmptyView: empty-error.webp, title 16/bold steel
 * (mt 35), message 14 steel (mt 10), PrimaryButton "Retry" (50h, accentColor, r0, 14/bold white, minWidth 100, mt 35).
 * EmptyView container: centred, paddingHorizontal 30, paddingVertical 10.
 */
export function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.error}>
      <img src={images.emptyError} alt="" className={styles.errorImage} />
      <p className={styles.errorTitle}>{copy.errorTitle}</p>
      <p className={styles.errorMessage}>{copy.errorMessage}</p>
      <Pressable scale={1} className={styles.retry} onClick={onRetry}>
        {copy.retry}
      </Pressable>
    </div>
  );
}
