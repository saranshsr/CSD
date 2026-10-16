import { MarketplaceTag, OriginIcon, type OriginIconName } from '../../../components';
import { ref } from '../../../foundations/tokens';
import type { Order } from '../data';
import styles from '../orders.module.css';

/** status disc + word colour per order kind (PDS reference card headers) */
const kinds: Record<Order['status'], { icon: OriginIconName; disc?: string; size: number; color: string }> = {
  processing: { icon: 'order-box-filled', disc: ref.color('primaryBright'), size: 12, color: ref.color('primary') },
  shipped: { icon: 'order-box-filled', disc: ref.color('primaryBright'), size: 12, color: ref.color('primary') },
  out_for_delivery: { icon: 'order-box-filled', disc: ref.color('primaryBright'), size: 12, color: ref.color('primary') },
  delivered: { icon: 'check-circle-filled', size: 16, color: ref.color('success') },
  returned: { icon: 'rewind', disc: ref.color('textStrong'), size: 11, color: ref.color('textPrimary') },
  exchanged: { icon: 'refresh', disc: ref.palette('emeraldGreen700'), size: 12, color: ref.palette('emeraldGreen700') },
  cancelled: { icon: 'cross', disc: ref.palette('dangerRed'), size: 12, color: ref.palette('dangerRed') },
};

/**
 * Card header strip: `#F9F9FB`, r16 top corners; 16 status disc + "**Ordered** on April 16, 2026" (13/20, word 700 in
 * the status colour, date 500) and the express pill (54×16 on the active / cancelled cards, 60×18 otherwise).
 */
export function StatusHeader({ order, size }: { order: Order; size: 'active' | 'regular' | 'compact' }) {
  const k = kinds[order.status];
  const small = order.status === 'cancelled';
  return (
    <div className={styles.strip} data-size={size}>
      <span className={styles.status} data-small={small || undefined}>
        {k.disc ? (
          <span className={styles.disc} data-small={small || undefined} style={{ background: k.disc }}>
            <OriginIcon name={k.icon} size={k.size} color={ref.color('textInverse')} />
          </span>
        ) : (
          <OriginIcon name={k.icon} size={k.size} color={k.color} />
        )}
        <span>
          <b style={{ color: k.color }}>{order.statusWord}</b> on {order.date}
        </span>
      </span>
      {order.marketplace === 'express' && <MarketplaceTag kind="express" height={size === 'active' || small ? 16 : 18} />}
    </div>
  );
}
