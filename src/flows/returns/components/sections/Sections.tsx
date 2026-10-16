import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Icon, ProductImage } from '../../../../components';
import type { Product } from '../../../../data';
import { icons, images } from '../../assets';
import { copy, estimatedRefund, evidenceConfig, pickupSection, reasons, refundSection, resolution, type PickupOption, type Reason, type RefundOption, type SubReason } from '../../data';
import { PRODUCT_PHOTO } from '../../store';
import { returnsTokens } from '../../tokens';
import { Svg, Tap } from '../AFSButton';
import { CommentInput } from '../CommentInput';
import { Dashed } from '../Dashed';
import { PhotoGuideCarousel } from './PhotoGuide';
import styles from '../../submit.module.css';

/** components/AFSReturnsAnimatedSection — enter: opacity 250 ms out-cubic + translateY −16 → 0 spring; exit: none (fade-out 0) */
export function AnimatedSection({ children, className, animateEnter = true }: { children: ReactNode; className?: string; animateEnter?: boolean }) {
  return (
    <motion.div
      className={className}
      initial={animateEnter ? { opacity: 0, y: -returnsTokens.sectionOffset } : false}
      animate={{ opacity: 1, y: 0, transition: { opacity: returnsTokens.fadeIn, y: returnsTokens.sectionSpring } }}
    >
      {children}
    </motion.div>
  );
}

/** components/AFSReturnsAnimatedFade — FadeIn / FadeOut 250 ms */
export function Fade({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: returnsTokens.fadeIn.duration }}>
      {children}
    </motion.div>
  );
}

/** SD reason iconUrl (illustration) → demo tile */
export function ReasonArt({ reason, size }: { reason: Reason; size?: number }) {
  return (
    <span className={styles.reasonArt} style={size ? { width: size, height: size, fontSize: size * 0.5, borderRadius: 8 } : undefined}>
      {reason.art}
    </span>
  );
}

export type Asset = { id: string; src: string };
export const Photo = ({ src, product }: { src: string; product: Product }) => (src === PRODUCT_PHOTO ? <ProductImage product={product} width="100%" height="100%" /> : <img src={src} alt="" className={styles.photoImg} />);

// ───────────────────────────── reason ─────────────────────────────

