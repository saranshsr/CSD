import { useNav } from '../../kit/Navigator';
import { postorderImages, tp } from './data.postorder';
import styles from './postorder.module.css';

/**
 * NoonOrderConfirmationTrackStepsScreen (Overlay): "How to track/update your order" + the steps image and an
 * accent CONTINUE SHOPPING button that closes the overlay and runs `continueShopping`.
 * Registered on master (noon.NoonOrderConfirmationTrackStepsScreen) but no screen opens it any more.
 */
export function TrackStepsScreen() {
  const nav = useNav();
  return (
    <div className={styles.trackContainer}>
      <span className={styles.trackTitle}>{tp.noon_how_to_track_update_order}</span>
      <img src={postorderImages.trackOrderSteps} className={styles.trackImage} alt="" />
      <button type="button" className={styles.trackButton} onClick={() => nav.reset('home/home')}>
        {tp.noon_CONTINUE_SHOPPING}
      </button>
    </div>
  );
}
