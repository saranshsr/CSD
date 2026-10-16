import { HtmlText } from '../../../components';
import { useNav, useParams } from '../../../kit/Navigator';
import oneTrialAlert from '@assets/vip/one-trial-alert.webp';
import { VIPOverlay, useVipOverlay } from '../components/VIPOverlay';
import { trialWarningPopup, type InfoOverlayParams } from '../data.payment';
import styles from './InfoOverlayScreen.module.css';

export const headerIcons = { oneTrialAlert };

function Content({ data }: { data: InfoOverlayParams }) {
  const nav = useNav();
  const { close } = useVipOverlay();
  const { isPopup, headerIcon, title, body, infoList, reminder, buttons } = data;

  const onButton = (cta: string) => {
    switch (cta) {
      case '/changeNumber':
        // PrimaryPhoneVerificationV2Screen (not in the kit)
        close(() => nav.toast('Phone verification — not in this kit'));
        break;
      case '/noon-one':
        close(() => nav.push('noonone/landing', { source: '/' }));
        break;
      case '/back':
        // dismissParent (navigator.pop) + close
        close(() => nav.back());
        break;
      default:
        close();
    }
  };

  return (
    <div className={isPopup ? styles.popupContainer : styles.container}>
      {headerIcon && <img src={headerIcons[headerIcon]} alt="" className={styles.headerIcon} />}
      {title && <span className={`${styles.title} ${title.style === 'warning' ? styles.titleWarning : ''}`}>{title.text}</span>}
      {body && (
        <div className={styles.bodyContainer}>
          <HtmlText value={body.text} className={styles.body} />
        </div>
      )}
      {infoList?.map((item) => (
        <div key={item} className={styles.listRow}>
          <span>{'•  '}</span>
          <span className={styles.listText}>{item}</span>
        </div>
      ))}
      {reminder && (
        <div className={styles.reminder}>
          <span className={styles.reminderTitle}>{reminder.title}</span>
          <div className={styles.reminderDesc}>{reminder.description}</div>
        </div>
      )}
      {buttons && (
        <div className={styles.buttons}>
          {buttons.map((b, i) => (
            <button key={b.cta + i} type="button" className={`nk-pressable ${styles.button} ${i > 0 ? styles.hollow : ''}`} onClick={() => onButton(b.cta)}>
              {b.text.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * VIPInfoOverlayScreen (VIPUtil.showInfoOverlay / showWarningPopup, VIPSubscriptionButtonV2 trial warning).
 * VIPOverlayBottomSheet with a transparent container; popup: centred, r24, 8px inset, canBeClosed false.
 * Params = InfoOverlayParams (default: the "not eligible for free trial" warning).
 */
export function InfoOverlayScreen() {
  const params = useParams<InfoOverlayParams & { variant?: string }>();
  const data: InfoOverlayParams = params.title || params.body ? params : trialWarningPopup;
  return (
    <VIPOverlay
      popup={data.isPopup}
      canBeClosed={!data.isPopup}
      sheetStyle={data.isPopup ? { background: 'transparent', borderRadius: 'var(--nk-radius-r24)', margin: '0 var(--nk-space-s8)' } : { background: 'transparent' }}
    >
      <Content data={data} />
    </VIPOverlay>
  );
}
