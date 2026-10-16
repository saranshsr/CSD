import { Button, DashedDivider, OriginIcon, Pressable } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { currency } from '../../../data';
import { art } from '../assets';
import { money, money2, type Bill } from '../data';
import styles from '../orders.module.css';

/**
 * Bill summary card (PDS reference): "Paid with [Apple Pay]", a 1px `#F2F3F7` r12 box with subtotal (struck was price),
 * delivery fee, the noon One free-delivery strip, coupon discount (green), total paid, and the zig-zag mint savings
 * footer; "Download invoice" outline button under it.
 */
export function BillSummary({ bill }: { bill: Bill }) {
  const nav = useNav();
  return (
    <section className={styles.bill}>
      <div className={styles.billHead}>
        <h2 className={styles.blockTitle} style={{ paddingInlineStart: 0 }}>
          Bill summary
        </h2>
        <p className={styles.paidWith}>
          Paid with
          <span className={styles.payMark}>
            <img src={art.applePay} alt="" />
          </span>
          <b>{bill.methodLabel}</b>
        </p>
      </div>
      <div className={styles.billBox}>
        <div className={styles.billRow}>
          <span>Subtotal</span>
          <span className={styles.billValue}>
            <s>
              {currency}
              {money2(bill.subtotalWas)}
            </s>
            <strong>
              {currency} {money2(bill.subtotal)}
            </strong>
          </span>
        </div>
        <div className={styles.billRow}>
          <span>Delivery Fee</span>
          <strong>
            {currency} {money2(bill.delivery)}
          </strong>
        </div>
        <div className={styles.oneStripWrap}>
          <Pressable className={styles.oneStrip} scale={0.98} onClick={() => nav.push('noonone/landing', { source: '/orders' })}>
            <img className={styles.oneLines} src={art.bannerLines} alt="" />
            <span className={styles.oneText}>
              Get unlimited Free Delivery with
              <span className={styles.oneLogo} aria-label="noon One">
                <img src={art.noonOneBase} alt="" />
                <img src={art.noonOneText} alt="" />
              </span>
            </span>
            <span className={styles.oneChev}>
              <OriginIcon name="chevron-right" size={14} />
            </span>
          </Pressable>
        </div>
        <DashedDivider inset={12} />
        <div className={styles.billRow} data-tone="success">
          <span className={styles.billValue}>
            Coupon Discount <OriginIcon name="coupon-discount-filled" size={16} color={ref.color('success')} />
          </span>
          <strong>
            – {currency} {money2(bill.coupon)}
          </strong>
        </div>
        <DashedDivider inset={12} />
        <div className={`${styles.billRow} ${styles.billTotal}`}>
          <span>Total paid</span>
          <strong>
            {currency} {money2(bill.total)}
          </strong>
        </div>
        <div className={styles.savings}>
          <img src={art.savingsZigzag} alt="" />
          <div className={styles.savingsBody}>
            <b>
              {currency} {money(bill.saved)} saved + {currency} {money2(bill.cashback)} cashback
            </b>
            <span>{bill.note}</span>
          </div>
        </div>
      </div>
      <div className={styles.invoiceWrap}>
        <Button variant="secondary" className={styles.invoiceBtn} onClick={() => nav.toast('Invoice downloaded', { tone: 'success' })}>
          <OriginIcon name="download" size={20} /> Download invoice
        </Button>
      </div>
    </section>
  );
}
