import { useLayoutEffect, useRef, useState } from 'react';
import { ref } from '../../../foundations/tokens';
import { CURRENCY, t } from '../data';
import { VipButton } from '../components/primitives';
import { useEnsureMembership } from '../store';
import { PerkSheet, usePerkSheet } from './PerkSheet';
import styles from './perks.module.css';

/**
 * VIPYangoCreditsOverlayScreen — @gorhom BottomSheet (src/components/BottomSheet). Title 16 bold #0E0E0E, a #F9F9FB r12
 * card (1px #F0F0F0) with three 44px circled-check steps (first filled #108757, others white + #989FB3 icon) joined by a
 * 17px #108757→white gradient rail from the middle of row 1 to the middle of row 3, then a 56px #0E0E0E "Okay, got it".
 * `isTrialValid` switches step 1's description (trial vs paid). Currency = config.country.currencyName (AED).
 */
export function YangoCreditsOverlayScreen({ params }: { params: { state?: string; isTrialValid?: boolean } }) {
  useEnsureMembership(params.state);
  return (
    <PerkSheet kind="bottomSheet" className={styles.yangoSheet}>
      <YangoContent isTrialValid={!!params.isTrialValid} />
    </PerkSheet>
  );
}

function YangoContent({ isTrialValid }: { isTrialValid: boolean }) {
  const { close } = usePerkSheet();
  const row1 = useRef<HTMLDivElement>(null);
  const row3 = useRef<HTMLDivElement>(null);
  const [pad, setPad] = useState({ top: 30, bottom: 30 });
  useLayoutEffect(() => {
    setPad({ top: (row1.current?.offsetHeight ?? 60) / 2, bottom: (row3.current?.offsetHeight ?? 60) / 2 });
  }, []);
  const currency = CURRENCY;
  const steps = [
    { title: t('vip_one_yango_credits_step_1_title'), text: isTrialValid ? t('vip_one_yango_credits_step_1_description_trial', { currency }) : t('vip_one_yango_credits_step_1_description_paid', { currency }), done: true, ref: row1 },
    { title: t('vip_one_yango_credits_step_2_title'), text: t('vip_one_yango_credits_step_2_description', { currency }), done: false },
    { title: t('vip_one_yango_credits_step_3_title'), text: t('vip_one_yango_credits_step_3_description'), done: false, ref: row3, bottom: true },
  ];
  return (
    <div className={styles.yangoContainer}>
      <span className={styles.yangoHeader}>{t('vip_one_yango_credits_title', { currency })}</span>
      <div className={styles.yangoBody}>
        <div className={styles.yangoRows}>
          {steps.map((s) => (
            <div key={s.title} className={styles.yangoRow}>
              <span className={styles.yangoCheck} data-done={s.done || undefined}>
                <CircledCheck fill={s.done ? ref.palette('white') : ref.color('textTertiary')} />
              </span>
              <div className={styles.yangoText} ref={s.ref}>
                <span className={styles.yangoTitle}>{s.title}</span>
                <span className={styles.yangoDesc} data-bottom={s.bottom || undefined}>
                  {s.text}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.yangoRail} style={{ paddingTop: pad.top, paddingBottom: pad.bottom }}>
          <span className={styles.yangoGradient} />
        </div>
      </div>
      <div className={styles.yangoButtonWrap}>
        <VipButton className={styles.yangoButton} onPress={() => close()}>
          {t('vip_food_okay_got_it')}
        </VipButton>
      </div>
    </div>
  );
}

/** VIPIcons.circledCheck (check-circle.svg, 25×25, fill white; master passes fill #989FB3 for pending steps) */
function CircledCheck({ fill }: { fill: string }) {
  return (
    <svg width={25} height={25} viewBox="0 0 25 25" aria-hidden>
      <path
        fill={fill}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.75 12.5C2.75 7.11522 7.11522 2.75 12.5 2.75C17.8848 2.75 22.25 7.11522 22.25 12.5C22.25 17.8848 17.8848 22.25 12.5 22.25C7.11522 22.25 2.75 17.8848 2.75 12.5ZM16.1103 10.6859C16.3511 10.3489 16.273 9.88046 15.9359 9.6397C15.5989 9.39894 15.1305 9.47701 14.8897 9.81407L11.6543 14.3436L10.0303 12.7197C9.73744 12.4268 9.26256 12.4268 8.96967 12.7197C8.67678 13.0126 8.67678 13.4874 8.96967 13.7803L11.2197 16.0303C11.3756 16.1862 11.5921 16.2656 11.8119 16.2474C12.0316 16.2293 12.2322 16.1153 12.3603 15.9359L16.1103 10.6859Z"
      />
    </svg>
  );
}
