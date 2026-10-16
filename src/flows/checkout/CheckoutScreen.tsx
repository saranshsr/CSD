import { useMotionValue } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Screen } from '../../components';
import { useDemoStore } from '../../kit/DemoStore';
import { useIsTop, useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { addressStore, useAddressStore } from '../address/store';
import { AddressCard } from './components/AddressCard';
import { BurnSection } from './components/BurnSection';
import { Donation } from './components/Donation';
import { PointsVouchers } from './components/PointsVouchers';
import { CheckoutHeader } from './components/CheckoutHeader';
import { CheckoutShipment } from './components/CheckoutShipment';
import { CouponStatus } from './components/CouponStatus';
import { DeliveryInstruction } from './components/DeliveryInstruction';
import { NoonOneSection } from './components/NoonOneSection';
import { DetachedAddress } from './components/DetachedAddress';
import { DynamicInvoice, type InvoiceSection } from './components/DynamicInvoice';
import { PaymentSummary } from './components/PaymentSummary';
import { EarnCallout } from './components/EarnCallout';
import { PaymentMethods } from './components/PaymentMethods';
import { ReceiverDetails } from './components/ReceiverDetails';
import { Reloader } from './components/Reloader';
import { SlideButton } from './components/SlideButton';
import { VoucherToast } from './components/VoucherToast';
import pointsSeparator from '@assets/checkout/figma/points-separator.svg';
import { FAILING_CARD_LAST4, makeOrderId, t, taf, tf, type PaymentCode } from './data';
import { checkoutStore, useCheckout } from './store';
import { useCheckoutTotals, type CheckoutTotals } from './totals';
import { formatAmount, isCvvValid } from './utils';
import styles from './checkout.module.css';

/**
 * Screen sections, top → bottom. The default list is the Figma "All flows" Checkout frame (ALL_FLOWS_SECTIONS,
 * Af34gfmhQ1D0wstXUEHSIF · 127:44077); the previous "🚧 Checkout 2.0" order is FIGMA_SECTIONS and the bappzaar
 * order MASTER_SECTIONS — pass either (or any list) through the `sections` param:
 *   address_card       · "All flows" address card (= master detached address, Figma look); header shows "Checkout"
 *   integrated_noonone · NoonCheckoutNoonOneSection toggle (the "All flows" Banner/.base look in ALL_FLOWS_SECTIONS)
 *   burn               · "All flows" Points & Vouchers card (master NoonCheckoutBurnSection layout)
 *   pay_with           · Pay With on its own card (master `payment`)
 *   payment            · Checkout 2.0 "Cards": Points & Vouchers carousel + Pay With in one card
 *   donation           · NoonCheckoutDonation
 * The rest are kit sections the default frame doesn't show:
 *   detached_address   · NoonCheckoutScreen detached address card (master look; header shows "Checkout")
 *   coupon_status      · NoonCheckoutCouponStatus (needs a cart coupon)
 *   earn               · NoonCheckoutEarnCallout
 *   dynamic_invoice    · master NoonDynamicInvoice "Order Summary" (instead of / next to payment_summary)
 */
export type CheckoutSectionId =
  | 'address_card'
  | 'burn'
  | 'pay_with'
  | 'donation'
  | 'shipments'
  | 'delivery_instructions'
  | 'receiver_details'
  | 'payment'
  | 'payment_summary'
  | 'detached_address'
  | 'integrated_noonone'
  | 'coupon_status'
  | 'earn'
  | 'dynamic_invoice';

/** Figma "All flows" Checkout (127:44077) — the default */
export const ALL_FLOWS_SECTIONS: CheckoutSectionId[] = ['address_card', 'integrated_noonone', 'delivery_instructions', 'receiver_details', 'shipments', 'burn', 'pay_with', 'donation', 'payment_summary'];
/** Figma "🚧 Checkout 2.0" (zURu7GI7sq77fjdXKrouvo · 14288:183972) — address in the header */
export const FIGMA_SECTIONS: CheckoutSectionId[] = ['shipments', 'delivery_instructions', 'receiver_details', 'payment', 'payment_summary'];
/** master section order (MAPPING.md), mapped onto the Figma components */
export const MASTER_SECTIONS: CheckoutSectionId[] = ['detached_address', 'shipments', 'integrated_noonone', 'delivery_instructions', 'receiver_details', 'payment', 'coupon_status', 'earn', 'dynamic_invoice'];

export interface CheckoutParams {
  /** coupon applied in the cart (cart → checkout) */
  coupon?: string | null;
  /** demo: fail the payment of the next order (NoonCheckoutPaymentFailureScreen) */
  failPayment?: boolean;
  /** sections to render (default ALL_FLOWS_SECTIONS); e.g. FIGMA_SECTIONS (Checkout 2.0) or MASTER_SECTIONS */
  sections?: CheckoutSectionId[];
}

/** session.isCvvRequired / session.useSliderCta (live checkout: both true) */
const IS_CVV_REQUIRED = true;
const USE_SLIDER_CTA = true;

const aed = (n: number) => ` ${formatAmount(n)}`;

/** NoonDynamicInvoice sections the session returns for these totals (server copy). */
function buildInvoice(tt: CheckoutTotals, coupon: string | null): InvoiceSection[] {
  const entries = [
    { title: `${t.subtotal} (${tt.itemsCount} ${tt.itemsCount === 1 ? 'item' : 'items'})`, amount: aed(tt.subtotal) },
    { title: t.shipping, amount: tt.shippingFee ? aed(tt.shippingFee) : `<highlight>${t.noon_free}</highlight>` },
  ];
  if (tt.addOns) entries.push({ title: 'Protection plans', amount: aed(tt.addOns) });
  if (tt.discount) entries.push({ title: `Coupon <highlight>(${coupon})</highlight>`, amount: `<highlight>- ${aed(tt.discount)}</highlight>` });
  if (tt.donation) entries.push({ title: 'Donation', amount: aed(tt.donation) });
  if (tt.burnAmount) entries.push({ title: 'Points redeemed', amount: `<highlight>- ${aed(tt.burnAmount)}</highlight>` });
  if (tt.creditsUsed) entries.push({ title: t.noon_credits, amount: `<highlight>- ${aed(tt.creditsUsed)}</highlight>` });
  const sections: InvoiceSection[] = [
    { title: `<h4><b>${t.order_summary}</b></h4>`, entries },
    { entries: [{ title: `<h4><b>${t.total}</b></h4> <steel>${t.vat_message}</steel>`, amount: `<h4><b>${aed(tt.orderPaymentAmount)}</b></h4>` }] },
  ];
  const saved = tt.savings;
  if (saved > 0) sections.push({ isSpecial: true, entries: [{ title: `You are saving <highlight>${aed(saved)}</highlight>`, amount: '' }] });
  return sections;
}

/**
 * NoonCheckoutScreen (session v3 → detached address; sectionsOrder below; useSliderCta + isCvvRequired).
 * Sticky footer (stickyButtonsWrapper + columnReverseWrapper): slider on top, then "N Items" 19/700 steel and
 * the order payment amount 19/700. Every set* call shows the FeedbackView reloader.
 */
export function CheckoutScreen({ params }: ScreenProps<CheckoutParams>) {
  const nav = useNav();
  const scrollY = useMotionValue(0);
  const s = useCheckout((x) => x);
  const totals = useCheckoutTotals();
  const addresses = useAddressStore((a) => a.addresses);
  const defaultId = useAddressStore((a) => a.defaultId);
  const address = addresses.find((a) => a.id === defaultId) ?? addresses[0];
  const [resetSignal, setResetSignal] = useState(0);
  const placedRef = useRef(false);
  const addressModalRef = useRef<number | null>(null);
  const cvvInputRef = useRef<HTMLInputElement | null>(null);
  const paymentRef = useRef<HTMLDivElement | null>(null);

  // cart → checkout: the session carries the cart's coupon (DemoStore owns it; the param is a fallback)
  const { coupon: cartCoupon, cartTotals } = useDemoStore();
  const sessionCoupon = cartTotals.coupon?.state === 'success' ? cartTotals.coupon.code : cartCoupon ?? params.coupon ?? null;
  useEffect(() => {
    checkoutStore.set({ coupon: sessionCoupon });
  }, [sessionCoupon]);
  useEffect(() => {
    if (params.failPayment) checkoutStore.set({ failNextPayment: true });
  }, [params.failPayment]);

  // address modal (AddressV2SelectScreen isBottomSheet): onAddressPress → close() → setAddress → "Address updated"
  useEffect(() => {
    if (addressModalRef.current === null || addressModalRef.current === defaultId) return;
    addressModalRef.current = null;
    const id = setTimeout(() => {
      nav.back();
      checkoutStore.update({ cvv: '' }).then(() => nav.toast(t.noon_address_v2_changed_default_address_toast_message));
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultId]);

  // back on top after a failed / cancelled order → resetSlider()
  const isTop = useIsTop();
  useEffect(() => {
    if (isTop && placedRef.current) {
      placedRef.current = false;
      setResetSignal((n) => n + 1);
    }
  }, [isTop]);

  const selectedCard = s.cards.find((c) => c.id === s.selectedCardId);
  const effectiveCode: PaymentCode = s.useCredits && totals.isCreditsSufficient ? 'nopayment' : s.paymentCode;
  const isCC = effectiveCode === 'cc_noonpay';
  const needsCvv = isCC && IS_CVV_REQUIRED && !isCvvValid(s.cvv, selectedCard?.type);
  const noMethod = isCC && !selectedCard;
  const disabled = (isCC && (!selectedCard || needsCvv)) || totals.itemsCount === 0;
  const isPhoneVerificationRequired = address ? !address.isPhoneVerified : false;

  const ctaText = noMethod ? t.noon_checkout_select_payment_method_cta : needsCvv ? t.noon_checkout_enter_cvv_cta : USE_SLIDER_CTA ? t.noon_checkout_slide_to_order : t.noon_place_order_button;
  const invoice = useMemo(() => buildInvoice(totals, s.coupon), [totals, s.coupon]);

  const placeOrder = () => {
    const fail = s.failNextPayment || (isCC && selectedCard?.mask === FAILING_CARD_LAST4);
    placedRef.current = true;
    checkoutStore.set({
      failNextPayment: false,
      lastOrder: {
        orderId: makeOrderId(),
        items: totals.shipments.flatMap((sh) => sh.lines.map((l) => ({ id: l.product.id, qty: l.qty }))),
        total: totals.orderPaymentAmount,
        paymentCode: effectiveCode,
        addressId: address?.id ?? null,
        promiseLabel: Object.values(totals.selectedPromise)[0]?.confirmationLabel ?? '',
      },
    });
    nav.push('checkout/placing', { fail }, { transition: 'none' });
  };

  const openAddressSelect = () => {
    addressModalRef.current = defaultId;
    nav.push('address/select', { skipLoading: false }, { presentation: 'modal' });
  };

  // Disabled slider ('ENTER CVV' / 'Select payment method'): take the user to what's missing.
  const guideToPayment = () => {
    const input = cvvInputRef.current;
    if (needsCvv && input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => input.focus({ preventScroll: true }), 350);
      return;
    }
    paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderCta = () => {
    if (isPhoneVerificationRequired && address) {
      return (
        <Button
          variant="noon"
          whileTap={undefined}
          onClick={() => {
            addressStore.verify(address.phone);
            nav.toast('Number verified');
          }}
        >
          Verify Phone
        </Button>
      );
    }
    if (effectiveCode === 'apple_pay') {
      return (
        <button type="button" className={styles.applePay} onClick={placeOrder} aria-label="Buy with Apple Pay">
          Buy with <span className={styles.appleMark}></span>Pay
        </button>
      );
    }
    return <SlideButton disabled={disabled} ctaText={ctaText} onSlideComplete={placeOrder} onDisabledPress={guideToPayment} resetSignal={resetSignal} />;
  };

  // Figma Button Dock: slider, then "N Items" + "<dirham> 1,643.00"
  const footer = (
    <div className={styles.sticky}>
      <div className={styles.cta}>{renderCta()}</div>
      <div className={styles.overview}>
        <span className={styles.itemsCount}>{t.item(totals.itemsCount)}</span>
        <span className={styles.totalPrice}>
          <span>{tf.aedPrefix}</span>
          <span>{formatAmount(totals.orderPaymentAmount)}</span>
        </span>
      </div>
    </div>
  );

  const sections = params.sections ?? ALL_FLOWS_SECTIONS;
  const isAllFlows = sections.includes('address_card');
  // master session v3 (detached address): the header shows the title and the address is a section
  const addressInBody = isAllFlows || sections.includes('detached_address');
  const renderSection = (id: CheckoutSectionId) => {
    switch (id) {
      case 'address_card':
        return <AddressCard key={id} address={address} onPress={openAddressSelect} />;
      case 'burn':
        return <PointsVouchers key={id} />;
      case 'pay_with':
        return (
          <div key={id} ref={paymentRef} className={styles.cards}>
            <PaymentMethods cvvInputRef={cvvInputRef} />
          </div>
        );
      case 'donation':
        return <Donation key={id} />;
      case 'detached_address':
        return <DetachedAddress key={id} address={address} onPress={openAddressSelect} />;
      case 'shipments':
        return totals.shipments.map((sh, i) => <CheckoutShipment key={sh.id} shipment={sh} index={i} selected={totals.selectedPromise[sh.id]} />);
      case 'integrated_noonone':
        return <NoonOneSection key={id} variant={isAllFlows ? 'banner' : 'master'} />;
      case 'delivery_instructions':
        return <DeliveryInstruction key={id} />;
      case 'receiver_details':
        return <ReceiverDetails key={id} />;
      case 'payment':
        // Figma "Cards": Points & Vouchers + line + Pay With in one card
        return (
          <div key={id} ref={paymentRef} className={styles.cards}>
            <BurnSection />
            <img className={styles.cardsLine} src={pointsSeparator} width={327} height={1} alt="" />
            <PaymentMethods cvvInputRef={cvvInputRef} />
          </div>
        );
      case 'payment_summary':
        return <PaymentSummary key={id} totals={totals} coupon={s.coupon} flush={isAllFlows} />;
      case 'coupon_status':
        return <CouponStatus key={id} />;
      case 'earn':
        return <EarnCallout key={id} />;
      case 'dynamic_invoice':
        return <DynamicInvoice key={id} sections={invoice} />;
    }
  };

  return (
    <div className={styles.root}>
      <Screen
        header={<CheckoutHeader address={address} scrollY={scrollY} onBack={nav.back} onAddressPress={openAddressSelect} title={addressInBody ? taf.headerTitle : undefined} />}
        footer={footer}
        background="var(--nk-color-chk-fig-page)"
        onScroll={(y) => scrollY.set(y)}
        contentStyle={{ paddingInline: 'var(--nk-space-s12)', paddingTop: 'var(--nk-space-s8)', paddingBottom: 'var(--nk-space-s8)' }}
      >
        <div className={styles.sections}>{sections.map(renderSection)}</div>
      </Screen>
      <VoucherToast />
      <Reloader visible={s.reloading} />
    </div>
  );
}
