import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Icon, Lottie } from '../../../../components';
import { icons, lottieFiles } from '../../assets';
import { copy, feedbackWidget, formatRefund, returnPolicy, type RefundDetails, type Tracking } from '../../data';
import { returnsTokens } from '../../tokens';
import { AFSButton, Svg, Tap } from '../AFSButton';
import { Dashed } from '../Dashed';
import { FeedbackWidget } from '../FeedbackWidget';
import { ReturnsOverlay } from '../ReturnsOverlay';
import { StepGlyph, stepColors } from '../TrackingSteps';
import styles from './overlays.module.css';

interface OverlayProps {
  open: boolean;
  onClosed: () => void;
}

/** legacy/screens/AFSReturnsReturnTrackingScreenBase — vertical timeline in the legacy overlay (white card) */
export function TrackingTimelineOverlay({ open, onClosed, tracking, canCancel, onCancel }: OverlayProps & { tracking: Tracking; canCancel: boolean; onCancel: () => void }) {
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} legacy cardClassName={styles.cardWhite}>
      {(close) => (
        <>
          <span className={styles.legacyTitle} style={{ marginTop: 'var(--nk-space-s4)' }}>
            {copy.trackMyReturn}
          </span>
          <div className={styles.timeline}>
            {tracking.stages.map((s, i) => {
              const last = i === tracking.stages.length - 1;
              const filled = i + 1 <= tracking.currentStage;
              const c = stepColors(tracking, s.colorCode);
              return (
                <div key={s.shortName + i} className={[styles.tlStep, last && styles.tlStepLast].filter(Boolean).join(' ')}>
                  {!last && (
                    <>
                      <svg className={styles.tlBase} width="2" height="100%" aria-hidden>
                        <line x1="1" y1="0" x2="1" y2="100%" stroke="var(--nk-color-border)" strokeWidth="2" strokeDasharray="1.5 3" strokeLinecap="round" />
                      </svg>
                      {i + 1 < tracking.currentStage && <span className={styles.tlProgress} style={{ background: c.line }} />}
                    </>
                  )}
                  <span className={styles.tlIcon} style={filled ? { borderColor: c.stepColor } : undefined}>
                    <StepGlyph fill={filled ? c.stepColor : 'var(--nk-color-text-tertiary)'} />
                  </span>
                  <div className={styles.tlContent}>
                    <span className={styles.tlTitle} style={filled && !c.isAmber ? { color: c.stepText } : undefined}>
                      {s.shortName}
                    </span>
                    {s.date && <span className={styles.tlDate}>{s.date}</span>}
                    {s.desc && <span className={styles.tlDesc}>{s.desc}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {canCancel && (
            <AFSButton
              className={styles.tlCancel}
              variant="outline"
              size="md"
              title={copy.noonCancelReturn}
              onPress={() => {
                close();
                onCancel();
              }}
            />
          )}
        </>
      )}
    </ReturnsOverlay>
  );
}

const confirmCopy = {
  cancelRequest: { title: copy.cancelOverlayTitle, desc: copy.cancelOverlayDesc, keep: copy.goBack },
  discardReturn: { title: copy.discardReturnQuestion, desc: copy.discardReturnDesc, keep: copy.goBack },
  discardSection: { title: copy.discardSectionQuestion, desc: copy.discardSectionDesc, keep: copy.keepEditing },
} as const;

/**
 * AFSReturnsCancelRequestOverlayScreen / AFSReturnsSubmissionCancelOverlayScreen / AFSReturnsSectionDiscardOverlayScreen —
 * white header card (rewind-cross 52, title, desc, optional cancelText pill) + outline "keep" / danger "Discard".
 */
export function ConfirmOverlay({ open, onClosed, kind, note, onConfirm }: OverlayProps & { kind: keyof typeof confirmCopy; note?: string; onConfirm: () => void }) {
  const c = confirmCopy[kind];
  const isCancel = kind === 'cancelRequest';
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} contentClassName={styles.confirmContent}>
      {(close) => (
        <div className={[styles.confirm, !isCancel && styles.confirmDiscard].filter(Boolean).join(' ')}>
          <div className={[styles.confirmHeader, !isCancel && styles.confirmHeaderDiscard].filter(Boolean).join(' ')}>
            <span className={isCancel ? undefined : styles.confirmIconBox}>
              <Svg src={icons.rewindCross} size={52} />
            </span>
            <div className={[styles.confirmText, kind === 'discardSection' && styles.confirmTextNarrow].filter(Boolean).join(' ')}>
              <span className={isCancel ? styles.confirmTitleLg : styles.confirmTitle}>{c.title}</span>
              <span className={[styles.confirmDesc, isCancel && styles.confirmDescPadded].filter(Boolean).join(' ')}>{c.desc}</span>
            </div>
            {kind === 'discardReturn' && note && (
              <span className={styles.notePill}>
                <Svg src={icons.infoCircleGray} size={18} />
                <span className={styles.notePillText}>{note}</span>
              </span>
            )}
          </div>
          <div className={styles.confirmButtons}>
            <AFSButton size="md" variant="outline" title={c.keep} onPress={close} />
            <AFSButton
              size="md"
              variant="danger"
              title={copy.discard}
              onPress={() => {
                close();
                onConfirm();
              }}
            />
          </div>
        </div>
      )}
    </ReturnsOverlay>
  );
}

/** legacy/screens/AFSReturnsRefundSummaryScreen */
export function RefundSummaryOverlay({ open, onClosed, refund }: OverlayProps & { refund: RefundDetails }) {
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} legacy>
      {() => (
        <>
          <span className={styles.legacyTitle}>{copy.noonRefundSummary}</span>
          {refund.desc && <span className={styles.legacySubtitle}>{refund.desc}</span>}
          <div className={styles.breakdown}>
            {refund.sections.map((s) => (
              <div key={s.title} className={styles.breakdownRow}>
                <span className={styles.breakdownTitle}>{s.title}</span>
                <span className={styles.breakdownAmount}>{formatRefund(s.refundAmount, refund.currencyCode)}</span>
              </div>
            ))}
            {refund.sections.length > 0 && (
              <div className={styles.breakdownSep}>
                <Dashed />
              </div>
            )}
            <div className={styles.breakdownTotal}>
              <span className={styles.breakdownTotalTitle}>{copy.refundTotal}</span>
              <span className={styles.breakdownTotalAmount}>{formatRefund(refund.totalRefundAmount, refund.currencyCode)}</span>
            </div>
          </div>
        </>
      )}
    </ReturnsOverlay>
  );
}

