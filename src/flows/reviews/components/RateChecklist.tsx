import { motion } from 'motion/react';
import { Checkbox, DashedDivider, Pressable, Skeleton } from '../../../components';
import { palette } from '../../../foundations/palette';
import { ref } from '../../../foundations/tokens';
import { haptic } from '../../../motion/haptics';
import { duration, easing } from '../../../motion/presets';
import { reviewsMotion as M } from '../tokens';
import styles from './RateChecklist.module.css';

/** repo FieldCheckbox: the filled box pops in from .55 on spring.bouncy */
const CHECK_POP_FROM = 0.55;
/** repo CheckboxRow whileTap tint: 0.12s */
const ROW_TINT_S = 0.12;

/**
 * One checkbox row (repo ManualReviewScreen CheckboxRow + FieldCheckbox; Figma M-ListItem-FullWidth with an H20
 * M-Checkbox, 6042:140830). 14/20 Medium label (`textMuted` → `textPrimary` when checked, .18s), central
 * `Checkbox` on the trailing edge, dashed `borderSubtle` divider inset 16. The whole row is the tap target:
 * no scale, a `reviewsRowPress` tint while pressed, `tap` haptic. The outline fades out (.15s) while the filled
 * box pops in on spring.bouncy (the repo's tick path-draw has no equivalent in the kit glyph).
 */
export function RateCheckRow({ label, checked, onToggle, divider }: { label: string; checked: boolean; onToggle: () => void; divider: boolean }) {
  return (
    <Pressable
      className={styles.row}
      role="checkbox"
      aria-checked={checked}
      scale={1}
      initial={false}
      animate="rest"
      whileTap="pressed"
      onClick={() => {
        haptic('tap');
        onToggle();
      }}
    >
      <motion.span className={styles.tint} aria-hidden variants={{ rest: { opacity: 0 }, pressed: { opacity: 1 } }} transition={{ duration: ROW_TINT_S }} />
      <span className={styles.body}>
        <motion.span
          className={styles.label}
          initial={false}
          // motion can't tween var() colours: palette values behind textPrimary / textMuted
          animate={{ color: checked ? palette.blueGray900 : palette.slateBlueGray }}
          transition={{ duration: M.duration.fast, ease: easing.standard }}
        >
          {label}
        </motion.span>
        <span className={styles.check}>
          <motion.span className={styles.glyph} initial={false} animate={{ opacity: checked ? 0 : 1 }} transition={{ duration: duration.fast, ease: easing.out }}>
            <Checkbox checked={false} color={ref.color('textSecondary')} />
          </motion.span>
          <motion.span
            className={styles.glyph}
            initial={false}
            animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : CHECK_POP_FROM }}
            transition={M.spring.bouncy}
          >
            <Checkbox checked color={ref.color('textPrimary')} />
          </motion.span>
        </span>
      </span>
      {divider && <DashedDivider inset={16} />}
    </Pressable>
  );
}

/** "What went well?" / "What could have been better?" card (repo FeedbackCard; Figma 6042:140826). */
export function RateFeedbackCard({ title, items, selected, onToggle }: { title: string; items: string[]; selected: readonly string[]; onToggle: (item: string) => void }) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      {items.map((item, i) => (
        <RateCheckRow key={item} label={item} checked={selected.includes(item)} onToggle={() => onToggle(item)} divider={i < items.length - 1} />
      ))}
    </div>
  );
}

/**
 * Loading state while the question set re-derives after a rating change (repo SkeletonCard / QuestionsSkeleton):
 * same card shape and row count as the real cards so the swap doesn't jump. Blocks are the kit `Skeleton`.
 */
function SkeletonCard({ rows, titleWidth }: { rows: number; titleWidth: number }) {
  return (
    <div className={styles.card}>
      <div className={styles.skTitle}>
        <Skeleton width={titleWidth} height={16} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <div className={styles.skRow}>
            {/* vary line widths a little so it reads as text, not bars (repo) */}
            <Skeleton width={`${52 + ((i * 17) % 34)}%`} height={12} />
            <Skeleton width={20} height={20} />
          </div>
          {i < rows - 1 && <DashedDivider inset={16} />}
        </div>
      ))}
    </div>
  );
}

export function RateQuestionsSkeleton({ positiveCount, negativeCount }: { positiveCount: number; negativeCount: number }) {
  return (
    <div className={styles.stack}>
      {positiveCount > 0 && <SkeletonCard rows={positiveCount} titleWidth={120} />}
      {negativeCount > 0 && <SkeletonCard rows={negativeCount} titleWidth={184} />}
    </div>
  );
}
