import { ProductImage } from '../../../components';
import type { Product } from '../../../data';
import styles from '../variants.module.css';

/** NoonProductCartSelectionItem — r8 chip (r12 with image), #EBEBEB border, #0E0E0E when selected, dashed when OOS. */
export function VariantOptionChip({
  name,
  product,
  swatch,
  isSelected,
  isDisabled,
  isFirst,
  isLast,
  onSelect,
}: {
  name: string;
  product?: Product;
  swatch?: string;
  isSelected: boolean;
  isDisabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
}) {
  const withImage = !!(swatch && product);
  const cls = [styles.chip, withImage ? styles.chipImage : styles.chipText, isSelected && styles.chipSelected, isDisabled && styles.chipDisabled, isFirst && styles.chipFirst, isLast && styles.chipLast]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} disabled={isSelected} onClick={onSelect}>
      {withImage && (
        <span className={styles.chipImageWrap}>
          <ProductImage product={{ ...product!, tint: swatch! }} width={88} height={88} emojiScale={0.5} />
          {isDisabled && <span className={styles.oos}>Out of stock{/* noon_out_of_stock_item */}</span>}
        </span>
      )}
      <span className={[styles.chipLabel, isSelected && styles.chipLabelSelected, isDisabled && styles.chipLabelDisabled, withImage && styles.chipLabelImage].filter(Boolean).join(' ')}>{name}</span>
    </button>
  );
}
