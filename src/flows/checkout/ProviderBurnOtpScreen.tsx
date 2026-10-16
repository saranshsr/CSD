import { useEffect, useMemo, useRef, useState } from 'react';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { InfoEditButton } from './components/RewardsPrimitives';
import { AmountEntry, AmountTicket, AvailableBalance, DynamicBackground, ProviderHeader, SubmitButton, TermsNote, VerifyOtp } from './components/ProviderForm';
import { FAILING_OTP, findBurnProvider, loyaltyProviders, otpErrorMessage, otpResendSeconds, rt } from './data.rewards';
import { checkoutStore } from './store';
import { rewardsStore } from './store.rewards';
import { useCheckoutTotals } from './totals';
import { checkoutServerColors } from './tokens';
import styles from './components/providerForm.module.css';
import { currency } from '../../data';

export interface ProviderBurnOtpParams {
  code?: string;
  isVouchersProvider?: boolean;
  voucherCode?: string | null;
  phone?: string | null;
}

/** server: verifyRedeem + getStatus polling */
const VERIFY_DELAY = 1200;
const RESEND_DELAY = 800;

/**
 * NoonProviderBurnOtpOverlayScreen — vouchers: amount ticket (voucher value + code edit pill); loyalty: "Enter amount
 * to redeem" pill input (min/max = min(balance, maxAmount, order total)) + available-balance checkbox. Then the
 * OTP title (+ phone edit pill for loyalty), 6 segmented boxes with resend timer, terms notes and the submit button
 * (disabled until the OTP is complete and the amount is in range). Success closes both overlays, applies the burn
 * to the session and shows the voucher toast.
 */
export function ProviderBurnOtpScreen({ params }: ScreenProps<ProviderBurnOtpParams>) {
  const nav = useNav();
  const { total } = useCheckoutTotals();
  const provider = findBurnProvider(params.code ?? '') ?? loyaltyProviders[0];
  const isVouchersProvider = params.isVouchersProvider ?? !!provider.voucherAmount;
  const page = provider.details.otpPage;
  const color = provider.details.genericThemeColor;
  const bgColors = page.background.colors;
  const amountField = page.fields.amount;
  const otpField = page.fields.otp;
  const phone = params.phone ?? `+971-${page.fields.phoneNumber?.savedPhoneNumber ?? '501234567'}`;
  const voucherCode = params.voucherCode ?? 'NOON-GIFT-2024';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(otpResendSeconds);
  const [amount, setAmount] = useState('');
  const [outOfRange, setOutOfRange] = useState(false);
  const [balanceChecked, setBalanceChecked] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [timer > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const balance = provider.balance;
  const floatBalance = balance ? parseFloat(balance) : 0;
  const maxAmount = Math.min(balance ? Math.min(floatBalance, amountField?.maxAmount ?? 0) : (amountField?.maxAmount ?? 0), Math.max(total, 0));

  const updateAmount = (value: string) => {
    const n = value ? parseFloat(value) || 0 : undefined;
    setAmount(value);
    setOutOfRange(n !== undefined && ((amountField?.minAmount != null && n < amountField.minAmount) || n > maxAmount));
    setBalanceChecked(!!balance && floatBalance === n);
  };

  const submitDisabled = useMemo(
    () => (!!otpField && otp.length !== otpField.length) || (!!amountField && (!amount.trim() || outOfRange)),
    [otp, otpField, amountField, amount, outOfRange],
  );

  const onSubmit = () => {
    setLoading(true);
    setError(null);
    t.current = setTimeout(() => {
      setLoading(false);
      if (otp === FAILING_OTP) {
        setError(otpErrorMessage);
        return;
      }
      const redeemed = isVouchersProvider ? Number(provider.voucherAmount ?? 0) : Number(amount);
      // closeBurnOverlay() + closeOverlay() → onRedeemSuccess → getSession → voucher toast
      nav.back();
      nav.back();
      checkoutStore.update({ burn: { providerCode: provider.code, amount: redeemed } }).then(() => {
        rewardsStore.showVoucherToast(provider.code, provider.successMessage(redeemed.toFixed(2)), provider.logo);
      });
    }, VERIFY_DELAY);
  };

  const onResend = () => {
    setLoading(true);
    setError(null);
    t.current = setTimeout(() => {
      setLoading(false);
      setOtp('');
      setTimer(otpResendSeconds);
    }, RESEND_DELAY);
  };

  return (
    <div className={styles.sheet}>
      <DynamicBackground colors={page.header?.background.colors ?? []}>
        <ProviderHeader header={page.header} onCtaPress={() => (nav.back(), nav.back())} />
        <DynamicBackground colors={bgColors} angle={135} className={styles.main}>
          {isVouchersProvider && (
            <AmountTicket logo={page.icon} amount={provider.voucherAmount ?? '0'} currency={currency} voucherCode={voucherCode} onEdit={() => nav.back()} notchColor={bgColors[0] ?? checkoutServerColors.white} color={color} />
          )}
          {amountField && (
            <div className={styles.otpTitleContainer}>
              <div className={styles.otpLogoContainer}>
                <span className={styles.otpTitleText}>{rt.noon_provider_amount_input_label}</span>
              </div>
              <AmountEntry amount={amount} setAmount={updateAmount} currency={currency} disabled={loading} color={color} min={amountField.minAmount} max={maxAmount} isOutOfRange={outOfRange} />
              {balance && <AvailableBalance checked={balanceChecked} onToggle={() => updateAmount(balanceChecked ? '' : String(Math.min(floatBalance, maxAmount)))} providerName={provider.name} balance={balance} disabled={loading} />}
            </div>
          )}
          {otpField && (
            <>
              <div className={styles.otpTitleContainer}>
                <div className={styles.otpLogoContainer}>
                  <span className={styles.otpTitleText}>{page.title}</span>
                </div>
                {!isVouchersProvider && <InfoEditButton text={phone} onPress={() => nav.back()} color={color} disabled={loading} style={{ alignSelf: 'center' }} />}
              </div>
              <VerifyOtp
                value={otp}
                onChange={(v) => {
                  setError('');
                  if (!loading) setOtp(v);
                }}
                length={otpField.length}
                color={color}
                error={error}
                timer={timer}
                otpMessage={null}
                onResend={onResend}
                autoFocus={!amountField}
                disabled={loading}
              />
            </>
          )}
          {provider.details.terms.map((line) => (
            <TermsNote key={line} text={line} color={color} />
          ))}
          <div className={styles.submitContainerOtp}>
            <SubmitButton text={page.submitButton.text} bg={page.submitButton.background.colors[0]} textColor={page.submitButton.textColor} disabled={submitDisabled} loading={loading} onPress={onSubmit} minHeight={50} />
          </div>
        </DynamicBackground>
      </DynamicBackground>
    </div>
  );
}
