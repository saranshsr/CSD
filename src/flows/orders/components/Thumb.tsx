import { MarketplaceTag, OriginIcon } from '../../../components';
import { ref } from '../../../foundations/tokens';
import styles from '../orders.module.css';

/**
 * 57×76 r8 product thumb (PDS reference): `#F9F9FB` cell + `rgba(0,40,136,.03)` tint. `installation` adds the blue
 * 20×20 corner badge, `qty > 1` the "x2" chip, `express` (order summary) an inset image with the 54×16 pill below.
 */
export function Thumb({ src, alt, qty, installation, express }: { src: string; alt: string; qty?: number; installation?: boolean; express?: boolean }) {
  return (
    <div className={`${styles.thumb} ${express ? styles.thumbInset : ''}`}>
      <img src={src} alt={alt} draggable={false} />
      {installation && (
        <span className={styles.installBadge}>
          <OriginIcon name="installation-filled" size={12} color={ref.color('textInverse')} />
        </span>
      )}
      {qty && qty > 1 ? <span className={styles.qtyBadge}>x{qty}</span> : null}
      {express && <MarketplaceTag kind="express" height={16} style={{ position: 'absolute', left: 2, bottom: -8, zIndex: 1 }} />}
    </div>
  );
}
