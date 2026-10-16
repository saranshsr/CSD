import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { AdditionOption, EnterManuallyField, LockNote, ScanCardIcon, ScanOptionButton, TapCardIcon } from './components/Bits';
import { PaymentCardFormV2, type CardFormHandle, type CardFormValues } from './components/Form';
import { PaymentScreenHeader } from './components/Headers';
import { AdditionContainer } from './components/primitives';
import { cardHolder, cardsImages, scannedCard, t, tappedCard, type SavedCard } from './data';
import { cardsStore } from './store';
import { cardsMetrics, cardsSprings } from './tokens';
import { ccTypeFromNumber } from './utils';
import s from './addCard.module.css';

/* screens/PaymentCardManualAdditionScreen/styles.ts, resolved for the 390 × 844 device */
const CARD_ASPECT_RATIO = 335 / 217;
const CARD_SCALE = 0.73;
const EDGE = cardsMetrics.edgeSpacing;
const MANUAL_ENTRY_HEIGHT = cardsMetrics.manualEntryHeight; // 112
const skinHeight = (cardsMetrics.contentWidth / CARD_ASPECT_RATIO) * CARD_SCALE;
const INITIAL_TOP = cardsMetrics.statusBar + skinHeight * 0.45;
const FORM_MAX_SPACING = cardsMetrics.statusBar + skinHeight * 0.4;
const FORM_TOP_SPACING = cardsMetrics.statusBar;
const FORM_SCALE = (cardsMetrics.contentWidth + 24) / cardsMetrics.contentWidth;
const SUBMIT_DELAY = 1100; // PaymentCardsService.saveCard round trip (encrypt + POST)

export interface AddCardParams {
  /** skip the scan-options step (PaymentNavigation.isScanAvailable() === false, e.g. iOS without camera scan) */
  manual?: boolean;
  /** demo: open with a scan result prefilled */
  scanned?: boolean;
}

/**
 * screens/PaymentCardManualAdditionScreen — scan options (camera / NFC tap) that morph into the
 * PaymentCardFormV2 sheet when "Enter details manually" is pressed.
 */
