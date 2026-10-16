import { useLayoutEffect, useRef } from 'react';
import { Spinner } from '../../../../components';
import { formatPrice, type Product } from '../../../../data';
import { copy, discountPercent, money, type PdpContent, type VariantGroup, type VariantOption } from '../../data';
import { Card } from '../Sections';
import type { VariantSelection } from '../Variants';
import styles from './SfVariantsCard.module.css';

type Kind = 'pill' | 'image' | 'price';

/** Figma 3499:75276 group order: Model Name → Colour Name → Internal Memory → Version (others keep their place after memory). */
const orderOf = (name: string) => (/model/i.test(name) ? 0 : /colou?r/i.test(name) ? 1 : /version/i.test(name) ? 3 : 2);

/** Same rule as Variants.tsx `isNewVariant`: options carrying prices → price tiles — except Model Name / Version, which are text pills in the New PDP (64:5592). */
const hasPrices = (g: VariantGroup) => g.options.some((o) => o.price != null || o.salePrice != null);
const kindOf = (g: VariantGroup): Kind => (g.options.some((o) => o.image || o.swatch) ? 'image' : /model|version/i.test(g.name) ? 'pill' : hasPrices(g) ? 'price' : 'pill');

/**
 * New PDP "Variant picker" (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5592; earlier Storefront 3499:75276): 14/600 group titles,
 * gap 24, card pb 16. Text pills hug their label (14/500, padding 12) and scroll; colour cards and memory tiles share
 * the row in thirds; memory tiles read name · dashed rule · price + was · "% OFF". Selected = 1.5px pale-azure + soft
 * shadow; unavailable = dashed light grey on blue-gray/100, muted, "OUT OF STOCK".
 *
 * Storefront "Variant picker" (Figma 3499:75276). Replaces VariantsCard with the same props and selection logic:
 * fashion sizes (selection.size, "Size Guide" → onSizeGuide) then `content.groups` (selected = g.selected ??
 * selection[g.name] ?? 0, "Learn more" → onLearnMore when versionGuide). Text pills (Model Name / Version / sizes),
 * image tiles (Colour Name), price tiles (Internal Memory: name, dashed rule, % OFF, price + was). Selected = pale-azure
 * border + 600 + soft shadow; unavailable = dashed light-grey on blue-gray/100, greyed, not tappable.
 */
/**
 * Behaviour (bappzaar master NoonProductDetails → NoonSizeVariantSelection / NoonOptionsSelection / NoonSelectionItem):
 * a size tap switches the variant in place (no loader); an option tap refetches the SKU, so `loading` lays a white 80%
 * scrim with a loader over the option groups only (`loaderWrapper`) until the page updates. Selected and unavailable
 * tiles aren't tappable. Each row scrolls its selected tile into view once, when it first lays out (HorizontalScrollView
 * `selectedIndex`, no `scrollOnSelectedIndexChange`). See MAPPING.md → Variant selection.
 */
