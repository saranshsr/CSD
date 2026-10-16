import { HtmlText } from '../../../components';
import { useParams } from '../../../kit/Navigator';
import oneTrialAlert from '@assets/vip/one-trial-alert.webp';
import { VIPButton } from '../components/VIPButton';
import { VIPOverlay, useVipOverlay } from '../components/VIPOverlay';
import { payCopy, touchpointErrorPopup, type GenericOverlayParams } from '../data.payment';
import styles from './InfoOverlayScreen.module.css';

/** components/VIPPopups/VIPInfoPopup (VIPPopupUtil.showInfoPopup / showTouchpointErrorPopup) */
function InfoPopup({ data }: { data: NonNullable<Extract<GenericOverlayParams, { variant?: 'info' }>['popupData']> }) {
  const { close } = useVipOverlay();
  return (
    <div>
      {data.headerIcon && <img src={oneTrialAlert} alt="" className={styles.headerIcon} />}
      {data.title && (
        // server title.style (demo: centred, edge-spaced) — VIPInfoPopup itself has no padding on the title
        <span className={styles.popupTitle} style={{ textAlign: 'center', paddingInline: 'var(--nk-space-s15)' }}>
          {data.title}
        </span>
      )}
      {data.body && (
        <div className={styles.popupBody}>
          <HtmlText value={data.body} className={styles.body} />
        </div>
      )}
      {data.buttons && (
        <div className={styles.popupButtons}>
          {data.buttons.map((b, i) => (
            <button
              key={b.cta + i}
              type="button"
              className={`nk-pressable ${styles.popupButton}`}
              style={{ background: b.backgroundColor, borderColor: b.backgroundColor, color: b.textColor }}
              onClick={() => close()}
            >
              {b.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** components/VIPPopups/VIPUpdatePopup (VIPPopupUtil.showUpdateDialog) */
function UpdatePopup() {
  const { close } = useVipOverlay();
  return (
    <div className={styles.update}>
      <img src={oneTrialAlert} alt="" className={styles.updateIcon} />
      <span className={styles.updateTitle}>{payCopy.updateTitle}</span>
      <span className={styles.updateSubtitle}>{payCopy.updateSubtitle}</span>
      <VIPButton className={styles.updateButton} textClassName={styles.updateButtonText} title={payCopy.updateNow} onPress={() => close()} />
    </div>
  );
}

/**
 * VIPGenericOverlayScreen — VIPOverlayBottomSheet container whose content comes from VIPPopupUtil. Kit params pick the
 * content: `variant: 'info'` (default; touchpoint error popup, popup + defaultPopup) or `'update'` (app-update sheet,
 * defaultPopup as contentContainerStyle). Plan-details / checkout popups have their own screens (plans / entry areas).
 */
export function GenericOverlayScreen() {
  const params = useParams<GenericOverlayParams>();
  if (params.variant === 'update') {
    return (
      <VIPOverlay popup={params.isPopup} sheetClassName={styles.defaultPopup} sheetStyle={{ margin: '0 var(--nk-space-s12) calc(var(--nk-inset-bottom) + var(--nk-layout-vip-sheet-float))', borderRadius: 'var(--nk-radius-r14)' }}>
        <UpdatePopup />
      </VIPOverlay>
    );
  }
  const data = (params.variant === 'info' || !params.variant) && 'popupData' in params && params.popupData ? params.popupData : touchpointErrorPopup;
  const isPopup = params.isPopup ?? true;
  return (
    <VIPOverlay popup={isPopup} sheetClassName={styles.defaultPopup} sheetStyle={isPopup ? { margin: '0 var(--nk-space-s12) calc(var(--nk-inset-bottom) + var(--nk-layout-vip-sheet-float))', borderRadius: 'var(--nk-radius-r14)' } : undefined}>
      <InfoPopup data={data} />
    </VIPOverlay>
  );
}
