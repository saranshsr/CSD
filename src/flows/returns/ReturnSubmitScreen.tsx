import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon, ProductImage, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import { images as imgs, icons } from './assets';
import { AFSBackHeader } from './components/AFSBackHeader';
import { AFSButton, Svg, Tap } from './components/AFSButton';
import { validateNote } from './components/CommentInput';
import { Dashed } from './components/Dashed';
import { ConfirmOverlay } from './components/overlays/DetailsOverlays';
import { EvidenceSkipOverlay, ImageGuidelineOverlay, PickupAddressOverlay, RefundDetailsOverlay, UploadImageOverlay } from './components/overlays/SubmitOverlays';
import { EvidenceSection, Fade, Photo, PickupSection, ReasonArt, ReasonSection, RefundSection, ResolutionSection, type Asset } from './components/sections/Sections';
import { addresses, cancelText, copy, estimatedRefund, evidenceConfig, pickupSection, refundSection, resolution, resolveProduct, returnNumberFor, sectionOrder, type Reason, type SectionCode, type SubReason } from './data';
import { PRODUCT_PHOTO, returnsStore } from './store';
import { returnsTokens } from './tokens';
import styles from './submit.module.css';
import ds from './details.module.css';

type Overlay = 'discardReturn' | 'discardSection' | 'refundDetails' | 'upload' | 'guide' | 'skip' | 'address';

interface Drafts {
  reason: Reason | null;
  sub: SubReason | null;
  assets: Asset[];
  note: string;
  mode: string | null;
  refundFlow: string;
  address: string;
  optionIdx: number | null;
  slot: string | null;
}

const initialDrafts: Drafts = { reason: null, sub: null, assets: [], note: '', mode: null, refundFlow: '', address: addresses[0].code, optionIdx: 0, slot: pickupSection.options[0].slots[0]?.code ?? null };
let assetSeq = 0;

/**
 * AFSReturnsReturnSubmissionScreen (features/afs/returns/screens) — server-driven sections, one at a time
 * (demo order: reason → comment_images → return_mode → refund_method → pickup_details). Completed sections
 * collapse into edit cards (AFSReturnsSectionsManager); the footer is AFSReturnsSubmitActionButton
 * (Continue / Submit Return / "Skip this step"). Submitting pushes the details screen with the success header.
 * MAPPING.md §11. `?error=1` shows AFSReturnsSubmitErrorView.
 */
