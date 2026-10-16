import { Fragment } from 'react';
import { Button, Icon } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { setDeliveryOption, useDeliveryOptions } from './components/DeliveryInstruction';
import { td, type DeliveryOptionKey } from './data.delivery';
import styles from './components/alternatePhone.module.css';

export interface LearnMoreParams {
  /** true → info-icon list of all delivery instructions; false → one option (activated on Got it) */
  isList?: boolean;
  optionKey?: DeliveryOptionKey;
}

/**
 * NoonCheckoutLearnMoreScreen (floating OverlayBottomSheet). List: "Delivery instructions" 18/700, rows of 20px icon +
 * title 18/600 + info 16. Option: 32px icon, title 18/700, description 16/22, note (r8, padding 10), then "Got It".
 * onDismiss(true) activates the option.
 */
export function LearnMoreScreen({ params }: ScreenProps<LearnMoreParams>) {
  const nav = useNav();
  const all = useDeliveryOptions();
  const isList = params.isList ?? !params.optionKey;
  const optionsList = all.filter((o) => o.key !== 'receiver_phone_code' || o.version !== 2);
  const option = all.find((o) => o.key === (params.optionKey ?? 'dd'));

  const onCtaPress = () => {
    nav.back();
    if (!isList && option?.field) setDeliveryOption(option.field, true);
  };

  return (
    <div className={styles.learn}>
      {isList ? (
        <>
          <div className={`${styles.learnHeader} ${styles.learnListHeader}`}>
            <span className={styles.learnTitle}>{td.noon_checkout_delivery_instructions}</span>
          </div>
          {optionsList.map((o, i) => (
            <Fragment key={o.key}>
              <div className={[styles.listItem, i !== optionsList.length - 1 && styles.listItemMargin].filter(Boolean).join(' ')}>
                <Icon name={o.icon} size={20} color="var(--nk-color-text-body)" strokeWidth={1.75} className={styles.listIcon} />
                <div className={styles.listContent}>
                  <div className={styles.listTitle}>{o.message}</div>
                  {o.info && <div className={styles.listDescription}>{o.info}</div>}
                </div>
              </div>
            </Fragment>
          ))}
        </>
      ) : option ? (
        <>
          <div className={styles.learnHeader}>
            <Icon name={option.icon} size={32} color="var(--nk-color-brand-blue)" strokeWidth={1.5} />
          </div>
          <div className={styles.learnTitle}>{option.message}</div>
          {option.description && <div className={styles.learnDescription}>{option.description}</div>}
          {option.note?.content && (
            <div className={styles.learnNote} style={{ backgroundColor: option.note.backgroundHexa }}>
              <span className={styles.learnNoteText}>{option.note.content}</span>
            </div>
          )}
        </>
      ) : null}
      <div className={styles.learnCta}>
        <Button variant="noon" titleCase onClick={onCtaPress} style={{ width: '100%' }} spinner={{ size: 20, color: 'var(--nk-color-text-inverse)', track: 'var(--nk-palette-white-alpha40)' }} whileTap={{ opacity: 0.8 }} transition={{ duration: 0.12 }}>
          {td.noon_got_it}
        </Button>
      </div>
    </div>
  );
}