/** sections/AFSReturnsReasonSection — 2-column cards, dimmed 0.2 + blur, sub-reason dropdown under the row */
export function ReasonSection({ selected, sub, onReason, onSub }: { selected: Reason | null; sub: SubReason | null; onReason: (r: Reason | null) => void; onSub: (s: SubReason) => void }) {
  const rows: Reason[][] = [];
  for (let i = 0; i < reasons.length; i += 2) rows.push(reasons.slice(i, i + 2));
  return (
    <AnimatedSection className={styles.sectionCard} animateEnter={!!selected}>
      <div className={styles.sectionGap16}>
        <span className={styles.reasonTitle}>{copy.reasonQuestion}</span>
        <div className={styles.grid}>
          {rows.map((row) => {
            const inRow = row.find((r) => r.code === selected?.code);
            const open = !!inRow && inRow.subReasonList.length > 0;
            return (
              <div key={row.map((r) => r.code).join('-')} className={styles.gridBlock}>
                <div className={styles.gridRow}>
                  {row.map((r) => {
                    const on = selected?.code === r.code;
                    const dim = !!selected && !on;
                    return (
                      <motion.div key={r.code} className={styles.cardWrap} animate={{ opacity: dim ? returnsTokens.reasonDimmedOpacity : 1 }} transition={{ duration: returnsTokens.fadeIn.duration }}>
                        <Tap className={[styles.reasonCard, on && styles.reasonCardOn].filter(Boolean).join(' ')} onPress={() => onReason(on ? null : r)}>
                          <span className={styles.reasonIcon}>
                            <ReasonArt reason={r} />
                          </span>
                          <span className={styles.reasonTextBox}>
                            <span className={styles.reasonText}>{r.name}</span>
                          </span>
                          {on && (
                            <span className={styles.reasonCheck}>
                              <Svg src={icons.radioCheckedTick} size={18} />
                            </span>
                          )}
                          {dim && <span className={styles.reasonBlur} />}
                        </Tap>
                      </motion.div>
                    );
                  })}
                </div>
                <AnimatePresence initial={false}>
                  {open && inRow && (
                    <motion.div
                      key={inRow.code}
                      className={styles.collapse}
                      initial={{ height: 0 }}
                      animate={{ height: 'auto', transition: returnsTokens.sectionSpring }}
                      exit={{ height: 0, transition: returnsTokens.fadeOut }}
                    >
                      <motion.div initial={{ opacity: 0, y: -returnsTokens.sectionOffset }} animate={{ opacity: 1, y: 0, transition: { opacity: returnsTokens.fadeIn, y: returnsTokens.sectionSpring } }} exit={{ opacity: 0, transition: returnsTokens.fadeOut }}>
                        <div className={styles.dropdown}>
                          <span className={styles.dropdownTitle}>{copy.subReasonQuestion}</span>
                          <div className={styles.subList}>
                            {inRow.subReasonList.map((s, i) => (
                              <div key={s.code}>
                                {i > 0 && (
                                  <div className={styles.subSep}>
                                    <Dashed color="var(--nk-color-border)" />
                                  </div>
                                )}
                                <Tap className={styles.subItem} scale={0.99} onPress={() => onSub(s)}>
                                  <span className={[styles.subText, sub?.code === s.code && styles.subTextOn].filter(Boolean).join(' ')}>{s.name}</span>
                                  <Svg src={sub?.code === s.code ? icons.radioChecked2 : icons.radioUnchecked2} size={20} />
                                </Tap>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}

// ───────────────────────────── evidence ─────────────────────────────

/** sections/AFSReturnsEvidenceSection — camera / gallery tiles, 3-col grid, note, photo guide */
export function EvidenceSection({
  product,
  assets,
  note,
  onCamera,
  onGallery,
  onAdd,
  onRemove,
  onNote,
  onGuide,
  guidePhotos,
}: {
  product: Product;
  assets: Asset[];
  note: string;
  onCamera: () => void;
  onGallery: () => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onNote: (v: string) => void;
  onGuide: () => void;
  guidePhotos: ReactNode[];
}) {
  const { images: img, comment, uploadGuideline } = evidenceConfig;
  const hasAssets = assets.length > 0;
  const hasText = note.trim().length > 0;
  const hasGuide = guidePhotos.length > 0 && uploadGuideline.sectionsV2.length > 0;
  const guideCard = hasGuide && !hasAssets && !hasText;
  const guideBtn = !guideCard && hasGuide;
  const limit = assets.length >= img.maxCount;
  const count = assets.length;
  const header =
    count === 0 && img.minCount > 0 ? { text: copy.photosMin(img.minCount), hi: false } : count < img.minCount ? { text: copy.photosRemaining(img.minCount - count), hi: true } : { text: copy.photosMax(img.maxCount), hi: false };
  return (
    <div className={[styles.evidence, guideCard && styles.evidenceGuide].filter(Boolean).join(' ')}>
      <AnimatedSection>
        <div className={styles.evHeader}>
          <span className={styles.evTitle}>{img.title}</span>
          <span className={[styles.evSubtitle, header.hi && styles.evSubtitleHi].filter(Boolean).join(' ')}>{header.text}</span>
        </div>
        <AnimatePresence initial={false}>
          {!hasAssets && (
            <Fade key="buttons" className={styles.evButtons}>
              <Tap className={[styles.evButton, limit && styles.disabled].filter(Boolean).join(' ')} disabled={limit} onPress={onCamera}>
                <Svg src={icons.camera} size={24} />
                <span className={styles.evButtonText}>{copy.camera}</span>
              </Tap>
              <Tap className={[styles.evButton, limit && styles.disabled].filter(Boolean).join(' ')} disabled={limit} onPress={onGallery}>
                <Svg src={icons.gallery} size={24} />
                <span className={styles.evButtonText}>{copy.gallery}</span>
              </Tap>
            </Fade>
          )}
          {hasAssets && (
            <Fade key="grid" className={styles.evImages}>
              <div className={styles.imageGrid}>
                <AnimatePresence initial={false}>
                  {assets.map((a) => (
                    <motion.div key={a.id} layout className={styles.gridItem} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: returnsTokens.fadeIn.duration, ease: returnsTokens.fadeIn.ease }}>
                      <div className={styles.photo}>
                        <Photo src={a.src} product={product} />
                        <Tap className={styles.photoRemove} onPress={() => onRemove(a.id)}>
                          <Svg src={icons.cross} size={14} />
                        </Tap>
                      </div>
                    </motion.div>
                  ))}
                  {!limit && (
                    <motion.div key="add" layout className={styles.gridItem} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
                      <Tap className={styles.addTile} onPress={onAdd}>
                        <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
                          <path
                            d="M21.5832 13.1253H14.8748V6.41699C14.8748 5.93428 14.4825 5.54199 13.9998 5.54199C13.5171 5.54199 13.1248 5.93428 13.1248 6.41699V13.1253H6.4165C5.9338 13.1253 5.5415 13.5176 5.5415 14.0003C5.5415 14.483 5.9338 14.8753 6.4165 14.8753H13.1248V21.5837C13.1248 22.0664 13.5171 22.4587 13.9998 22.4587C14.4825 22.4587 14.8748 22.0664 14.8748 21.5837V14.8753H21.5832C22.0659 14.8753 22.4582 14.483 22.4582 14.0003C22.4582 13.5176 22.0659 13.1253 21.5832 13.1253Z"
                            fill="var(--nk-color-primary)"
                          />
                        </svg>
                      </Tap>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Fade>
          )}
          {guideBtn && (
            <Fade key="guideBtn" className={styles.evOptions}>
              <Tap className={styles.evOption} onPress={onGuide}>
                <Svg src={icons.camera} size={16} />
                <span className={styles.evOptionText}>{copy.photoGuide}</span>
              </Tap>
            </Fade>
          )}
          {(hasAssets || hasText) && (
            <Fade key="note" className={styles.evNote}>
              <CommentInput note={note} placeholder={comment.title} minLength={comment.minLength} maxLength={comment.maxLength} mandatory={comment.mandatory} onChange={onNote} />
            </Fade>
          )}
          {guideCard && (
            <Fade key="guideCard">
              <PhotoGuideCarousel photos={guidePhotos} captions={uploadGuideline.sectionsV2} onPress={onGuide} />
            </Fade>
          )}
        </AnimatePresence>
      </AnimatedSection>
    </div>
  );
}

// ───────────────────────────── resolution / refund ─────────────────────────────

/** AFSReturnsEstimatedRefundButton — #E3FCF2 r10, green 14/600 + 14/700 amount + arrow */
export function EstimatedRefundButton({ product, onPress }: { product: Product; onPress: () => void }) {
  const r = estimatedRefund(product);
  return (
    <Tap className={styles.estimated} onPress={onPress}>
      <span className={styles.estimatedTitle}>{r.title}</span>
      <span className={styles.estimatedAmountBox}>
        <span className={styles.estimatedAmount}>{r.amount}</span>
        <Svg src={icons.arrowBottomGreen} width={11} height={6} />
      </span>
    </Tap>
  );
}

/** sections/AFSReturnsResolutionSection (return_mode) */
export function ResolutionSection({ product, selected, onSelect, onEstimated }: { product: Product; selected: string | null; onSelect: (code: string) => void; onEstimated: () => void }) {
  return (
    <AnimatedSection className={styles.sectionCard}>
      <div className={styles.sectionGap16}>
        <span className={styles.sectionTitle}>{resolution.titleV2}</span>
        <div className={styles.modes}>
          {resolution.modes.map((m) => {
            const on = selected === m.code;
            return (
              <Tap key={m.code} className={[styles.mode, on && styles.modeOn].filter(Boolean).join(' ')} onPress={() => onSelect(m.code)}>
                <span className={styles.modeContent}>
                  <span className={styles.modeTitleRow}>
                    {/* SD iconUrl (24) → kit glyph */}
                    <span className={styles.modeIcon}>
                      <Icon name={m.icon} size={22} color="var(--nk-color-text-primary)" />
                    </span>
                    <span className={styles.modeTexts}>
                      <span className={styles.modeTitle}>{m.titleV2}</span>
                      <span className={styles.small}>{m.subtitleV2}</span>
                    </span>
                  </span>
                  <span className={styles.modeRadio}>
                    <Svg src={on ? icons.radioChecked2 : icons.radioUnchecked2} size={20} />
                  </span>
                </span>
                <span className={styles.modeSep} />
                <span className={styles.modeAmountRow}>
                  <span className={styles.modeAmount}>{m.amount(product)}</span>
                  <span className={styles.modeDot}>•</span>
                  <span className={styles.modeDesc}>{m.descV2}</span>
                </span>
              </Tap>
            );
          })}
        </div>
        {selected === 'refund' && <EstimatedRefundButton product={product} onPress={onEstimated} />}
      </div>
    </AnimatedSection>
  );
}

const sourceIcon = (o: RefundOption['sources'][number]) => (o.icon === 'card' ? images.cardMastercard : images.noonCredit);

/** sections/AFSReturnsRefundSection (refund_method) */
export function RefundSection({ product, selected, onSelect, onEstimated }: { product: Product; selected: string; onSelect: (flow: string) => void; onEstimated: () => void }) {
  const single = refundSection.options.length < 2;
  return (
    <AnimatedSection className={styles.sectionCard}>
      <div className={styles.sectionGap16}>
        <span className={styles.refundTitle}>{refundSection.title}</span>
        <div className={styles.modes}>
          {refundSection.options.map((o) => {
            const on = selected === o.refundFlow;
            const singleSourceWithTag = o.sources.length === 1 && !!o.tag;
            return (
              <Tap key={o.refundFlow} scale={single ? 1 : returnsTokens.pressScale} className={[styles.option, on && !single && styles.optionOn].filter(Boolean).join(' ')} onPress={() => onSelect(o.refundFlow)}>
                <span className={styles.optionContent}>
                  <span className={styles.sources}>
                    {o.sources.map((s, i) => (
                      <span key={s.code} className={styles.sourceWrap}>
                        <span className={styles.source}>
                          <span className={styles.sourceIcon}>
                            <img src={sourceIcon(s)} alt="" className={styles.sourceImg} />
                          </span>
                          <span className={styles.sourceTexts}>
                            <span className={styles.sourceTitle}>{s.title}</span>
                            {singleSourceWithTag && <span className={styles.small}>{o.desc}</span>}
                          </span>
                        </span>
                        {i < o.sources.length - 1 && <Svg src={icons.plusBlack} size={20} />}
                      </span>
                    ))}
                  </span>
                  {!single && <Svg src={on ? icons.wcRadioChecked : icons.wcRadioUnchecked} size={20} />}
                </span>
                <span className={styles.optionSep} />
                <span className={styles.optionFooter}>{o.tag ? <span className={styles.tagTitle} style={{ color: o.tag.color }}>{o.tag.title}</span> : <span className={styles.small}>{o.desc}</span>}</span>
              </Tap>
            );
          })}
        </div>
        <EstimatedRefundButton product={product} onPress={onEstimated} />
      </div>
    </AnimatedSection>
  );
}

// ───────────────────────────── pickup ─────────────────────────────

/** sections/AFSReturnsPickupSection — "Pickup from" card on the pin island, date chips with a triangle, slot list */
export function PickupSection({
  addressTitle,
  addressSubtitle,
  optionIdx,
  slot,
  onAddress,
  onOption,
  onSlot,
}: {
  addressTitle: string;
  addressSubtitle: string;
  optionIdx: number | null;
  slot: string | null;
  onAddress: () => void;
  onOption: (i: number, o: PickupOption) => void;
  onSlot: (code: string) => void;
}) {
  const option = optionIdx == null ? null : pickupSection.options[optionIdx];
  const slots = option?.slots ?? [];
  const rocket = slots.some((s) => s.code === 'rocket');
  const singleSlot = slots.length === 1;
  const slotsBg = rocket && !singleSlot ? styles.slotsRocket : rocket ? styles.slotsRocketSingle : styles.slotsPlain;
  return (
    <AnimatedSection className={[styles.sectionCard, styles.pickupCard].join(' ')}>
      <div className={styles.pickupContent}>
        <div className={styles.pickupFrom}>
          <span className={styles.sectionTitle}>{pickupSection.addressHeader}</span>
          <Tap className={styles.fromCard} onPress={onAddress}>
            <span className={styles.fromImage} style={{ backgroundImage: `url(${images.pinIsland})` }} />
            <span className={styles.fromGradient} />
            <span className={styles.fromRow}>
              <Svg src={icons.locationPinFilled} size={24} />
              <span className={styles.fromTexts}>
                <span className={styles.fromTitle}>{addressTitle}</span>
                <span className={styles.fromSubtitle}>{addressSubtitle}</span>
              </span>
              <span className={styles.fromEdit}>
                <Svg src={icons.editPenFilled} size={18} />
              </span>
            </span>
          </Tap>
        </div>
        <div className={styles.schedule}>
          <span className={styles.sectionTitle}>{pickupSection.pickupHeader}</span>
          <div>
            <div className={['nk-hscroll', styles.dates].join(' ')}>
              {pickupSection.options.map((o, i) => {
                const on = i === optionIdx;
                const disabled = o.slots.length === 0;
                return (
                  <div key={o.date.day} className={styles.dateWrap}>
                    <Tap className={[styles.date, on && styles.dateOn, disabled && styles.disabledHalf].filter(Boolean).join(' ')} disabled={disabled} onPress={() => !on && onOption(i, o)}>
                      <span className={styles.dateDayBox}>
                        <span className={[styles.dateDayName, on && styles.dateDayNameOn].filter(Boolean).join(' ')}>{o.date.dayName}</span>
                      </span>
                      <span className={styles.dateNumberBox}>
                        <span className={styles.dateNumber}>{o.date.day}</span>
                        <span className={[styles.dateMonth, on && styles.dateMonthOn].filter(Boolean).join(' ')}>{o.date.monthName}</span>
                      </span>
                    </Tap>
                    {on && (
                      <span className={styles.triangle}>
                        <svg width={16} height={8} viewBox="0 0 16 8" aria-hidden>
                          <path d="M9.41421 0.653453C8.63316 -0.217819 7.36683 -0.217817 6.58579 0.653454L0 8H16L9.41421 0.653453Z" fill={rocket ? 'var(--nk-color-returns-supermall-light-blue)' : 'var(--nk-color-border-subtle)'} />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {slots.length > 0 && (
              <div className={[styles.slots, slotsBg].join(' ')}>
                {slots.map((s) => {
                  const isRocket = s.code === 'rocket';
                  return (
                    <Tap key={s.code} scale={singleSlot ? 1 : returnsTokens.pressScale} className={styles.slot} onPress={() => onSlot(s.code)}>
                      <span className={[styles.slotContent, isRocket && !singleSlot && styles.slotContentRocket].filter(Boolean).join(' ')}>
                        <span className={[styles.slotDesc, isRocket && styles.slotDescRocket].filter(Boolean).join(' ')}>{s.desc}</span>
                        {isRocket && <Svg src={icons.supermallTag} width={59} height={18} />}
                      </span>
                      {!singleSlot && <Svg src={s.code === slot ? icons.radioChecked2 : icons.radioUnchecked2} size={20} />}
                    </Tap>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
