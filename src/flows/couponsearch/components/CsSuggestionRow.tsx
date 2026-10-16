import { OriginIcon, Pressable } from '../../../components';
import type { Product } from '../../../data';
import { field } from '../../../foundations/tokens';
import styles from '../search.module.css';

/**
 * The match in B14 Bold #1D2539, the rest B14 Regular #475067, as the team file's rows draw it: the first typed word
 * where it first appears ("se" → **se**rum, hair **se**rum; "serum" → niacinamide **serum**; "seiko watch" → **seiko**
 * 5 sports).
 */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase().split(/\s+/)[0] ?? '';
  const l = text.toLowerCase();
  const i = q ? (l.startsWith(q) ? 0 : l.indexOf(' ' + q) + 1 || l.indexOf(q)) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <b>{text.slice(i, i + q.length)}</b>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * Suggestion row of the team file: 52 high, padding 6 / 16, gap 12; 40 × 40 r8 product photo on white (or the search
 * icon when there's no photo); 14 / 20 label with the match in bold; 20px Origin arrow-up-left that fills the field.
 */
export function CsSuggestionRow({ text, query, product, onPress, onFill }: { text: string; query: string; product?: Product; onPress: () => void; onFill: () => void }) {
  return (
    <Pressable asDiv className={styles.sg} scale={0.98} onClick={onPress}>
      <span className={styles.sgThumb}>
        {product?.image ? <img src={product.image} alt="" draggable={false} /> : <OriginIcon name="search" size={20} color={field.textTertiary} />}
      </span>
      <span className={styles.sgText}>
        <Highlight text={text} query={query} />
      </span>
      <span
        role="button"
        aria-label="Use suggestion"
        className={styles.sgFill}
        onClick={(e) => {
          e.stopPropagation();
          onFill();
        }}
      >
        <OriginIcon name="arrow-up-left" size={20} color={field.textSecondary} />
      </span>
    </Pressable>
  );
}
