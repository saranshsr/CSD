import { animate, motion, useMotionValue, useScroll, useTransform } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Lottie, MarketplaceTag, Screen, Spinner } from '../../components';
import { useNav } from '../../kit/Navigator';
import { easing } from '../../motion/presets';
import { icons, lottieFiles } from './assets';
import { AFSBackHeader } from './components/AFSBackHeader';
import { AFSButton, Svg, Tap } from './components/AFSButton';
import { Dashed } from './components/Dashed';
import { FeedbackWidget } from './components/FeedbackWidget';
import { ConfirmOverlay, FeedbackOverlay, PolicyOverlay, RefundSummaryOverlay, TrackingTimelineOverlay } from './components/overlays/DetailsOverlays';
import { ProductDetails } from './components/ProductDetails';
import { SummaryButton } from './components/SummaryButton';
import { TrackingSteps } from './components/TrackingSteps';
import { copy, formatRefund, isExpress, orderIdFor, refundDetailsFor, resolveProduct, returnPolicy, successHeader, trackingFor } from './data';
import { popTo } from './nav';
import { recordFor, returnsStore } from './store';
import { returnsTokens } from './tokens';
import styles from './details.module.css';

type Overlay = 'tracking' | 'cancel' | 'refund' | 'policy' | 'feedback';

/**
 * AFSReturnsDetailsScreen (features/afs/returns/screens/AFSReturnsDetailsScreen). From the history list it opens
 * plain (back header "Return details"); after a submission (`success=1`) the processing Lottie plays, then the
 * success header, which 1800 ms later moves up (top 0 → −H/2, 500 ms out-cubic) while the list fades/slides in
 * from H/3. Scrolling scales the header 1 → 0.8 over 160 px. MAPPING.md §3.
 */
