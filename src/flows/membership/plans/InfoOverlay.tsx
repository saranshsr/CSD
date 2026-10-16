import type { CSSProperties } from 'react';
import { HtmlText, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { icons } from '../assets';
import { t } from '../data';
import { VipOverlay, useVipOverlay } from '../components/VipOverlay';
import { acquisitionRoute } from '../links';
import styles from './plans.module.css';

/** VIPInfoOverlayDataType (headerIcon is a function on master → asset key / URL here) */
export interface InfoOverlayData {
  headerIcon?: keyof typeof icons | string;
  title?: { text: string; style?: CSSProperties };
  body?: { text: string; style?: Record<string, CSSProperties> };
  infoList?: string[];
  reminder?: { title: string; description: string; iconUrl?: string };
  buttons?: { text: string; cta: string; link?: string }[];
}

/** styles.ts defaultBodyStyle: p 16 centred (on top of HtmlView's 13px #404553 base) */
const defaultBodySheet = { p: { fontSize: 16, textAlign: 'center' as const } };

/** Demo payload when opened directly: VIPSubscriptionButtonV2.showWarningPopup (trial not eligible). */
export const trialWarningData: InfoOverlayData = {
  headerIcon: 'oneTrialAlert',
  title: { text: t('vip_one_trial_warning_title'), style: { fontSize: 22, lineHeight: '28px', textAlign: 'center' } },
  body: {
    text: '<p>A free trial was already used with this phone number. You can still join noon One and start saving today.</p>',
    style: { p: { fontSize: 16, textAlign: 'center' } },
  },
  buttons: [
    { text: t('vip_change_number_button'), cta: '/changeNumber' },
    { text: t('vip_continue'), cta: '/ok' },
  ],
};

function InfoContent({ data, isPopup }: { data: InfoOverlayData; isPopup?: boolean }) {
  const nav = useNav();
  const { close } = useVipOverlay();
  const { headerIcon, title, body, infoList, reminder, buttons } = data;
  const iconSrc = headerIcon ? ((icons as Record<string, string>)[headerIcon] ?? headerIcon) : undefined;

  const onButton = (cta: string) => {
    switch (cta) {
      case '/noon-one':
        return close(() => nav.push(acquisitionRoute('landing')));
      case '/cancel-membership':
        // VIPChangePlanScreen "Cancel membership" Alert → OK
        return close(() => nav.push('membership/cancel'));
      case '/changeNumber':
        // PrimaryPhoneVerificationV2Screen is outside the noon One port → toast stand-in
        return close(() => nav.toast('Phone verification opens here', { tone: 'default' }));
      default:
        // '/ok' · '/back' · '/openLink' · '/dismiss'
        return close();
    }
  };

  return (
    <div className={isPopup ? styles.infoPopupContainer : styles.infoContainer}>
      {iconSrc && <img className={styles.infoHeaderIcon} src={iconSrc} alt="" />}
      {title?.text && (
        <span className={styles.infoTitle} style={title.style}>
          {title.text}
        </span>
      )}
      {body?.text && (
        <div className={styles.infoBody}>
          <HtmlText base value={body.text} stylesheet={body.style ?? defaultBodySheet} />
        </div>
      )}
      {infoList?.map((item, i) => (
        <div key={i} className={styles.infoListRow}>
          <span>{'•  '}</span>
          <span className={styles.flex1}>{item}</span>
        </div>
      ))}
      {reminder && (
        <div className={styles.infoReminder}>
          <div className={styles.infoReminderHeader}>
            {reminder.iconUrl && <img src={reminder.iconUrl} width={18} height={18} alt="" />}
            <span className={styles.infoReminderTitle}>{reminder.title}</span>
          </div>
          <span className={styles.infoReminderDescription}>{reminder.description}</span>
        </div>
      )}
      {!!buttons?.length && (
        <div className={styles.infoButtons}>
          {buttons.map((b, i) => (
            <Pressable key={i} scale={1} className={styles.infoButton} data-hollow={i > 0 || undefined} onClick={() => onButton(b.cta)}>
              {b.text.toUpperCase()}
            </Pressable>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * VIPInfoOverlayScreen — generic info sheet / popup (VIPSubscriptionButtonV2 trial warning, referrals input info).
 * Sheet: white r16 card, margin 0 12, padding 32 15 12. Popup (isPopup): centred, r24, padding 32 23 12, not closable
 * by backdrop. Buttons: src/components/Button 48px black r8, 2nd+ hollow (1px black border), labels upper-cased.
 */
export function InfoOverlay({ params }: { params: { data?: InfoOverlayData; isPopup?: boolean } }) {
  const isPopup = params.isPopup ?? !params.data;
  return (
    <VipOverlay variant={isPopup ? 'popup' : 'sheet'} canBeClosed={!isPopup} className={isPopup ? styles.infoPopupSheet : styles.transparentSheet}>
      <InfoContent data={params.data ?? trialWarningData} isPopup={isPopup} />
    </VipOverlay>
  );
}