export function ReturnSubmitScreen({ params }: { params: { productId?: string; orderId?: string; rootKey?: string; error?: string } }) {
  const nav = useNav();
  const product = resolveProduct(params.productId);
  const [idx, setIdx] = useState(0);
  const [drafts, setDrafts] = useState<Drafts>(initialDrafts);
  const [committed, setCommitted] = useState<Drafts>(initialDrafts);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [pendingFocus, setPendingFocus] = useState<SectionCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(params.error === '1');
  const fileRef = useRef<HTMLInputElement>(null);

  const current = sectionOrder[idx];
  const isLast = idx === sectionOrder.length - 1;
  const done = sectionOrder.slice(0, idx);
  const patch = (p: Partial<Drafts>) => setDrafts((d) => ({ ...d, ...p }));

  const commitAndNext = (next?: Partial<Drafts>) => {
    const d = { ...drafts, ...next };
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setCommitted(d);
      setDrafts(d);
      if (isLast) return finish(d);
      setIdx((i) => i + 1);
    }, returnsTokens.submitDelay);
  };

  const finish = (d: Drafts) => {
    const option = d.optionIdx == null ? null : pickupSection.options[d.optionIdx];
    const slot = option?.slots.find((s) => s.code === d.slot);
    const rec = returnsStore.create({
      returnItemNr: returnNumberFor(product),
      productId: product.id,
      reason: d.reason?.name ?? '',
      subReason: d.sub?.name ?? null,
      comment: d.note.trim() || null,
      images: d.assets.map((a) => a.src),
      pickupDateTime: option && slot ? `${option.date.dayName}, ${option.date.monthName} ${option.date.day} · ${slot.desc}` : '',
      addressCode: d.address,
    });
    setCompleted(true);
    nav.push('returns/details', { productId: product.id, returnNr: rec.returnItemNr, success: '1', rootKey: params.rootKey });
  };

  // sections manager: focusSection / isDirtySection / discardDraft
  const sectionDirty = (code: SectionCode) => {
    const keys: Record<SectionCode, (keyof Drafts)[]> = { reason: ['reason', 'sub'], comment_images: ['assets', 'note'], return_mode: ['mode'], refund_method: ['refundFlow'], pickup_details: ['address', 'optionIdx', 'slot'] };
    return keys[code].some((k) => drafts[k] !== committed[k]);
  };
  const focusSection = (code: SectionCode) => setIdx(sectionOrder.indexOf(code));
  const onSummaryPress = (code: SectionCode) => {
    if (sectionDirty(current)) {
      setPendingFocus(code);
      setOverlay('discardSection');
      return;
    }
    focusSection(code);
  };

  const handleBack = () => {
    if (submitting) return;
    if (completed || error) return nav.back();
    setOverlay('discardReturn');
  };

  // evidence
  const addAsset = (src: string) => setDrafts((d) => (d.assets.length >= evidenceConfig.images.maxCount ? d : { ...d, assets: [...d.assets, { id: `a${++assetSeq}`, src }] }));
  const onCamera = () => addAsset(product.image ?? PRODUCT_PHOTO); // demo camera: shoots the product
  const onGallery = () => fileRef.current?.click();
  const guidePhotos: ReactNode[] = [0, 1, 2].map((i) => <ProductImage key={i} product={product} width="100%" height="100%" />);

  // footer action (useAFSReturns*Section footerAction)
  const footer = useMemo((): { kind: 'submit' | 'skip'; title: string; disabled: boolean; onPress: () => void } | null => {
    if (completed) return { kind: 'submit', title: copy.goBack, disabled: false, onPress: () => nav.back() };
    const submitTitle = isLast ? copy.submitReturn : copy.continue;
    switch (current) {
      case 'reason':
        return { kind: 'submit', title: submitTitle, disabled: !drafts.reason || (drafts.reason.subReasonList.length > 0 && !drafts.sub), onPress: () => commitAndNext() };
      case 'comment_images': {
        const { images: img, comment } = evidenceConfig;
        const hasText = drafts.note.trim().length > 0;
        if (img.minCount === 0 && drafts.assets.length === 0 && !hasText)
          return { kind: 'skip', title: copy.skipStep, disabled: submitting, onPress: () => (comment.mandatory ? setOverlay('skip') : commitAndNext({ note: drafts.note.trim() })) };
        const invalid = drafts.assets.length < img.minCount || !validateNote(drafts.note, comment).isTextValid;
        return { kind: 'submit', title: submitTitle, disabled: invalid, onPress: () => commitAndNext() };
      }
      case 'return_mode':
        return { kind: 'submit', title: submitTitle, disabled: !drafts.mode, onPress: () => commitAndNext() };
      case 'refund_method':
        return { kind: 'submit', title: submitTitle, disabled: !drafts.refundFlow, onPress: () => commitAndNext() };
      case 'pickup_details':
        return { kind: 'submit', title: submitTitle, disabled: !drafts.address || drafts.optionIdx == null || !drafts.slot, onPress: () => commitAndNext() };
    }
  }, [current, drafts, isLast, completed, submitting]); // eslint-disable-line react-hooks/exhaustive-deps

  // AFSReturnsSectionsManager rows (SD prevSections[].desc / iconUrl)
  const summaryRow = (code: SectionCode): { desc: string; icon: ReactNode } => {
    switch (code) {
      case 'reason':
        return { desc: [committed.reason?.name, committed.sub?.name].filter(Boolean).join(', '), icon: committed.reason ? <ReasonArt reason={committed.reason} size={40} /> : null };
      case 'return_mode':
        return { desc: resolution.modes.find((m) => m.code === committed.mode)?.titleV2 ?? '', icon: <span className={styles.summaryGlyph}><Icon name={committed.mode === 'replacement' ? 'returns' : 'wallet'} size={22} /></span> };
      case 'refund_method': {
        const o = refundSection.options.find((x) => x.refundFlow === committed.refundFlow);
        return { desc: o?.sources.map((s) => s.title).join(' + ') ?? '', icon: <span className={styles.summaryGlyph}><img src={o?.refundFlow === 'credits' ? imgs.noonCredit : imgs.cardMastercard} alt="" width={32} height={28} style={{ objectFit: 'contain' }} /></span> };
      }
      default:
        return { desc: '', icon: null };
    }
  };

  const sectionNode = () => {
    switch (current) {
      case 'reason':
        return (
          <ReasonSection
            selected={drafts.reason}
            sub={drafts.sub}
            onReason={(r) => {
              const prev = drafts.reason?.code;
              patch({ reason: r, sub: null });
              // a reason with no sub-reasons submits right away (useAFSReturnsReasonSection)
              if (r && r.code !== prev && r.subReasonList.length === 0 && !submitting) commitAndNext({ reason: r, sub: null });
            }}
            onSub={(s) => patch({ sub: s })}
          />
        );
      case 'comment_images':
        return (
          <EvidenceSection
            product={product}
            assets={drafts.assets}
            note={drafts.note}
            onCamera={onCamera}
            onGallery={onGallery}
            onAdd={() => setOverlay('upload')}
            onRemove={(id) => patch({ assets: drafts.assets.filter((a) => a.id !== id) })}
            onNote={(note) => patch({ note })}
            onGuide={() => setOverlay('guide')}
            guidePhotos={guidePhotos}
          />
        );
      case 'return_mode':
        return <ResolutionSection product={product} selected={drafts.mode} onSelect={(mode) => patch({ mode })} onEstimated={() => setOverlay('refundDetails')} />;
      case 'refund_method':
        return <RefundSection product={product} selected={drafts.refundFlow} onSelect={(refundFlow) => patch({ refundFlow })} onEstimated={() => setOverlay('refundDetails')} />;
      case 'pickup_details': {
        const a = addresses.find((x) => x.code === drafts.address) ?? addresses[0];
        return (
          <PickupSection
            addressTitle={a.label}
            addressSubtitle={a.area}
            optionIdx={drafts.optionIdx}
            slot={drafts.slot}
            onAddress={() => setOverlay('address')}
            onOption={(i, o) => patch({ optionIdx: i, slot: o.slots[0]?.code ?? null })}
            onSlot={(slot) => patch({ slot })}
          />
        );
      }
    }
  };

  if (error) {
    return (
      <Screen background="bgSubtle" overlayHeader safeTop={false} header={<AFSBackHeader blur title="" onBack={() => nav.back()} />} contentStyle={{ paddingBottom: 0, display: 'flex', flexDirection: 'column' }}>
        <SubmitErrorView onRetry={() => setError(false)} onSupport={() => nav.toast('Help centre (noon.HelpScreen, code returns_selection)')} />
      </Screen>
    );
  }

  return (
    <>
      <Screen
        background="bgSubtle"
        overlayHeader
        safeTop={false}
        header={<AFSBackHeader blur title={current === 'reason' ? '' : copy.titleSubmit} titleClassName={styles.headerTitle} onBack={handleBack} />}
        footer={
          footer && (
            <div className={styles.footer} style={{ pointerEvents: submitting ? 'none' : undefined }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${footer.kind}-${footer.title}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: footer.disabled ? returnsTokens.footerDisabledOpacity : 1, scale: footer.disabled ? returnsTokens.footerDisabledScale : 1 }}
                  exit={{ opacity: 0 }}
                  transition={returnsTokens.fadeIn}
                  className={footer.kind === 'submit' ? styles.footerSubmit : undefined}
                >
                  {footer.kind === 'skip' ? (
                    <Tap className={[styles.skip, footer.disabled && styles.disabled].filter(Boolean).join(' ')} disabled={footer.disabled} onPress={footer.onPress}>
                      <span className={styles.skipInner}>
                        <span className={styles.skipText}>{footer.title}</span>
                        <svg className={styles.skipLine} aria-hidden>
                          <line x1="0.5" y1="0.5" x2="100%" y2="0.5" stroke="var(--nk-color-text-secondary)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 3" />
                        </svg>
                      </span>
                    </Tap>
                  ) : (
                    <AFSButton size="lg" title={footer.title} disabled={footer.disabled} loading={submitting} textClassName={styles.footerText} onPress={footer.onPress} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )
        }
        contentStyle={{ paddingBottom: 'var(--nk-space-s16)' }}
      >
        <div className={[styles.list, done.length > 0 && styles.listWithPrev].filter(Boolean).join(' ')} style={{ pointerEvents: submitting || completed ? 'none' : undefined }}>
          {done.length > 0 && (
            <div className={styles.manager}>
              {done.map((code) => (
                <motion.div key={code} layout initial={{ opacity: 0, y: returnsTokens.summaryOffset }} animate={{ opacity: 1, y: 0 }} transition={returnsTokens.fadeIn}>
                  {code === 'comment_images' ? <EvidenceSummary assets={committed.assets} note={committed.note} product={product} onPress={() => onSummaryPress(code)} /> : <SummaryCard {...summaryRow(code)} onPress={() => onSummaryPress(code)} />}
                </motion.div>
              ))}
            </div>
          )}
          <div className={styles.sectionWrap} key={current}>
            {sectionNode()}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            Array.from(e.target.files ?? []).forEach((f) => addAsset(URL.createObjectURL(f)));
            e.target.value = '';
          }}
        />
      </Screen>

      <ConfirmOverlay open={overlay === 'discardReturn'} onClosed={() => setOverlay(null)} kind="discardReturn" note={cancelText} onConfirm={() => nav.back()} />
      <ConfirmOverlay
        open={overlay === 'discardSection'}
        onClosed={() => setOverlay(null)}
        kind="discardSection"
        onConfirm={() => {
          setDrafts(committed);
          if (pendingFocus) focusSection(pendingFocus);
        }}
      />
      <RefundDetailsOverlay open={overlay === 'refundDetails'} onClosed={() => setOverlay(null)} refund={estimatedRefund(product)} />
      <UploadImageOverlay open={overlay === 'upload'} onClosed={() => setOverlay(null)} onCamera={onCamera} onGallery={onGallery} />
      <ImageGuidelineOverlay open={overlay === 'guide'} onClosed={() => setOverlay(null)} photos={guidePhotos} />
      <EvidenceSkipOverlay open={overlay === 'skip'} onClosed={() => setOverlay(null)} note={drafts.note} onConfirm={(note) => commitAndNext({ note })} />
      <PickupAddressOverlay open={overlay === 'address'} onClosed={() => setOverlay(null)} selected={drafts.address} onConfirm={(address) => patch({ address })} />
    </>
  );
}