export function ReturnDetailsScreen({ params }: { params: { productId?: string; returnNr?: string; success?: string | boolean; rootKey?: string } }) {
  const nav = useNav();
  const product = resolveProduct(params.productId);
  const returns = returnsStore.useReturns();
  const record = returns.find((r) => (params.returnNr ? r.returnItemNr === params.returnNr : r.productId === product.id)) ?? recordFor(product.id, params.returnNr);
  const hasSuccessHeader = params.success === true || params.success === '1' || params.success === 'true';

  const [status, setStatus] = useState<'pending' | 'success'>('pending');
  const [ready, setReady] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [canceledHere, setCanceledHere] = useState(false);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [rate, setRate] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(844);
  useLayoutEffect(() => {
    if (rootRef.current) setH(rootRef.current.offsetHeight || 844);
  }, []);

  // getReturnItemDetails (demo latency)
  useEffect(() => {
    const t = setTimeout(() => setStatus('success'), returnsTokens.detailsFetchDelay);
    return () => clearTimeout(t);
  }, []);
  // AFSReturnsDetailsSuccessHeader: onFinish 1800 ms after success
  useEffect(() => {
    if (!hasSuccessHeader || status !== 'success') return;
    const t = setTimeout(() => setReady(true), returnsTokens.successMoveUpDelay);
    return () => clearTimeout(t);
  }, [hasSuccessHeader, status]);

  // useAFSReturnsDetailsAnimation
  const progress = useMotionValue(hasSuccessHeader ? 0 : 1);
  useEffect(() => {
    if (!hasSuccessHeader) progress.set(1);
    else if (ready) animate(progress, 1, { duration: returnsTokens.headerRevealDuration, ease: easing.out });
  }, [hasSuccessHeader, ready, progress]);
  const { scrollY } = useScroll({ container: listRef });
  const headerTop = useTransform(progress, [0, 1], [0, -h / 2]);
  const headerScale = useTransform(scrollY, [0, returnsTokens.headerScrollScaleDistance], [1, returnsTokens.headerMinScrollScale], { clamp: true });
  const contentOpacity = useTransform(progress, [0.35, 1], [0, 1], { clamp: true });
  const contentY = useTransform(progress, [0.35, 1], [h / 3, 0], { clamp: true });

  const tracking = trackingFor(record.currentStage, record.cancelled, record.requestedAt);
  const refund = refundDetailsFor(product);
  const canCancel = record.allowCancel && !record.cancelled;
  // AFSReturnsItemDetailsActionButton: the SD trackingAction only renders for actionCode 'refunded'
  const trackAction = record.trackingAction?.actionCode === 'refunded' ? record.trackingAction : undefined;
  const showFeedback = record.feedbackRate == null;
  const loading = !hasSuccessHeader && status === 'pending';

  const handleBack = () => {
    if (nav.stack.length <= 1) return nav.reset('returns/history');
    const below = nav.stack[nav.stack.length - 2];
    popTo(nav, params.rootKey, below?.route === 'returns/submit' ? 2 : 1);
  };
  const handleCancelConfirmation = () => {
    setCancelLoading(true);
    setTimeout(() => {
      returnsStore.cancel(record.returnItemNr);
      setCanceledHere(true);
      setCancelLoading(false);
    }, returnsTokens.submitDelay);
  };

  return (
    <>
      <Screen
        background="bgSubtle"
        overlayHeader
        safeTop={false}
        header={<AFSBackHeader blur title={!hasSuccessHeader ? copy.titleDetails : ''} onBack={handleBack} />}
        contentStyle={{ paddingBottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <div ref={rootRef} className={styles.screenRoot}>
          {
            <>
              {hasSuccessHeader && canceledHere ? (
                <motion.div className={styles.cancelHeader} style={{ top: headerTop, scale: headerScale }}>
                  <Svg src={icons.errorIcon} size={92} />
                  <div className={styles.cancelHeaderText}>
                    <span className={styles.title20}>{copy.cancelHeaderTitle}</span>
                    <span className={styles.desc14}>{copy.cancelHeaderDesc}</span>
                  </div>
                </motion.div>
              ) : (
                hasSuccessHeader && (
                  <motion.div className={styles.successHeader} style={{ top: headerTop, scale: headerScale }}>
                    {status === 'pending' ? (
                      <Lottie src={lottieFiles.processing} loop style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                    ) : (
                      // SD lottieUrl — demo artwork (kit check Lottie + successHeading / successSubheading) in the lower half
                      <div className={styles.successArt}>
                        <Lottie name="orderConfirmedCheck" size={120} />
                        <span className={styles.successTitle}>{successHeader.title}</span>
                        <span className={styles.successDesc}>{successHeader.description}</span>
                      </div>
                    )}
                  </motion.div>
                )
              )}

              <motion.div className={styles.content} style={{ opacity: contentOpacity, y: contentY }}>
                <div ref={listRef} className={['nk-scroll', styles.list, hasSuccessHeader && styles.listWithHeader].filter(Boolean).join(' ')}>
                  {/* AFSReturnsDetailsTrackingBox */}
                  <div className={styles.trackingWrapper}>
                    <div className={styles.trackingBox}>
                      <Tap className={styles.trackingButton} onPress={() => setOverlay('tracking')}>
                        <TrackingSteps tracking={tracking} />
                      </Tap>
                      <div className={styles.trackingActions}>
                        {canCancel && <AFSButton size="sm" variant="outline" title={copy.cancelReturn} onPress={() => setOverlay('cancel')} />}
                        {trackAction && <AFSButton size="sm" variant="outline" title={trackAction.title} onPress={() => nav.toast(`${trackAction.title} — opens ${trackAction.deepLink} (handleReturnTrackPress)`)} />}
                      </div>
                    </div>
                  </div>

                  {/* AFSReturnsFeedbackBox */}
                  {showFeedback && (
                    <div className={styles.fbWrapper}>
                      <div className={styles.fbCard}>
                        <span className={styles.fbTitle}>{copy.feedbackQuestion}</span>
                        <FeedbackWidget
                          onSelect={(r) => {
                            setRate(r);
                            setOverlay('feedback');
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* AFSReturnsDetailsProductCard */}
                  <div className={styles.productWrapper}>
                    <div className={styles.productCard}>
                      <div className={styles.productHeader}>
                        <span className={styles.productHeaderText}>
                          {copy.returnId}: <span className={styles.productHeaderNr}>{record.returnItemNr}</span>
                        </span>
                        {isExpress(product) && (
                          <span className={styles.productFlag}>
                            <MarketplaceTag kind="express" />
                          </span>
                        )}
                      </div>
                      <ProductDetails product={product} hideFlags className={styles.productDetailsInCard} />
                      <div className={styles.summaryButtons}>
                        {[
                          {
                            key: 'refund-summary',
                            title: copy.refundSummaryRow,
                            subtitle: (
                              <>
                                {copy.refundSummaryDesc} <span className={styles.refundAmount}>{formatRefund(refund.totalRefundAmount, refund.currencyCode)}</span>
                              </>
                            ),
                            icon: icons.refundSummary,
                            onPress: () => setOverlay('refund'),
                          },
                          { key: 'request-summary', title: copy.requestSummaryRow, subtitle: copy.requestSummaryDesc, icon: icons.refundRequestSummary, onPress: () => nav.push('returns/summary', { productId: product.id, returnNr: record.returnItemNr }) },
                          { key: 'order-summary', title: copy.orderSummary, subtitle: copy.orderSummaryDesc, icon: icons.orderInvoices, onPress: () => nav.push('orders/tracking', { orderId: orderIdFor(product.id) }) },
                          { key: 'return-policy', title: copy.policy, subtitle: undefined, icon: icons.policy, onPress: () => setOverlay('policy') },
                        ].map((b) => (
                          <div key={b.key} className={styles.summaryButtonWrap}>
                            <Dashed />
                            <SummaryButton title={b.title} subtitle={b.subtitle} icon={b.icon} onPress={b.onPress} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.footer}>
                  <AFSButton size="lg" title={copy.continueShopping} textClassName={styles.footerText} onPress={() => nav.switchTab('home')} />
                </div>
              </motion.div>
            </>
          }
          {(loading || cancelLoading) && (
            <div className={[styles.loader, loading && styles.loaderOpaque].filter(Boolean).join(' ')}>
              <Spinner size={32} />
            </div>
          )}
        </div>
      </Screen>

      <TrackingTimelineOverlay open={overlay === 'tracking'} onClosed={() => setOverlay((o) => (o === 'tracking' ? null : o))} tracking={tracking} canCancel={canCancel} onCancel={() => setTimeout(() => setOverlay('cancel'), 380)} />
      <ConfirmOverlay open={overlay === 'cancel'} onClosed={() => setOverlay((o) => (o === 'cancel' ? null : o))} kind="cancelRequest" onConfirm={handleCancelConfirmation} />
      <RefundSummaryOverlay open={overlay === 'refund'} onClosed={() => setOverlay(null)} refund={refund} />
      <PolicyOverlay open={overlay === 'policy'} onClosed={() => setOverlay(null)} onButton={() => nav.toast(`${returnPolicy.title} — opens ${returnPolicy.button.uri} in a web view`)} />
      {overlay === 'feedback' && <FeedbackOverlay open onClosed={() => setOverlay(null)} rate={rate} onSubmitted={(r) => returnsStore.rate(record.returnItemNr, r)} />}
    </>
  );
}
