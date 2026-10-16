import { useEffect, useRef, useState } from 'react';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { DynamicBackground, FormFields, FormTitle, ProviderHeader, SubmitButton, validateForm, type FormValues } from './components/ProviderForm';
import { findBurnProvider, loyaltyProviders } from './data.rewards';
import styles from './components/providerForm.module.css';

export interface ProviderBurnParams {
  code?: string;
  isVouchersProvider?: boolean;
}

/** server: requestOtp + getStatus polling (PENDING → SUCCESS) */
const REQUEST_OTP_DELAY = 1100;
/** demo: voucher codes starting with 0000 are rejected by getStatus */
const INVALID_VOUCHER = /^0000/;

/**
 * NoonProviderBurnOverlayScreen — provider redeem page: optional header, r20 main card on the page gradient,
 * logo + crescent + title, voucher code (paste) and/or phone number, submit (Formik validateOnMount → disabled
 * until valid). On success it opens NoonProviderBurnOtpOverlayScreen on top.
 */
export function ProviderBurnScreen({ params }: ScreenProps<ProviderBurnParams>) {
  const nav = useNav();
  const provider = findBurnProvider(params.code ?? '') ?? loyaltyProviders[0];
  const isVouchersProvider = params.isVouchersProvider ?? !!provider.voucherAmount;
  const page = provider.details.redeemPage;
  const color = provider.details.genericThemeColor;
  const saved = page.fields.phoneNumber?.savedPhoneNumber ?? '';
  const [values, setValues] = useState<FormValues>({ voucherCode: '', phone: saved, dialCode: page.fields.phoneNumber?.countryCode ?? '971' });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const isValid = Object.keys(validateForm(values, page.fields)).length === 0;

  const onSubmit = () => {
    setApiError('');
    setSubmitting(true);
    timer.current = setTimeout(() => {
      setSubmitting(false);
      if (page.fields.voucher && INVALID_VOUCHER.test(values.voucherCode.trim())) {
        setApiError('This voucher code is invalid or has already been used.'); // server: getStatus message
        return;
      }
      const phone = values.phone ? `+${values.dialCode.replace('+', '')}-${values.phone}` : null;
      nav.push('checkout/provider-burn-otp', { code: provider.code, isVouchersProvider, voucherCode: values.voucherCode.trim() || null, phone });
    }, REQUEST_OTP_DELAY);
  };

  return (
    <div className={styles.sheet}>
      <DynamicBackground colors={page.header?.background.colors ?? []}>
        <ProviderHeader header={page.header} onCtaPress={() => nav.back()} />
        <DynamicBackground colors={page.background.colors} angle={135} className={styles.main}>
          <FormTitle title={page.title} logo={page.icon} color={color} isVouchersProvider={isVouchersProvider} />
          <FormFields
            values={values}
            onChange={(field, v) => {
              setApiError('');
              setValues((x) => ({ ...x, [field]: v }));
            }}
            error={apiError}
            disabled={submitting}
            page={page}
            color={color}
          />
          <div className={styles.submitContainer}>
            <SubmitButton text={page.submitButton.text} bg={page.submitButton.background.colors[0]} textColor={page.submitButton.textColor} disabled={!isValid} loading={submitting} onPress={onSubmit} />
          </div>
        </DynamicBackground>
      </DynamicBackground>
    </div>
  );
}
