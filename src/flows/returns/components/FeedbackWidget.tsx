import { copy, feedbackWidget } from '../data';
import { Tap } from './AFSButton';
import styles from '../details.module.css';

/** AFSReturnsFeedbackWidget — 11 × (h40, r8) rate buttons, gap 4; labels 14/400 #666D85 */
export function FeedbackWidget({ selected, onSelect }: { selected?: number | null; onSelect: (rate: number) => void }) {
  return (
    <div className={styles.fbOptions}>
      <div className={styles.fbRow}>
        {feedbackWidget.map(({ rate }) => {
          const on = rate === selected;
          return (
            <Tap key={rate} scale={0.9} className={[styles.fbOption, on && styles.fbOptionOn].filter(Boolean).join(' ')} onPress={() => onSelect(rate)}>
              {rate}
            </Tap>
          );
        })}
      </div>
      <div className={styles.fbLabels}>
        <span>{copy.feedbackNotLikely}</span>
        <span>{copy.feedbackLikely}</span>
      </div>
    </div>
  );
}
