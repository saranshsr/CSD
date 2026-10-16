import { layout } from '../../../foundations/tokens';
import { formatPrice, type Product } from '../../../data';
import { copy, discountPercent, money, type PdpContent, type VariantGroup, type VariantOption } from '../data';
import { pdpTokens } from '../tokens';
import { Asset, DashedLine } from './Asset';
import { Card } from './Sections';
import styles from '../pdp.module.css';

export type VariantSelection = Record<string, number>;

/**
 * Variants NoonSectionCard: NoonSizeVariantSelection (fashion sizes) + NoonOptionsSelection (groups).
 * Content gap 24 only when both exist (`variantsContent`).
 */
export function VariantsCard({ product, content, selection, onSelect, onSizeGuide, onLearnMore }: { product: Product; content: PdpContent; selection: VariantSelection; onSelect: (group: string, i: number) => void; onSizeGuide: () => void; onLearnMore: () => void }) {
  if (!content.sizes && content.groups.length === 0) return null;
  return (
    <Card contentGap={content.sizes && content.groups.length ? 24 : undefined}>
      {content.sizes && (
        <div className={styles.variantGroup}>
          <div className={styles.variantTitleRow}>
            <span className={styles.sizeTitle}>{copy.size}</span>
            {content.sizes.sizeGuide && (
              <button type="button" className={styles.linkBtn} onClick={onSizeGuide}>
                {copy.sizeGuide}
                <Asset name="rightChevron" size={16} tint="var(--nk-color-brand-blue)" flip />
              </button>
            )}
          </div>
          <Chips group={{ name: 'size', options: content.sizes.options }} selected={selection.size ?? -1} onSelect={(i) => onSelect('size', i)} product={product} />
        </div>
      )}
      {content.groups.length > 0 && (
        <div className={styles.optionsContainer}>
          {content.groups.map((g) => (
            <OptionGroup key={g.name} group={g} selected={g.selected ?? selection[g.name] ?? 0} onSelect={(i) => onSelect(g.name, i)} onLearnMore={onLearnMore} product={product} />
          ))}
        </div>
      )}
    </Card>
  );
}

const isNewVariant = (g: VariantGroup) => g.options.some((o) => o.price != null || o.salePrice != null);

function OptionGroup({ group, selected, onSelect, onLearnMore, product }: { group: VariantGroup; selected: number; onSelect: (i: number) => void; onLearnMore: () => void; product: Product }) {
  const nv = isNewVariant(group);
  return (
    <div className={styles.variantGroup}>
      <div className={styles.variantTitleRow}>
        <span>
          <span className={styles.optionTitle}>{nv ? `${group.name}: ` : group.name}</span>
          {nv && <span className={styles.optionSelected}>{group.options[selected]?.name}</span>}
        </span>
        {group.versionGuide && (
          <button type="button" className={styles.linkBtn} onClick={onLearnMore}>
            <Asset name="info" size={16} />
            {copy.learnMore}
          </button>
        )}
      </div>
      <Chips group={group} selected={selected} onSelect={onSelect} product={product} />
    </div>
  );
}

/** HorizontalScrollView of NoonSelectionItem. */
function Chips({ group, selected, onSelect, product }: { group: VariantGroup; selected: number; onSelect: (i: number) => void; product: Product }) {
  const nv = isNewVariant(group);
  const firstTag = !!group.options[0]?.tag;
  return (
    <div className={styles.chips}>
      {group.options.map((o, i) => (
        <SelectionItem key={o.name} option={o} isNewVariant={nv} selected={i === selected} tagOffset={firstTag && i === 0} onSelect={() => onSelect(i)} product={product} />
      ))}
    </div>
  );
}

/**
 * NoonSelectionItem: 1px lightGreyColor r12 tile, padding 12 (image 8·12·12), selected 1.5px paleAzure + 600,
 * disabled dashed lightGrey on #F9F9FB. Width = screen × 0.3 when it has an image or prices.
 */
function SelectionItem({ option, isNewVariant: nv, selected, tagOffset, onSelect, product }: { option: VariantOption; isNewVariant: boolean; selected: boolean; tagOffset: boolean; onSelect: () => void; product: Product }) {
  const disabled = !option.available;
  const hasImage = !!option.swatch || !!option.image;
  const primary = option.salePrice ?? option.price;
  const showDash = nv && (primary != null || disabled);
  const showSaleExtras = option.salePrice != null && option.price != null;
  const showDetails = (disabled && nv) || primary != null;
  const width = hasImage || nv ? layout.deviceWidth * pdpTokens.variantChipWidth : undefined;
  return (
    <div className={styles.chipWrap} data-tag-offset={tagOffset || undefined}>
      {option.tag && <BestValueTag text={option.tag} />}
      <button
        type="button"
        className={styles.chip}
        data-image={hasImage || undefined}
        data-selected={(selected && !disabled) || undefined}
        data-disabled={disabled || undefined}
        disabled={disabled || selected}
        onClick={onSelect}
        style={{ width, minWidth: layout.deviceWidth * pdpTokens.variantMinWidth }}
      >
        {option.image && (
          <span className={styles.chipImage}>
            <img alt="" src={option.image} className={styles.chipPhoto} />
            {disabled && <span className={styles.imageDim} />}
          </span>
        )}
        {!option.image && hasImage && (
          <span className={styles.chipImage} style={{ background: `radial-gradient(circle at 50% 40%, var(--nk-color-bg-surface) 0%, ${option.swatch}33 60%, ${option.swatch}66 100%)` }}>
            {product.emoji}
            {disabled && <span className={styles.imageDim} />}
          </span>
        )}
        <span className={styles.chipBody}>
          <span className={styles.chipName} data-one={nv || undefined} data-image-new={(hasImage && nv) || undefined}>
            {option.name}
          </span>
          {showDash && <DashedLine color={disabled ? 'var(--nk-color-border)' : 'var(--nk-palette-blue-gray200)'} style={{ margin: 'var(--nk-space-s8) 0' }} />}
          {showDetails && (
            <span className={styles.chipDetails}>
              {disabled && nv && <span className={styles.chipOos}>{copy.outOfStock}</span>}
              {primary != null && <span className={styles.chipSale}>{money(primary)}</span>}
              {showSaleExtras && (
                <span className={styles.chipPriceRow}>
                  <span className={styles.chipWas}>{formatPrice(option.price!)}</span>
                  <span className={styles.chipOff}>{copy.off(discountPercent(option.price!, option.salePrice))}</span>
                </span>
              )}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

/** NoonBestValueTag: 14px azureBlue ribbon (8/800 italic uppercase) with the fold + tip SVGs from master. */
function BestValueTag({ text }: { text: string }) {
  return (
    <span className={styles.bestValue}>
      <span className={styles.bestValueBody}>
        <span className={styles.bestValueText}>{text}</span>
        <svg className={styles.bestValueFold} width="7" height="20" viewBox="0 0 7 20" aria-hidden>
          <path fill="var(--nk-color-primary-bright)" d="M0 11.137h3.58v5.829H0v-5.83Z" />
          <path fill="var(--nk-palette-azure-blue-dark)" d="M0 16.91a2.915 2.915 0 0 1 2.914-2.914h3.243v5.83H2.914A2.915 2.915 0 0 1 0 16.91Z" />
        </svg>
      </span>
      <svg className={styles.bestValueTip} width="8" height="14" fill="none" aria-hidden>
        <path fill="var(--nk-color-primary-bright)" d="M0 14c2.17 0 4.09-1.41 4.73-3.48L7.6 1.3C7.8.66 7.32 0 6.64 0H0" />
      </svg>
    </span>
  );
}
