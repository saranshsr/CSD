import { Icon, Pressable, ProductImage } from '../../../components';
import type { Product } from '../../../data';
import { ref } from '../../../foundations/tokens';

/** Bolds the matched part of `text` (NoonSearchSuggestionRow highlight). */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (i < 0 || !query.trim()) return <>{text}</>;
  const end = i + query.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <b style={{ fontWeight: 700, color: 'var(--nk-color-text-strong)' }}>{text.slice(i, end)}</b>
      {text.slice(end)}
    </>
  );
}

/** Suggestion row: 44h, r12, 48×48 thumb (r6) or 16px search icon, 14px #404553, optional "in {category}" #3866DF, trailing set-arrow. */
export function SuggestionRow({ text, query, product, category, onPress, onFill }: { text: string; query: string; product?: Product; category?: string; onPress: () => void; onFill: () => void }) {
  return (
    <Pressable onClick={onPress} scale={0.98} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 44, padding: 4, borderRadius: 12 }}>
      {product ? (
        <ProductImage product={product} width={48} height={48} radius={6} style={{ border: '1px solid var(--nk-color-border-subtle)' }} />
      ) : (
        <span style={{ width: 48, display: 'flex', justifyContent: 'center', color: 'var(--nk-color-text-legacy)' }}>
          <Icon name="search" size={18} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: ref.type('body'), color: 'var(--nk-color-text-legacy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <Highlight text={text} query={query} />
        </span>
        {category && <span style={{ font: ref.type('text12MediumLh16'), color: 'var(--nk-color-badge)' }}>in {category}</span>}
      </span>
      <span
        role="button"
        aria-label="Use suggestion"
        onClick={(e) => {
          e.stopPropagation();
          onFill();
        }}
        style={{ display: 'flex', margin: 8, color: 'var(--nk-color-text-secondary)', transform: 'rotate(-45deg)' }}
      >
        <Icon name="arrowUp" size={18} />
      </span>
    </Pressable>
  );
}
