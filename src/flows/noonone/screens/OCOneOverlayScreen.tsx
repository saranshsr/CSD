import { useNav } from '../../../kit/Navigator';
import type { ScreenProps } from '../../../kit/types';
import colorIcon from '@assets/noonone/entry/noon-one-text.webp';
import { LegacyOverlay, useLegacyOverlay } from '../components/entry/LegacyOverlay';
import { ocErrorOverlay, ocOverlay } from '../data.entry';
import styles from './OCOneOverlayScreen.module.css';

type OverlayData = typeof ocOverlay;

/**
 * features/vip/screens/OCOneOverlayScreen — NoonOrderConfirmationScreenV3.openOneSubscriptionOverlay after an order
 * placed with checkout noon One enrollment: touchpoints.checkout.OCOverlay ('succeeded') or OCErrorOverlay.
 * `{logo}` tokens in header/title render misc.colorIcon; buttons /ok close, /noon-one close + ModuleHelper → landing.
 */
export function OCOneOverlayScreen({ params }: ScreenProps<{ status?: 'succeeded' | 'failed' }>) {
  const data = params.status === 'failed' ? ocErrorOverlay : ocOverlay;
  return (
    <LegacyOverlay sheetClassName={styles.sheet}>
      <Content data={data} />
    </LegacyOverlay>
  );
}

function Content({ data }: { data: OverlayData }) {
  const nav = useNav();
  const { close } = useLegacyOverlay();
  const { header, headerColor, title, subTitle, footerNote, buttons } = data;

  const onButton = (cta: string) => {
    if (cta === '/ok') close();
    else if (cta === '/noon-one') close(true, () => nav.push('noonone/landing', { source: '/order-confirmation' }));
  };

  const parts = header.split(' ');
  const titleParts = title.split('{logo}');
  return (
    <div className={styles.wrapper}>
      {header && (
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            {parts.map((text, i) =>
              text === '{logo}' ? (
                <img key={i} className={styles.headerLogo} src={colorIcon} alt="noon One" />
              ) : (
                <span key={i} className={styles.header} style={{ color: headerColor || 'var(--nk-palette-black)' }}>
                  {text}
                  {i < parts.length - 1 ? ' ' : ''}
                </span>
              ),
            )}
          </div>
        </div>
      )}
      {title && (
        <div className={styles.headerRow}>
          <span className={styles.title}>{titleParts[0]}</span>
          {title.includes('{logo}') && <img className={styles.logo} src={colorIcon} alt="noon One" />}
          {titleParts.length > 1 && <span className={styles.title}>{titleParts[1]}</span>}
        </div>
      )}
      {subTitle && <span className={styles.subTitle}>{subTitle}</span>}
      {footerNote && <span className={styles.footerNote}>{footerNote}</span>}
      {buttons.length > 0 && (
        <div className={styles.buttons}>
          {buttons.map((b, i) => (
            <button key={i} type="button" className={`nk-pressable ${styles.button}`} style={{ background: b.bgColor, borderColor: b.borderColor, color: b.textColor }} onClick={() => onButton(b.cta)}>
              {b.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