export function SfVariantsCard({ product, content, selection, loading, onSelect, onSizeGuide, onLearnMore }: { product: Product; content: PdpContent; selection: VariantSelection; loading?: boolean; onSelect: (group: string, i: number) => void; onSizeGuide: () => void; onLearnMore: () => void }) {
  if (!content.sizes && content.groups.length === 0) return null;
  const groups = content.groups.map((g, i) => ({ g, i })).sort((a, b) => orderOf(a.g.name) - orderOf(b.g.name) || a.i - b.i);
  return (
    <Card contentGap={24} className={styles.picker}>
      {content.sizes && (
        <Group
          title={copy.size}
          link={content.sizes.sizeGuide ? { label: copy.sizeGuide, onClick: onSizeGuide } : undefined}
          kind="pill"
          options={content.sizes.options}
          selected={selection.size ?? -1}
          onSelect={(i) => onSelect('size', i)}
          product={product}
        />
      )}
      {groups.length > 0 && (
        <div className={styles.options}>
          {groups.map(({ g }) => (
        <Group
          key={g.name}
          title={g.name}
          link={g.versionGuide ? { label: copy.learnMore, onClick: onLearnMore } : undefined}
          kind={kindOf(g)}
          options={g.options}
          selected={g.selected ?? selection[g.name] ?? 0}
          onSelect={(i) => onSelect(g.name, i)}
          product={product}
        />
          ))}
          {loading && (
            <div className={styles.loader}>
              <Spinner size={28} color="var(--nk-color-cta)" track="var(--nk-color-border)" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Group({ title, link, kind, options, selected, onSelect, product }: { title: string; link?: { label: string; onClick: () => void }; kind: Kind; options: VariantOption[]; selected: number; onSelect: (i: number) => void; product: Product }) {
  const rowRef = useRef<HTMLDivElement>(null);
  // HorizontalScrollView: scroll to the selected tile once the row has laid out (not again when the selection changes)
  useLayoutEffect(() => {
    const row = rowRef.current;
    const tile = row?.children[selected] as HTMLElement | undefined;
    if (row && tile && row.scrollWidth > row.clientWidth) row.scrollTo({ left: Math.min(tile.offsetLeft - row.offsetLeft, row.scrollWidth - row.clientWidth), behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);
  // NoonOptionsSelection hides a group with no available option
  if (!options.some((o) => o.available)) return null;
  return (
    <div className={styles.group}>
      <div className={styles.titleRow}>
        <span className={styles.title}>{title}</span>
        {link && (
          <button type="button" className={styles.link} onClick={link.onClick}>
            {link.label}
          </button>
        )}
      </div>
      <div ref={rowRef} className={styles.row} data-kind={kind}>
        {options.map((o, i) => (
          <Tile key={o.name} kind={kind} option={o} selected={i === selected} onSelect={() => onSelect(i)} product={product} />
        ))}
      </div>
    </div>
  );
}

function Tile({ kind, option, selected, onSelect, product }: { kind: Kind; option: VariantOption; selected: boolean; onSelect: () => void; product: Product }) {
  const disabled = !option.available;
  // NoonSelectionItem: an unavailable option that is the current SKU (opened out of stock) keeps a solid border
  const state = disabled ? (selected ? 'current-disabled' : 'disabled') : selected ? 'selected' : undefined;
  const sale = option.salePrice ?? option.price;
  const was = option.salePrice != null && option.price != null && option.price > option.salePrice ? option.price : undefined;
  const off = was != null ? discountPercent(was, option.salePrice) : 0;
  return (
    <button
      type="button"
      className={styles.tile}
      data-kind={kind}
      data-state={state}
      disabled={disabled || selected}
      aria-pressed={selected && !disabled}
      aria-label={disabled ? `${option.name}, ${copy.outOfStock}` : undefined}
      onClick={onSelect}
    >
      {kind === 'image' && (
        <span className={styles.image}>
          {option.image ? (
            <img alt="" src={option.image} className={styles.photo} draggable={false} />
          ) : (
            <span className={styles.swatch} style={{ background: `radial-gradient(circle at 50% 40%, var(--nk-color-bg-surface) 0%, ${option.swatch}33 60%, ${option.swatch}66 100%)` }}>
              {product.emoji}
            </span>
          )}
        </span>
      )}
      <span className={styles.name}>{option.name}</span>
      {kind === 'price' && (sale != null || disabled) && (
        <>
          <DashRule />
          <span className={styles.details}>
            {disabled || sale == null ? (
              <span className={styles.oos}>{copy.outOfStock}</span>
            ) : (
              <>
                <span className={styles.priceRow}>
                  <span className={styles.sale}>{money(sale)}</span>
                  {was != null && <span className={styles.was}>{formatPrice(was)}</span>}
                </span>
                {/* the "% OFF" line is always reserved, so a SKU switch that adds / drops a discount keeps the tile height */}
                <span className={styles.off} style={off > 0 ? undefined : { visibility: 'hidden' }} aria-hidden={off > 0 ? undefined : true}>
                  {off > 0 ? copy.off(off) : '\u00a0'}
                </span>
              </>
            )}
          </span>
        </>
      )}
    </button>
  );
}

/** Figma Line 1: 1px blue-gray/200, round caps, dash 4 / gap 4. */
function DashRule() {
  return (
    <svg className={styles.dash} width="100%" height="1" aria-hidden>
      <line x1="0.5" y1="0.5" x2="100%" y2="0.5" stroke="var(--nk-color-border-subtle)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 4" />
    </svg>
  );
}