/** AFSReturnsSectionsManager renderSection — 40px SD icon, 14/600/20 desc, edit pen 36 */
function SummaryCard({ desc, icon, onPress }: { desc: string; icon: ReactNode; onPress: () => void }) {
  return (
    <Tap className={styles.summaryCard} onPress={onPress}>
      <span className={styles.summaryContent}>
        {icon}
        <span className={styles.summaryText}>{desc}</span>
      </span>
      <Svg src={icons.editPen} size={36} />
    </Tap>
  );
}

/** AFSReturnsSectionsManager renderCommentImagesSection — photo stack or "Add photos" pill, note row */
function EvidenceSummary({ assets, note, product, onPress }: { assets: Asset[]; note: string; product: ReturnType<typeof resolveProduct>; onPress: () => void }) {
  const first = assets[0];
  return (
    <div className={styles.evSummary}>
      <Tap className={styles.evSummaryRow} onPress={onPress}>
        {first ? (
          <span className={styles.stack}>
            <span className={[styles.stackImg, styles.stackBottom].join(' ')}>
              <Photo src={first.src} product={product} />
            </span>
            <span className={[styles.stackImg, styles.stackTop].join(' ')}>
              <Photo src={first.src} product={product} />
            </span>
          </span>
        ) : (
          <span className={styles.summaryGlyph}>
            <Svg src={icons.camera} size={24} />
          </span>
        )}
        <span className={styles.summaryText}>{first ? `${assets.length} ${assets.length === 1 ? 'photo' : 'photos'} added` : evidenceConfig.images.title}</span>
        {first ? (
          <Svg src={icons.editPen} size={36} />
        ) : (
          <span className={styles.addPill}>
            <Svg src={icons.plusBlack} size={16} />
            <span className={styles.addPillText}>{copy.addPhotos}</span>
          </span>
        )}
      </Tap>
      {note && !first && (
        <>
          <Dashed />
          <Tap className={styles.noteRow} onPress={onPress}>
            <span className={styles.noteRowText}>{note}</span>
            <span className={styles.noteRowIcon}>
              <Svg src={icons.editPinSquare} size={20} />
            </span>
          </Tap>
        </>
      )}
    </div>
  );
}

/** components/AFSReturnsSubmitErrorView */
export function SubmitErrorView({ onRetry, onSupport }: { onRetry?: () => void; onSupport: () => void }) {
  return (
    <Fade className={ds.error}>
      <div className={ds.errorContent}>
        <Svg src={icons.errorIcon} size={92.3} />
        <div className={ds.errorText}>
          <span className={ds.title20}>{copy.submitErrorTitle}</span>
          <span className={ds.desc14}>{copy.submitErrorDesc}</span>
        </div>
      </div>
      <div className={ds.errorButtons}>
        {onRetry && <AFSButton size="lg" title={copy.tryAgain} onPress={onRetry} />}
        <AFSButton size="lg" variant="outline" className={ds.contactSupport} textClassName={ds.contactSupportText} title={copy.contactSupport} onPress={onSupport} />
      </div>
    </Fade>
  );
}