export function AddCardScreen({ params }: ScreenProps<AddCardParams>) {
  const nav = useNav();
  const isFormInitiallyVisible = !!params.manual || !!params.scanned;
  const [enterManually, setEnterManually] = useState(false);
  const [isAdditionLoading, setIsAdditionLoading] = useState(false);
  const shouldShowForm = isFormInitiallyVisible || enterManually || isAdditionLoading;
  const formRef = useRef<CardFormHandle>(null);

  /* ── usePaymentCardManualAdditionScreenAnimatedStyles ── */
  const sf = useMotionValue(isFormInitiallyVisible ? 0.8 : 0); // shouldAnimateForm
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const formElRef = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ container: 722, options: 196, form: 416 });
  useLayoutEffect(() => {
    setM({ container: containerRef.current?.offsetHeight || 722, options: optionsRef.current?.offsetHeight || 196, form: formElRef.current?.offsetHeight || 416 });
  }, []);

  useEffect(() => {
    if (!shouldShowForm) return;
    const c = animate(sf, 1, { ...cardsSprings.form, delay: isFormInitiallyVisible && !enterManually ? 0.3 : 0 });
    c.then(() => formRef.current?.focusFirstEmptyField());
    return () => c.stop();
  }, [shouldShowForm, sf, isFormInitiallyVisible, enterManually]);

  // no software keyboard on web → keyboardHeight = 0
  const formTranslation = Math.min(FORM_MAX_SPACING, Math.max(FORM_TOP_SPACING, m.container - m.form - EDGE));
  const sectionStart = INITIAL_TOP + m.options + EDGE;
  const noClamp = { clamp: false };
  const sectionY = useTransform(sf, [0, 1], [sectionStart, formTranslation], noClamp);
  const sectionScaleX = useTransform(sf, [0, 1], [1, FORM_SCALE], noClamp);
  const sectionHeight = useTransform(sf, [0, 1], [MANUAL_ENTRY_HEIGHT, m.container], noClamp);
  const sectionRadius = useTransform(sf, [0, 1], [16, 0]);
  const manualOpacity = useTransform(sf, [0, 0.5], [1, 0]);
  const formOpacity = useTransform(sf, [0.3, 1], [0, 1]);
  const scanOpacity = useTransform(sf, [0, 0.8], [1, 0]);
  const titleScale = useTransform(sf, [0, 0.5], [1, 0.7]);
  const titleOpacity = useTransform(sf, [0, shouldShowForm ? 0.5 : 0.3], [1, 0]);
  const optionScale = useTransform(sf, [0.5, 1], [0, 1]);
  const optionOpacity = useTransform(sf, [0.5, 1], [0, 1]);

  const handleBack = () => {
    if (isAdditionLoading) return;
    formRef.current?.blurFields();
    if (enterManually && !isFormInitiallyVisible) {
      setEnterManually(false);
      animate(sf, 0, cardsSprings.form);
    } else nav.back();
  };

  /** camera scan / NFC tap are native — on web they return a canned result into the form */
  const simulateScan = (result: { card: string; expiry: string }) => {
    formRef.current?.blurFields();
    setEnterManually(true);
    setTimeout(() => formRef.current?.setScannedValues(result.card, result.expiry), 60);
  };

  useEffect(() => {
    if (params.scanned) setTimeout(() => formRef.current?.setScannedValues(scannedCard.card, scannedCard.expiry), 50);
  }, [params.scanned]);

  const onSubmit = (v: CardFormValues) => {
    setIsAdditionLoading(true);
    formRef.current?.blurFields();
    const digits = v.card.replace(/\D/g, '');
    const card: SavedCard = {
      id: String(Date.now()),
      ccType: ccTypeFromNumber(digits),
      ccMasked: `${digits.slice(0, 6)}******${digits.slice(-4)}`,
      ccExpiry: v.expiry,
      nickname: v.nickname.trim(),
      isDefault: v.isDefault || cardsStore.get().cards.length === 0,
      cardIssuerName: '',
      cardArt: { isDefault: true },
      lastAddedAt: new Date().toISOString(),
    };
    setTimeout(() => {
      cardsStore.add(card);
      nav.replace('cards/success', { cardId: card.id }, { transition: 'fade' });
    }, SUBMIT_DELAY);
  };

  return (
    <Screen background="bgPage" safeTop={false} overlayHeader contentStyle={{ paddingBottom: 0, overflow: 'hidden' }} header={null}>
      <div className={s.root} aria-label={`Add card for ${cardHolder}`}>
        <div className={s.header}>
          <PaymentScreenHeader onBack={handleBack}>
            <div className={s.headerContent}>
              <div className={s.scanOptions}>
                <motion.div style={{ scale: optionScale, opacity: optionOpacity, pointerEvents: shouldShowForm ? 'auto' : 'none' }}>
                  <ScanOptionButton icon={<ScanCardIcon size={24} />} title={t.scanOptionScan} onPress={() => simulateScan(scannedCard)} disabled={isAdditionLoading} />
                </motion.div>
                <motion.div style={{ scale: optionScale, opacity: optionOpacity, pointerEvents: shouldShowForm ? 'auto' : 'none' }}>
                  <ScanOptionButton icon={<TapCardIcon size={24} />} title={t.scanOptionTap} onPress={() => simulateScan(tappedCard)} disabled={isAdditionLoading} />
                </motion.div>
              </div>
            </div>
            <motion.div className={s.headerContent} style={{ scale: titleScale, opacity: titleOpacity, pointerEvents: 'none' }}>
              <span className={s.headerTitle}>{t.addCardDetails}</span>
            </motion.div>
          </PaymentScreenHeader>
        </div>

        <div className={s.cardContainer}>
          <img className={s.cardSkin} src={cardsImages.cardSkinWithShadow} alt="" draggable={false} />
        </div>

        <div className={s.scroll}>
          <div ref={containerRef} className={s.optionsContainer}>
            <motion.div ref={optionsRef} className={s.options} style={{ top: INITIAL_TOP, opacity: scanOpacity, pointerEvents: shouldShowForm ? 'none' : 'auto' }}>
              {/* components/PaymentCardAdditionOptions — both camera + NFC available → "Quick & effortless" */}
              <AdditionContainer className={s.scanOptionsCard} title={t.quickEffortless}>
                <AdditionOption icon={<ScanCardIcon />} title={t.scanCardTitle} subtitle={t.scanCardSubtitle} onPress={() => simulateScan(scannedCard)} disabled={isAdditionLoading} />
                <div className={s.divider} />
                <AdditionOption icon={<TapCardIcon />} title={t.tapCard} subtitle={t.tapCardSubtitle} onPress={() => simulateScan(tappedCard)} disabled={isAdditionLoading} />
              </AdditionContainer>
            </motion.div>

            <motion.div className={s.manualSection} style={{ y: sectionY, scaleX: sectionScaleX, height: sectionHeight, borderRadius: sectionRadius }}>
              <motion.div className={s.formContainer} style={{ opacity: formOpacity, pointerEvents: shouldShowForm ? 'auto' : 'none' }}>
                <div ref={formElRef} className={s.formScaleReset}>
                  <PaymentCardFormV2 ref={formRef} isAdditionLoading={isAdditionLoading} onSubmit={onSubmit} defaultIsDefault />
                </div>
              </motion.div>
              <motion.div style={{ opacity: manualOpacity, pointerEvents: shouldShowForm ? 'none' : 'auto' }}>
                <button type="button" className={s.manualButton} disabled={isAdditionLoading} onClick={() => setEnterManually(true)} data-testid="enter-manually">
                  <AdditionContainer title={t.enterDetailsManually}>
                    <div className={s.manualEntryContent}>
                      <EnterManuallyField text={t.enterCardNumber} />
                    </div>
                  </AdditionContainer>
                </button>
              </motion.div>
            </motion.div>

            <motion.div className={s.message} style={{ top: INITIAL_TOP + m.options + MANUAL_ENTRY_HEIGHT + EDGE * 2, opacity: scanOpacity }}>
              <LockNote variant="muted" text={t.cardDetailsEncrypted} />
            </motion.div>
          </div>
        </div>
      </div>
    </Screen>
  );
}
