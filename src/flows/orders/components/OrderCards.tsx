import { Button, OriginIcon, Pressable } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { currency } from '../../../data';
import { art } from '../assets';
import { money, type Order } from '../data';
import styles from '../orders.module.css';
import { ordersTokens } from '../tokens';
import { PinTiles } from './PinTiles';
import { StarRating } from './StarRating';
import { StatusHeader } from './StatusHeader';
import { Thumb } from './Thumb';

const stop = (fn: () => void) => (e: { stopPropagation: () => void }) => {
  e.stopPropagation();
  fn();
};

/**
 * Active order card (PDS reference): 3px white ring, tinted status strip, thumb + "Arriving today" / "1 item · Out for
 * delivery" / "On time", chevron circle; "Call rider" / "Chat with rider" outline buttons; Delivery PIN bar.
 * The card body opens tracking; the buttons and PIN bar do their own thing.
 */
export function ActiveOrderCard({ order }: { order: Order }) {
  const nav = useNav();
  const track = () => nav.push('orders/tracking', { orderId: order.id });
  const count = order.listCount ?? order.itemCount;
  const first = order.items[0];
  return (
    <article className={styles.card} data-ring style={{ boxShadow: 'none' }}>
      <Pressable className={styles.cardTap} scale={0.98} onClick={track} aria-label={`${order.eta}, track order`}>
        <StatusHeader order={order} size="active" />
        <div className={styles.activeBody}>
          <Thumb src={order.listThumb ?? first.product.image ?? ''} alt={first.product.title} />
          <div className={styles.activeText}>
            <div className={styles.etaBlock}>
              <span className={styles.eta}>{order.eta}</span>
              <span className={styles.meta}>
                {count} item{count > 1 ? 's' : ''}
                <i className={styles.dot} />
                {order.statusLabel}
              </span>
            </div>
            {order.onTime && <span className={styles.onTime}>On time</span>}
          </div>
          <span className={styles.chev}>
            <OriginIcon name="chevron-right" size={20} />
          </span>
        </div>
      </Pressable>
      {order.rider && (
        <div className={styles.riderActions}>
          <Button variant="outline" className={styles.riderBtn} onClick={stop(() => nav.toast(`Calling ${order.rider!.name.split(' ')[0]}…`))}>
            <OriginIcon name="call" size={20} color={ref.color('primary')} /> Call rider
          </Button>
          <Button variant="outline" className={styles.riderBtn} onClick={stop(() => nav.toast('Opening WhatsApp — demo'))}>
            <img src={art.whatsapp} alt="" width={18} height={18} style={{ margin: 1 }} /> Chat with rider
          </Button>
        </div>
      )}
      {order.pin && (
        <div className={styles.pinBar}>
          <span className={styles.pinLabel}>
            <img src={art.deliveryPin} alt="" />
            Delivery PIN
          </span>
          <PinTiles pin={order.pin} />
        </div>
      )}
    </article>
  );
}

/**
 * Order history card (PDS reference): delivered (price + rating row), return completed (refund chip + "Track my
 * refund", 1px outline instead of the shadow), exchanged (warranty chip + price + rating), cancelled (×2 thumb +
 * "Refund credited" row). The reference doesn't navigate from these cards; ours opens tracking (chevron / card tap).
 */
export function HistoryOrderCard({ order }: { order: Order }) {
  const nav = useNav();
  const it = order.items[0];
  const open = () => nav.push('orders/tracking', { orderId: order.id });
  const ratable = order.status === 'delivered' || order.status === 'exchanged';
  const priced = ratable;
  return (
    <article className={styles.card} data-outline={order.status === 'returned' || undefined}>
      <StatusHeader order={order} size={order.status === 'delivered' ? 'regular' : 'compact'} />
      <div className={styles.histBody}>
        <Pressable className={styles.itemRow} scale={0.98} onClick={open} aria-label={`${order.statusWord}: ${it.product.title}`} style={{ width: '100%', textAlign: 'start' }}>
          <span className={styles.itemMain}>
            <Thumb src={it.product.image ?? ''} alt={it.product.title} qty={it.qty} installation={it.installation} />
            <span className={styles.itemText}>
              <span className={styles.itemTitle} data-small={order.status === 'cancelled' || undefined}>
                {it.product.title}
              </span>
              {order.refundChip && (
                <span className={styles.noteChip} style={{ background: ordersTokens.refundChip }}>
                  <OriginIcon name="rewind-alt" size={16} color={ref.color('success')} />
                  {order.refundChip}
                </span>
              )}
              {order.warrantyChip && (
                <span className={styles.noteChip} data-tone="neutral" style={{ background: ordersTokens.warrantyChip }}>
                  <OriginIcon name="star-shield" size={16} />
                  {order.warrantyChip}
                </span>
              )}
              {priced && (
                <span className={styles.itemPrice}>
                  {currency} {money(it.price)}
                </span>
              )}
            </span>
          </span>
          <span className={styles.chev}>
            <OriginIcon name="chevron-right" size={20} />
          </span>
        </Pressable>
        {order.status === 'returned' && (
          <Button variant="outline" className={styles.outlineBtn} onClick={() => nav.push('returns/details')}>
            Track my refund
          </Button>
        )}
        {order.refundCredited && (
          <div style={{ paddingInlineEnd: 2 }}>
            <Pressable className={styles.refundRow} scale={0.98} onClick={() => nav.toast(`Refund credited to card ${order.refundCredited!.card}`)}>
              <OriginIcon name="currency-note-wave-rewind-circle-filled" size={24} color={ref.palette('emeraldGreen700')} />
              <span className={styles.refundText}>
                Refund credited
                <span className={styles.refundSub}>
                  Processed on {order.refundCredited.date} to <img src={art.mastercard} alt="Mastercard" /> {order.refundCredited.card}
                </span>
              </span>
              <OriginIcon name="chevron-right" size={16} color={ref.palette('emeraldGreen700')} />
            </Pressable>
          </div>
        )}
        {ratable && <StarRating order={order} initial={it.rating} />}
      </div>
    </article>
  );
}
