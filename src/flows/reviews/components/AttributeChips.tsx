import { Pressable } from '../../../components';
import { palette } from '../../../foundations/palette';
import { pill } from '../../../foundations/tokens';
import { haptic } from '../../../motion/haptics';
import { spring, supermall } from '../../../motion/presets';
import styles from './AttributeChips.module.css';

export interface AttributeChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  /** 'md' = 40px (NewReview, Figma 7629:275417) · 'sm' = 36px (RatePastOrders, Figma 9129:106814) */
  size?: 'md' | 'sm';
}

/**
 * One selectable attribute chip. Idle: white, 1px `border` (#eaecf0), 14/20 SemiBold `textMuted` (#475067);
 * selected: `textStrong` border (#101628) + `textPrimary` label (#1d2539). Press dip = `pill.pressScale` (.94,
 * repo `tapStrong`), `tap` haptic. Flow-local because the central `Pill` can't express the R&R selected label
 * colour or the 36/40 heights (its `tag` variant keeps one colour and pads instead of fixing a height).
 * Repo: border on spring.snappy, label colour .18s → kit selection cross-fade (supermall.ease.soft, .26s).
 */
export function AttributeChip({ label, selected, onToggle, size = 'md' }: AttributeChipProps) {
  return (
    <Pressable
      className={styles.chip}
      data-size={size}
      aria-pressed={selected}
      scale={pill.pressScale}
      // selection = border + label cross-fade, no movement (motion.md "is selected": ease.soft, swap.fill .26s);
      // motion can't tween var() colours, so the palette values behind border / textStrong / textMuted / textPrimary
      initial={false}
      animate={{ borderColor: selected ? palette.charcoalNavy : palette.lightGreyColor, color: selected ? palette.blueGray900 : palette.slateBlueGray }}
      transition={{ ...spring.press, borderColor: { duration: supermall.swap.fill, ease: supermall.ease.soft }, color: { duration: supermall.swap.fill, ease: supermall.ease.soft } }}
      onClick={() => {
        haptic('tap');
        onToggle();
      }}
    >
      {label}
    </Pressable>
  );
}

export interface AttributeChipsProps {
  /** group title, e.g. copy.wentWell / copy.couldBeBetter. Omit for a bare chip wrap. */
  title?: string;
  /** the chips to show (usually `attributesFor(product, rating).positives`) */
  items: string[];
  /** currently picked items */
  selected: readonly string[];
  onToggle: (item: string) => void;
  size?: 'md' | 'sm';
  className?: string;
}

/**
 * AttributeChips — R&R 2.0 "What went well?" / "What could have been better?" chip group (repo
 * src/screens/NewReviewScreen.tsx ChipGroup + Chip; RatePastOrdersScreen.tsx Chip36; Figma KzR8dy12uT8CtgBRHHY6Qx
 * · 7629:275417 / 9129:106814). Title 16/22 Bold (`section`), 12px gap, chips wrap 8px apart. Renders nothing
 * when `items` is empty (a 1★ / 5★ rating empties one of the two pools).
 */
export function AttributeChips({ title, items, selected, onToggle, size = 'md', className }: AttributeChipsProps) {
  if (items.length === 0) return null;
  return (
    <div className={[styles.group, className].filter(Boolean).join(' ')}>
      {title && <span className={styles.title}>{title}</span>}
      <div className={styles.wrap}>
        {items.map((item) => (
          <AttributeChip key={item} label={item} size={size} selected={selected.includes(item)} onToggle={() => onToggle(item)} />
        ))}
      </div>
    </div>
  );
}
