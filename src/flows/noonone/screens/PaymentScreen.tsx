import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HtmlText, Screen } from "../../../components";
import { useMembershipEligibility } from "../../../kit/membership";
import { useNav, useParams } from "../../../kit/Navigator";
import applePayIcon from "@assets/shared/payment/apple-pay.webp";
import arrowLoop from "@assets/vip/arrow-loop.webp";
import bluePlus from "@assets/vip/blue-plus-rounded.webp";
import srcAmex from "@assets/shared/payment/brand-card-amex.webp";
import srcMastercard from "@assets/shared/payment/brand-card-mastercard.webp";
import srcVisa from "@assets/shared/payment/brand-card-visa.webp";
import checkCircle from "@assets/noonone/icons/check-circle.webp";
import chevronLeft from "@assets/vip/chevron-left-rounded.svg";
import radioChecked from "@assets/vip/radio-checked-black.svg";
import radioUnchecked from "@assets/vip/radio-unchecked-black.svg";
import stcIcon from "@assets/noonone/icons/stc.webp";
import cardAmex from "@assets/shared/payment/card-amex.webp";
import cardMastercard from "@assets/shared/payment/card-mastercard.webp";
import cardVisa from "@assets/shared/payment/card-visa.webp";
import { VIPButton } from "../components/VIPButton";
import { Reloader } from "../components/payment/Reloader";
import { findPlan, savedCards, withEligibility, type VipCard } from "../data";
import {
  cvvError,
  cvvRequiredCards,
  payCopy,
  payMisc,
  paymentLocalStore,
  subscribeButtonText,
  trialGuideEntry,
} from "../data.payment";
import { completeSubscription, noononeStore, useNoonone } from "../store";
import { paymentTokens } from "../tokens";
import styles from "./PaymentScreen.module.css";

/** getPaymentMethodData(ccType) → noon card brand icon */
export const brandIcon: Record<VipCard["ccType"], string> = {
  visa: cardVisa,
  mastercard: cardMastercard,
  amex: cardAmex,
};

type Method = "card" | "applepay" | "boku";

/**
 * VIPPaymentV2Screen — HeaderTypes.CLOSE registration but its own absolute header (title + rounded back), grey page,
 * card / mobile / Apple Pay method groups, sticky VIPSubscriptionButtonV2 (isPaymentScreen). Selecting a method
 * re-runs checkSelectedPayment (FeedbackView RELOADING); the CTA runs handlePayment → CVV overlay when the card needs
 * verification, else createSubscription → popTo(landing) where VIPTransitionAnim plays.
 */
