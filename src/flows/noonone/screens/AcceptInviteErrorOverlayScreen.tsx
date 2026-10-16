import { HtmlText } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { VIPButton } from '../components/VIPButton';
import { VIPOverlay, useVipOverlay } from '../components/VIPOverlay';
import { inviteError } from '../data.offers';
import { LANDING } from '../store';
import styles from './AcceptInviteErrorOverlayScreen.module.css';

const DISMISS_CTAS = new Set(['', '/close', '/dismiss', '/exit', '/got-it']);

function Content() {
  const nav = useNav();
  const { close } = useVipOverlay();
  const { headerIconUrl, title, body, buttons } = inviteError;
  // overlayRef.close(); non-dismiss CTA → ModuleHelper.handlePress(linkUrl) — /noon-one = the landing underneath
  const landingBelow = nav.stack.at(-2)?.route === LANDING;
  const onPress = (cta: string) => close(DISMISS_CTAS.has(cta) || landingBelow ? undefined : () => nav.push(LANDING));
  return (
    <div className={styles.container}>
      <img className={styles.icon} src={headerIconUrl} alt="" />
      <span className={styles.title}>{title}</span>
      <div className={styles.bodyContainer}>
        <HtmlText value={body} className={styles.body} />
      </div>
      <div className={styles.buttonContainer}>
        {buttons.map((b) => (
          <VIPButton
            key={b.cta}
            className={[styles.button, b.backgroundColor && styles.buttonLight].filter(Boolean).join(' ')}
            textClassName={b.textColor ? styles.buttonTextDark : styles.buttonText}
            title={b.text}
            onPress={() => onPress(b.cta)}
          />
        ))}
      </div>
    </div>
  );
}

/** VIPAcceptInviteErrorOverlayScreen — server errorPopup (expired / full / already-a-member invite) in a 12px-inset white r18 card. */
export function AcceptInviteErrorOverlayScreen() {
  return (
    <VIPOverlay sheetClassName={styles.sheet}>
      <Content />
    </VIPOverlay>
  );
}
