import expressMark from '@assets/shared/eta/express.svg';
import expressCut from '@assets/shared/eta/express-cut.svg';
import expressToday from '@assets/shared/eta/express-today.svg';
import marketWord from '@assets/shared/eta/market.svg';
import globalIcon from '@assets/shared/eta/global.svg';
import tomorrowBar from '@assets/shared/eta/tomorrow-bar.png';
import { etaCopy, type EtaSpec } from '../../data/eta';
import { OriginIcon } from '../Icon/OriginIcon';
import styles from './EtaBadge.module.css';

export interface EtaBadgeProps extends EtaSpec {
  className?: string;
}

/**
 * Estimated-delivery badge — Origin Design System `_ETA` (Figma wFRKiKskxZ4vjIHbDVvngJ · 2673:2414), shown on product
 * cards. `type` is the delivery mode, `size` large (primary cards) or small (compact grids, chips); `label` / `value`
 * are the customisable text ("Get in" + "15 Mins", "Get by" + "11 Sep"). Named use cases and `etaFor(product)`
 * live in `src/data/eta.ts`. Artwork in `src/assets/shared/eta/` is the Figma export, used unedited.
 */
export function EtaBadge({ type, size = 'large', label, value, className }: EtaBadgeProps) {
  const large = size === 'large';
  const cls = [styles.eta, className].filter(Boolean).join(' ');
  const text = large && (label || value) ? (
    <span className={styles.text}>
      {label && <span className={styles.label}>{label}</span>}
      {value && <span className={styles.value}>{label ? ` ${value}` : value}</span>}
    </span>
  ) : null;

  if (type === 'minutes' || type === 'supermall') {
    const word = type === 'minutes' ? etaCopy.minutesWord : etaCopy.supermallWord;
    return (
      <span className={cls} data-type={type} data-size={size}>
        <span className={styles.pill}>
          <OriginIcon name="flash-thunder" size={14} color="var(--nk-eta-on-bold)" />
          {large && value ? (
            <span className={styles.pillText}>
              <span className={styles.pillLabel}>{label ?? etaCopy.getIn} </span>
              <span className={styles.pillValue}>{value}</span>
            </span>
          ) : (
            <span className={styles.pillWord}>{word}</span>
          )}
          <OriginIcon name="caret-right" size={14} color="var(--nk-eta-on-bold)" />
        </span>
      </span>
    );
  }
  if (type === 'expressToday') {
    return (
      <span className={cls} data-type={type} data-size={size} role="img" aria-label={etaCopy.a11y.today}>
        {large ? <img src={expressToday} width={109} height={18} alt="" /> : <img src={expressCut} width={60} height={18} alt="" />}
      </span>
    );
  }
  if (type === 'expressTomorrow') {
    return (
      <span className={cls} data-type={type} data-size={size} role="img" aria-label={etaCopy.a11y.tomorrow}>
        <img className={styles.tomorrowMark} src={expressCut} width={60} height={18} alt="" />
        {large && (
          <span className={styles.tomorrow}>
            <img src={tomorrowBar} alt="" />
          </span>
        )}
      </span>
    );
  }
  if (type === 'express') {
    return (
      <span className={cls} data-type={type} data-size={size}>
        <img src={expressMark} width={60} height={18} alt={etaCopy.a11y.express} />
        {text}
      </span>
    );
  }
  if (type === 'market') {
    return (
      <span className={cls} data-type={type} data-size={size}>
        <span className={styles.chip} data-chip="market">
          <OriginIcon name="home-filled" size={14} color="var(--nk-eta-global-color)" />
          <img src={marketWord} width={34.44} height={7.222} alt={etaCopy.a11y.market} />
        </span>
        {text}
      </span>
    );
  }
  return (
    <span className={cls} data-type={type} data-size={size}>
      <span className={styles.chip} data-chip="global">
        <img src={globalIcon} width={16} height={16} alt="" />
        <span className={styles.globalWord}>{etaCopy.global}</span>
      </span>
      {text}
    </span>
  );
}