/** legacy/screens/AFSReturnsPolicyScreen (SD getReturnConditionsList, demo copy) */
export function PolicyOverlay({ open, onClosed, onButton }: OverlayProps & { onButton: () => void }) {
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} legacy>
      {(close) => (
        <div className={styles.policy}>
          <span className={styles.legacyTitle}>{returnPolicy.title}</span>
          <div className={styles.policyBody}>
            <span className={styles.policyDesc}>{returnPolicy.firstDesc}</span>
            <span className={styles.policySecond}>{returnPolicy.secondDesc}</span>
            {returnPolicy.lines.map((l) => (
              <span key={l} className={styles.policyLine}>
                <Icon name="checkCircle" size={16} color="var(--nk-color-success)" />
                <span className={styles.policyDesc}>{l}</span>
              </span>
            ))}
          </div>
          <AFSButton
            className={styles.policyCta}
            variant="outline"
            title={returnPolicy.button.text}
            onPress={() => {
              close();
              onButton();
            }}
          />
        </div>
      )}
    </ReturnsOverlay>
  );
}

/** screens/AFSReturnsFeedbackOverlayScreen */
export function FeedbackOverlay({ open, onClosed, rate, onSubmitted }: OverlayProps & { rate: number; onSubmitted: (rate: number) => void }) {
  const [selected, setSelected] = useState(rate);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [focused, setFocused] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const question = selected <= 6 ? copy.feedbackDislikeQ : selected <= 8 ? copy.feedbackSuggestionQ : copy.feedbackLikeQ;
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} contentClassName={styles.fbContent} scroll={false}>
      {(close) => (
        <div className={styles.fbContainer}>
          <div className={['nk-scroll', styles.fbScroll].join(' ')}>
            <div className={styles.fbHeader}>
              <span className={styles.fbTitle}>{copy.feedbackTitle}</span>
              <span className={styles.fbSubtitle}>{copy.feedbackQuestion}</span>
            </div>
            <div className={styles.fbCard}>
              <FeedbackWidget
                selected={selected}
                onSelect={(r) => {
                  if (r === selected) return;
                  setSelected(r);
                  setTags([]);
                }}
              />
              <Dashed />
              <span className={styles.fbQuestion}>{question}</span>
              <div className={styles.fbTags}>
                {feedbackWidget[selected]?.options.map(({ code, name }) => {
                  const on = tags.includes(code);
                  return (
                    <Tap key={code} className={[styles.fbTag, on && styles.fbTagOn].filter(Boolean).join(' ')} onPress={() => setTags(on ? tags.filter((t) => t !== code) : [...tags, code])}>
                      {name}
                    </Tap>
                  );
                })}
              </div>
              <textarea
                className={[styles.fbInput, focused && styles.fbInputOn].filter(Boolean).join(' ')}
                placeholder={copy.feedbackComment}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </div>
          </div>
          <AFSButton
            size="md"
            variant="inverted"
            title={state === 'loading' ? copy.feedbackSubmitting : copy.feedbackSubmit}
            disabled={tags.length === 0}
            loading={state === 'loading'}
            onPress={() => {
              setState('loading');
              setTimeout(() => {
                setState('success');
                onSubmitted(selected);
              }, returnsTokens.submitDelay);
            }}
          />
          <AnimatePresence>
            {state === 'success' && (
              <motion.div className={styles.fbSuccess} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Lottie src={lottieFiles.feedbackSuccess} size={42} speed={returnsTokens.feedbackLottieSpeed} onComplete={close} />
                <span className={styles.fbSuccessText}>{copy.feedbackSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </ReturnsOverlay>
  );
}
