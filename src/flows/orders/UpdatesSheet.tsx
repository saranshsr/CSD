import { motion } from 'motion/react';
import { OriginIcon } from '../../components';
import { ref } from '../../foundations/tokens';
import { reveal } from './motion';
import { orderById, stepsFor, trackingFor } from './data';
import styles from './orders.module.css';

/**
 * "See all updates" (bappzaar `see_all_actions` / `view_shipment_history` → NoonOrderDeliveryProgressOverlay): the
 * order's timeline newest first — reached steps with their date, the rest greyed. Return / exchange cards list their
 * own timeline ("Return progress").
 */
export function UpdatesSheet({ params }: { params: { orderId?: string } }) {
  const order = orderById(params.orderId);
  const kind = trackingFor(order).timeline ?? 'delivery';
  const steps = stepsFor(kind)
    .map((s, i) => ({ ...s, date: order.stepDates[i], done: i <= order.step && !(i === 3 && order.status === 'out_for_delivery') }))
    .reverse();
  return (
    <div className={styles.updates}>
      <h2 className={styles.updatesTitle}>{kind === 'return' ? 'Return progress' : 'Delivery progress'}</h2>
      <ol className={styles.updatesList}>
        {steps.map((s, i) => (
          <motion.li key={s.id} className={styles.updatesRow} data-done={s.done || undefined} {...reveal(i)}>
            <span className={styles.updatesDot}>
              {s.done ? <OriginIcon name="check-circle-filled" size={20} color={ref.color('success')} /> : <i />}
            </span>
            <span className={styles.updatesText}>
              <span className={styles.updatesLabel}>{s.label}</span>
              {s.done && s.date && <span className={styles.updatesDate}>{s.date}</span>}
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
