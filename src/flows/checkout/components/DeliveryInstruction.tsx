import { Icon } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import checkboxOff from '@assets/checkout/figma/checkbox-off.svg';
import checkboxOn from '@assets/checkout/figma/checkbox-on.svg';
import infoIcon from '@assets/checkout/figma/di-info.svg';
import { deliveryOptions, td, type DeliveryOption } from '../data.delivery';
import { checkoutStore, useCheckout, type DeliveryInstructionsState } from '../store';
import styles from './delivery.module.css';

/** session deliveryOptions with live status from the checkout store (options flagged `hidden` are left out) */
export function useDeliveryOptions() {
  const di = useCheckout((s) => s.deliveryInstructions);
  return deliveryOptions.filter((o) => !o.hidden).map((o) => (o.field ? { ...o, status: o.status === 'disabled' ? 'disabled' : di[o.field] ? 'active' : 'available' } : o)) as DeliveryOption[];
}

/** NoonCheckoutService.setDeliveryOption → RELOADING → new session */
export function setDeliveryOption(field: keyof DeliveryInstructionsState, active: boolean) {
  return checkoutStore.update((s) => ({ deliveryInstructions: { ...s.deliveryInstructions, [field]: active } }));
}

/**
 * Figma "🚧 Checkout 2.0" Delivery Instructions (14288:184005): white r16 p12, gap 12 — "Delivery instructions"
 * 16/24 Bold + ⓘ (→ learn-more list); two equal Instruction cards (gap 8, p12, gap 16, r16): Blue-Gray/100, or
 * Blue/50 + 1px Accent/200 when selected; icon (Blue-Gray/800 / Accent/700) + checkbox, label 13/16 Medium.
 * Tapping an inactive option opens NoonCheckoutLearnMoreScreen and "Got it" turns it on; tapping an active one
 * turns it off (receiver_phone_code v2 lives in Receiver details).
 */
export function DeliveryInstruction() {
  const nav = useNav();
  const options = useDeliveryOptions();
  const showSomeoneElseReceivingV2 = options.find((o) => o.key === 'receiver_phone_code')?.version === 2;
  const toShow = showSomeoneElseReceivingV2 ? options.filter((o) => o.key !== 'receiver_phone_code') : options;
  if (!toShow.length) return null;

  const onPress = (option: DeliveryOption) => {
    const isActive = option.status === 'active';
    if (isActive && option.field) {
      setDeliveryOption(option.field, false);
      return;
    }
    if (option.action === 'info') nav.push('checkout/learn-more', { isList: false, optionKey: option.key });
    if (option.action === 'receiver_phone') nav.push('checkout/alternate-phone', { mode: 'instruction' });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{td.noon_checkout_delivery_instructions}</span>
        <button type="button" className={styles.infoBtn} aria-label="Delivery instructions info" onClick={() => nav.push('checkout/learn-more', { isList: true })}>
          <img src={infoIcon} width={20} height={20} alt="" />
        </button>
      </div>
      <div className={styles.options}>
        {toShow.map((o) => {
          const active = o.status === 'active';
          const disabled = o.status === 'disabled';
          const tint = active ? 'var(--nk-color-brand-blue)' : 'var(--nk-color-text-body)';
          return (
            <button
              key={o.key}
              type="button"
              className={[styles.option, active && styles.optionActive, disabled && styles.optionDisabled].filter(Boolean).join(' ')}
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onPress(o)}
            >
              <span className={styles.optionTop}>
                {o.figmaIcon ? (
                  <span className={styles.optionIcon} style={{ background: tint, WebkitMaskImage: `url("${o.figmaIcon}")`, maskImage: `url("${o.figmaIcon}")` }} />
                ) : (
                  <Icon name={o.icon} size={20} color={tint} strokeWidth={1.75} />
                )}
                {o.type === 'checkbox' && <img src={active ? checkboxOn : checkboxOff} width={20} height={20} alt="" />}
              </span>
              <span className={styles.optionText}>{o.message}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
