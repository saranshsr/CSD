import { MaskIcon } from '../../../../components';
import verifiedFilled from '@assets/pdp/new-pdp/icons/verified-filled-24.svg';
import salesReturn from '@assets/pdp/new-pdp/icons/sales-return-filled-21.svg';
import chevronRight from '@assets/pdp/new-pdp/icons/mini-chevron-right-20.svg';
import { useNav } from '../../../../kit/Navigator';
import { copy, type PdpContent } from '../../data';
import { Card } from '../Sections';
import styles from './SfAdditionalInfo.module.css';

/** additional[].icon → the exact New PDP 64:5696 glyphs: M-Icon/System-Icon/verified-filled 24 (#2567E7) for "TDRA approved",
 * lsicon:sales-return-filled 21 (#0076FF) for the warranty / delivery / returns rows. */
const rowIcons: Record<PdpContent['additional'][number]['icon'], { src: string; size: number; color: string }> = {
  warranty: { src: salesReturn, size: 21, color: 'var(--nk-color-link)' },
  returnable: { src: salesReturn, size: 21, color: 'var(--nk-color-link)' },
  verified: { src: verifiedFilled, size: 24, color: 'var(--nk-color-pdp-sfc-trust-icon)' },
};

/**
 * "Additional Information" (New PDP 64:5696 / Storefront 3499:75536, layer "Trustmarker"): white r16 card, p12, gap 12; 15/700
 * title; rows 8 apart — #F9F9FB r8, 44 high, padding 8·10, 21–24px blue icon + 14/500/18 text, 20px chevron-right.
 * Rows come from the SD shipping items (`content.additional`) and toast their text, as before. Replaces
 * AdditionalInfoCard.
 */
export function SfAdditionalInfo({ content }: { content: PdpContent }) {
  const nav = useNav();
  if (!content.additional.length) return null;
  return (
    <Card contentGap={12}>
      <h3 className={styles.title}>{copy.additionalInfo}</h3>
      <div className={styles.list}>
        {content.additional.map((a) => (
          <button key={a.text} type="button" className={styles.row} onClick={() => nav.toast(a.text)}>
            <MaskIcon src={rowIcons[a.icon].src} size={rowIcons[a.icon].size} color={rowIcons[a.icon].color} />
            <span className={styles.text}>{a.text}</span>
            <MaskIcon src={chevronRight} size={20} color="var(--nk-color-text-primary)" className="pdp-flip" />
          </button>
        ))}
      </div>
    </Card>
  );
}
