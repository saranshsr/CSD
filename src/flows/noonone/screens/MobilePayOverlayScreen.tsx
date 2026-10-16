import { useEffect, useState } from 'react';
import addBokuOtp from '@assets/noonone/icons/add-boku-otp.webp';
import addBokuPhone from '@assets/vip/add-boku-phone.webp';
import closePopup from '@assets/vip/close-overlay-popup.webp';
import { LegacyOverlay, useLegacyOverlay } from '../components/payment/LegacyOverlay';
import { Reloader } from '../components/payment/Reloader';
import { payCopy, paymentLocalStore } from '../data.payment';
import { noononeStore } from '../store';
import { paymentTokens } from '../tokens';
import styles from './MobilePayOverlayScreen.module.css';

const OTP_LENGTH = paymentTokens.otpLength;
const COUNTRY_CODE = '+971';
/** demo: VIPBokuService.validateOtp accepts any code except 000000 */
const BAD_OTP = '000000';

function Content() {
  const { close } = useLegacyOverlay();
  const [pageIndex, setPageIndex] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [coolDown, setCoolDown] = useState(0);
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const hasError = !!errorMessage;

  useEffect(() => {
    if (coolDown <= 0) return;
    const t = setInterval(() => setCoolDown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [coolDown]);

  const fake = (fn: () => void) => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      fn();
    }, paymentTokens.apiMs);
  };

  const switchScreen = (to: number) => {
    setErrorMessage('');
    if (to === 0) {
      setOtp('');
      setMaxAttempts(0);
      setRemainingAttempts(0);
    }
    setPageIndex(to);
  };

  // initiateBokuOptin({ msisdn }) → requestId, remainingAttempts, otpLength, otpCoolDownTimer
  const initiateOptIn = () =>
    fake(() => {
      setMaxAttempts(paymentTokens.otpAttempts + 1);
      setRemainingAttempts(paymentTokens.otpAttempts);
      setCoolDown(paymentTokens.otpCoolDown);
      switchScreen(1);
    });

  // validateBokuOtp → number registered + selected (VIPBokuService.getRegisteredNumbers) → overlay closes
  const validateOtp = () =>
    fake(() => {
      if (otp === BAD_OTP) {
        setErrorMessage(payCopy.wrongOtp);
        setRemainingAttempts((r) => r - 1);
        return;
      }
      const digits = phoneNumber.replace(/\D/g, '');
      const n = { idOptin: `optin_${digits}`, carrierCode: 'stc' as const, msisdnMask: digits.slice(-4) };
      paymentLocalStore.patch((s) => ({ numbers: [...s.numbers.filter((x) => x.idOptin !== n.idOptin), n] }));
      noononeStore.patch({ paymentMethod: { type: 'boku', msisdn: n.idOptin } });
      close();
    });

  const resendOtp = () =>
    fake(() => {
      setErrorMessage('');
      setRemainingAttempts((r) => r - 1);
      setCoolDown(paymentTokens.otpCoolDown);
    });

  const cta = (title: string, onPress: () => void, disabled: boolean) => (
    <button type="button" className={`nk-pressable ${styles.button}`} disabled={disabled} onClick={onPress}>
      {title}
    </button>
  );

  return (
    <div className={styles.container}>
      {pageIndex === 0 ? (
        <>
          <div className={styles.content}>
            <img src={addBokuPhone} alt="" className={styles.icon} />
            <span className={styles.header}>{payCopy.bokuOptinTitle}</span>
            <span className={styles.subtitle}>{payCopy.bokuOptinSubtitle}</span>
            <div className={`${styles.input} ${hasError ? styles.inputError : ''}`}>
              <span className={styles.code}>{COUNTRY_CODE}</span>
              <span className={styles.separator} />
              <input
                className={styles.phone}
                value={phoneNumber}
                onChange={(e) => {
                  setErrorMessage('');
                  setPhoneNumber(e.target.value.replace(/[^\d ]/g, ''));
                }}
                placeholder={payCopy.bokuField}
                inputMode="tel"
                maxLength={12}
              />
            </div>
            <span className={styles.error}>{errorMessage.trim()}</span>
          </div>
          {cta(payCopy.continue, initiateOptIn, hasError || !phoneNumber)}
        </>
      ) : (
        <>
          <img src={addBokuOtp} alt="" className={styles.icon} />
          <span className={styles.header}>{payCopy.bokuVerifyTitle}</span>
          <div className={styles.row}>
            <span className={styles.verifySubtitle}>
              {payCopy.bokuVerifySubtitle} <span className={styles.textBlack}>{`‎${COUNTRY_CODE} ${phoneNumber}`}</span>
            </span>
            <button type="button" className={styles.changeButton} onClick={() => switchScreen(0)}>
              <span className={styles.changeText}>{payCopy.change}</span>
            </button>
          </div>
          <div className={styles.otp} style={{ width: (paymentTokens.otpLength * (49 + 6)) }}>
            {Array.from({ length: OTP_LENGTH }, (_, i) => (
              <span key={i} className={`${styles.otpBox} ${focused && i === Math.min(otp.length, OTP_LENGTH - 1) ? styles.otpBoxFocused : ''} ${hasError ? styles.otpBoxError : ''}`}>
                {otp[i] ?? ''}
              </span>
            ))}
            <input
              className={styles.otpHidden}
              value={otp}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => {
                setErrorMessage('');
                setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
              }}
              inputMode="numeric"
              autoFocus
            />
          </div>
          <div className={styles.row}>
            {!hasError ? <span className={styles.resendPrompt}>{payCopy.missingOtp}</span> : <span className={styles.errorInline}>{errorMessage}</span>}
            {remainingAttempts > 0 && (
              <button type="button" className={`${styles.changeButton} ${coolDown > 0 ? styles.disabled : ''}`} disabled={coolDown > 0} onClick={resendOtp}>
                <span className={styles.resendText}>{`${payCopy.resendOtp} (${maxAttempts - remainingAttempts}/${maxAttempts})`}</span>
              </button>
            )}
            {remainingAttempts > 0 && coolDown > 0 && (
              <span className={styles.coolDown}>
                {coolDown}
                {payCopy.secondsUnit}
              </span>
            )}
          </div>
          {cta(payCopy.verify, validateOtp, hasError || otp.trim().length < OTP_LENGTH)}
        </>
      )}
      <Reloader visible={busy} />
    </div>
  );
}

/** VIPMobilePayOverlayScreen — legacy Overlay with a custom floating close button; Boku opt-in → OTP verify. */
export function MobilePayOverlayScreen() {
  return (
    <LegacyOverlay
      className={styles.overlay}
      renderCloseButton={(close) => (
        <button type="button" className={`nk-pressable ${styles.close}`} onClick={close} aria-label="Close">
          <img src={closePopup} alt="" className={styles.closeIcon} />
        </button>
      )}
    >
      <Content />
    </LegacyOverlay>
  );
}