export function PaymentScreen() {
  const nav = useNav();
  const { planCode } = useParams<{ planCode?: string }>();
  const trialEligible = useMembershipEligibility((s) => s.trialEligible);
  const plan = withEligibility(
    findPlan(planCode ?? noononeStore.get().selectedPlan.planCode),
    trialEligible,
  );
  const { addedCards, paymentMethod, voucherCode } = useNoonone();
  const local = paymentLocalStore.useStore();
  const cards = [...savedCards, ...addedCards];

  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const scrollY = useMotionValue(0);
  const headerBg = useTransform(
    scrollY,
    [0, paymentTokens.headerFadePx],
    ["var(--nk-palette-white-alpha0)", "var(--nk-palette-white)"],
  );

  const method: Method | undefined =
    paymentMethod?.type === "card"
      ? "card"
      : paymentMethod?.type === "applepay"
        ? "applepay"
        : paymentMethod?.type === "boku"
          ? "boku"
          : undefined;
  const selectedCard =
    paymentMethod?.type === "card" ? paymentMethod.card : undefined;
  const selectedBoku =
    paymentMethod?.type === "boku" ? paymentMethod.msisdn : undefined;
  /** vipPaymentData.verificationRequired (VIPService.checkPayment === false) */
  const verificationRequired =
    !!selectedCard &&
    (cvvRequiredCards.has(selectedCard.id) ||
      addedCards.some((c) => c.id === selectedCard.id));
  const selectedCvv = selectedCard ? (local.cvv[selectedCard.id] ?? "") : "";

  useEffect(() => {
    noononeStore.patch({ selectedPlan: plan });
    // FeedbackView LOADING while PaymentCardService / touchpoints / boku numbers load
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** checkSelectedPayment → changeScreenState(RELOADING) → SUCCESS */
  const reload = (ms = 400) => {
    setReloading(true);
    setTimeout(() => setReloading(false), ms);
  };

  const select = (pm: typeof paymentMethod) => {
    noononeStore.patch({ paymentMethod: pm });
    reload();
  };

  const subscribe = () => {
    setReloading(true);
    setTimeout(() => {
      setReloading(false);
      completeSubscription(nav, plan);
    }, paymentTokens.subscribeMs);
  };

  // VIPAddCvvOverlayScreen "Verify" → getPaymentIntent({ cvv }) → createSubscription
  const verifiedSeen = useRef(local.cvvVerified);
  useEffect(() => {
    if (local.cvvVerified !== verifiedSeen.current) {
      verifiedSeen.current = local.cvvVerified;
      subscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.cvvVerified]);

  const handlePayment = () => {
    if (
      method === "card" &&
      verificationRequired &&
      cvvError(selectedCvv, selectedCard?.ccType)
    ) {
      nav.push("noonone/addCvv", { cardId: selectedCard?.id });
      return;
    }
    subscribe();
  };

  /** checkPaymentIneligible: nothing selected */
  const disabled = !method || (method === "boku" && !selectedBoku);
  const entryText = trialGuideEntry(plan);

  const trialGuide = (last?: boolean) =>
    entryText ? (
      <button
        type="button"
        className={`nk-pressable ${styles.trialGuide} ${last ? styles.trialGuideLast : ""}`}
        onClick={() =>
          nav.push("noonone/trialGuide", { planCode: plan.planCode })
        }
      >
        <HtmlText value={entryText} className={styles.trialGuideText} />
        <img src={chevronLeft} alt="" className={styles.trialGuideIcon} />
      </button>
    ) : null;

  const header = (
    <motion.div
      className={styles.headerWrapper}
      style={{ background: headerBg }}
    >
      {!loading && (
        <div className={styles.header}>
          <span className={styles.headerTitle}>{payCopy.paymentMethod}</span>
          <button
            type="button"
            className={`nk-pressable ${styles.backButton}`}
            onClick={nav.back}
            aria-label="Back"
          >
            <img src={chevronLeft} alt="" className={styles.backIcon} />
          </button>
        </div>
      )}
    </motion.div>
  );

  const footer = loading ? undefined : (
    <div className={styles.footer}>
      <VIPButton
        className={styles.cta}
        disabled={disabled}
        onPress={handlePayment}
        htmlTitle={subscribeButtonText(plan)}
        textClassName={styles.ctaText}
      />
      {plan.footerNote && (
        <div className={styles.footerNote}>{plan.footerNote}</div>
      )}
      {payMisc.isReferralEligible && voucherCode && (
        <div className={styles.referral}>
          <span className={styles.referralCode}>{voucherCode}</span>
          <img src={checkCircle} alt="" className={styles.referralIcon} />
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.root}>
      <Screen
        overlayHeader
        header={header}
        footer={footer}
        background="vipPayPage"
        onScroll={(y) => scrollY.set(y)}
        contentStyle={{
          paddingTop:
            "calc(var(--nk-inset-top) + var(--nk-space-s56) + var(--nk-space-s4))",
          paddingInline: "var(--nk-space-s16)",
        }}
      >
        <div className={styles.methods}>
          {/* renderCardPay */}
          <div
            className={`${styles.method} ${method === "card" ? styles.methodSelected : ""}`}
          >
            {cards.length > 0 && (
              <div className={styles.methodHeader}>
                <span className={styles.methodHeaderText}>
                  {payCopy.payWithCard}
                </span>
              </div>
            )}
            {cards.length > 0 && (
              <div className={styles.list}>
                {cards.map((card, i) => {
                  const isSelected = selectedCard?.id === card.id;
                  return (
                    <div key={card.id}>
                      <button
                        type="button"
                        className={styles.cardButton}
                        disabled={isSelected}
                        onClick={() => select({ type: "card", card })}
                      >
                        <img
                          src={isSelected ? radioChecked : radioUnchecked}
                          alt=""
                          className={styles.radioInRow}
                        />
                        <span className={styles.flex}>
                          <span className={styles.row}>
                            <img
                              src={brandIcon[card.ccType]}
                              alt=""
                              className={styles.cardType}
                            />
                            <span className={`${styles.row} ${styles.flex}`}>
                              <span className={styles.dots}>
                                {"•".repeat(4)}
                              </span>
                              <span className={styles.cardNumber}>
                                {card.last4}
                              </span>
                            </span>
                            {isSelected && verificationRequired && (
                              <input
                                className={styles.cvvInput}
                                value={selectedCvv}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  paymentLocalStore.patch((s) => ({
                                    cvv: {
                                      ...s.cvv,
                                      [card.id]: e.target.value.replace(
                                        /\D/g,
                                        "",
                                      ),
                                    },
                                  }))
                                }
                                placeholder={payCopy.cvv}
                                maxLength={4}
                                inputMode="numeric"
                                type="password"
                              />
                            )}
                          </span>
                        </span>
                      </button>
                      {isSelected && trialGuide(i === cards.length - 1)}
                    </div>
                  );
                })}
              </div>
            )}
            {cards.length > 0 && (
              <div className={styles.dashed}>
                <div className={styles.dashedLine} />
              </div>
            )}
            <button
              type="button"
              className={styles.addRow}
              onClick={() => nav.push("noonone/addCard")}
            >
              <img src={bluePlus} alt="" className={styles.addIcon} />
              <span className={styles.addText}>{payCopy.addNewCardRow}</span>
              <span className={styles.row}>
                <img src={srcVisa} alt="" className={styles.addBrand} />
                <img src={srcMastercard} alt="" className={styles.addBrand} />
                <img src={srcAmex} alt="" className={styles.addBrand} />
              </span>
            </button>
          </div>

          {/* renderMobilePay */}
          {payMisc.isMobilePayEnabled && plan.supportsMobilePay !== false && (
            <div
              className={`${styles.method} ${method === "boku" ? styles.methodSelected : ""}`}
            >
              {local.numbers.length > 0 && (
                <div className={styles.methodHeader}>
                  <span className={styles.methodHeaderText}>
                    {payCopy.payWithMobile}
                  </span>
                </div>
              )}
              {local.numbers.map((n) => {
                const isSelected = selectedBoku === n.idOptin;
                return (
                  <button
                    key={n.idOptin}
                    type="button"
                    className={styles.mobileRow}
                    disabled={isSelected}
                    onClick={() => select({ type: "boku", msisdn: n.idOptin })}
                  >
                    <img
                      src={isSelected ? radioChecked : radioUnchecked}
                      alt=""
                      className={styles.radioInRow}
                    />
                    <span className={`${styles.row} ${styles.flex}`}>
                      <img src={stcIcon} alt="" className={styles.carrier} />
                      <span
                        className={styles.addText}
                      >{`${"•".repeat(4)} ${n.msisdnMask}`}</span>
                    </span>
                  </button>
                );
              })}
              {local.numbers.length > 0 && (
                <div className={styles.mobileBorder} />
              )}
              <button
                type="button"
                className={styles.addRow}
                onClick={() => nav.push("noonone/mobilePay")}
              >
                <img
                  src={local.numbers.length ? arrowLoop : bluePlus}
                  alt=""
                  className={styles.addIcon}
                />
                <span className={styles.addText}>
                  {local.numbers.length
                    ? payCopy.changeMobile
                    : payCopy.addMobile}
                </span>
                <img src={stcIcon} alt="" className={styles.carrier} />
              </button>
            </div>
          )}

          {/* renderApplePay (iOS + misc.isApplePayEnabled) */}
          {payMisc.isApplePayEnabled && (
            <div
              className={`${styles.method} ${styles.applePay} ${method === "applepay" ? styles.methodSelected : ""}`}
            >
              <button
                type="button"
                className={styles.methodButton}
                disabled={method === "applepay"}
                onClick={() => select({ type: "applepay" })}
              >
                <span className={styles.leftWrapper}>
                  <img
                    src={method === "applepay" ? radioChecked : radioUnchecked}
                    alt=""
                    className={styles.radio}
                  />
                  <span className={styles.methodButtonText}>
                    {payCopy.applePay}
                  </span>
                </span>
                <img
                  src={applePayIcon}
                  alt=""
                  className={styles.applePayLogo}
                />
              </button>
              {method === "applepay" && trialGuide(true)}
            </div>
          )}
        </div>
      </Screen>
      {loading && (
        <div className={styles.loading}>
          <Reloader visible />
        </div>
      )}
      <Reloader visible={reloading} />
    </div>
  );
}
