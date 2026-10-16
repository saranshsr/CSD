import { useEffect, useRef, useState } from 'react';
import helpIcon from '@assets/checkout/rewards-help.webp';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { FormFields, FormTitle, ProviderHeader, SubmitButton, validateForm, type FormValues } from './components/ProviderForm';
import { earnProviders, findEarnProvider, rt } from './data.rewards';
import { checkoutStore } from './store';
import { rewardsStore } from './store.rewards';
import styles from './components/providerForm.module.css';

export interface ProviderEarnParams {
  code?: string;
  /** opened from NoonCheckoutEarnOverlayScreen → close it too on success (closeParentOverlay) */
  closeParent?: boolean;
  /** opened from the opted-in callout's edit pill */
  isOptIn?: boolean;
}

/** server: checkEarnEligibility + getEarnEligibilityStatus polling */
const ELIGIBILITY_DELAY = 1100;

/**
 * NoonProviderEarnOverlayScreen — white r20 card over a radial gradient of the page colours, logo + crescent +
 * title, phone number field, "How it works?" pill (opens the help overlay), submit and — when already opted in —
 * "Remove points". Success opts the session in (earnOptIn) and shows the voucher toast.
 */
export function ProviderEarnScreen({ params }: ScreenProps<ProviderEarnParams>) {
  const nav = useNav();
  const provider = findEarnProvider(params.code ?? '') ?? earnProviders[0];
  const page = provider.details.earnPage;
  const color = provider.details.genericThemeColor;
  const [values, setValues] = useState<FormValues>({ voucherCode: '', phone: page.fields.phoneNumber?.savedPhoneNumber ?? '', dialCode: page.fields.phoneNumber?.countryCode ?? '971' });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const isValid = Object.keys(validateForm(values, page.fields)).length === 0;

  const close = () => {
    nav.back();
    if (params.closeParent) nav.back();
  };

  const onSubmit = () => {
    setApiError('');
    setSubmitting(true);
    timer.current = setTimeout(() => {
      setSubmitting(false);
      if (values.phone.length < 9) {
        setApiError('This phone number is not linked to an account.'); // server: getEarnEligibilityStatus FAILED message
        return;
      }
      const phone = `+${values.dialCode.replace('+', '')}-${values.phone}`;
      close();
      checkoutStore.update({ earn: { providerCode: provider.code, phone } }).then(() => rewardsStore.showVoucherToast(provider.code, provider.successMessage, provider.logo));
    }, ELIGIBILITY_DELAY);
  };

  const onRemove = () => {
    close();
    checkoutStore.update({ earn: null });
  };

  const radial = page.background.colors.length ? `radial-gradient(circle at 50% 0%, ${page.background.colors.join(', ')})` : undefined;

  return (
    <div className={styles.sheet}>
      <ProviderHeader header={page.header} onCtaPress={() => nav.back()} />
      <div className={styles.earnContent}>
        {radial && <div className={styles.radial} style={{ background: radial }} />}
        <div style={{ position: 'relative' }}>
          <FormTitle title={page.title} logo={page.icon} color={color} isVouchersProvider={false} />
          <FormFields values={values} onChange={(field, v) => (setApiError(''), setValues((x) => ({ ...x, [field]: v })))} error={apiError} disabled={submitting} page={page} color={color} />
          <button type="button" className={styles.howItWorks} style={{ background: `${color}11`, display: 'flex' }} onClick={() => nav.push('checkout/provider-earn-help', { code: provider.code })}>
            <span style={{ width: 20, height: 20, background: color, WebkitMaskImage: `url(${helpIcon})`, maskImage: `url(${helpIcon})`, WebkitMaskSize: 'contain', maskSize: 'contain' }} />
            <span className={styles.howItWorksText}>{rt.noon_how_it_works}</span>
          </button>
          <div className={styles.earnSubmitContainer}>
            <SubmitButton text={page.submitButton.text} bg={page.submitButton.background.colors[0]} textColor={page.submitButton.textColor} disabled={!isValid} loading={submitting} onPress={onSubmit} inset={false} />
            {params.isOptIn && (
              <button type="button" className={styles.removePoints} style={{ color }} onClick={onRemove}>
                {rt.noon_provider_remove_points}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
