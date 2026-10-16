import { useEffect, useState } from 'react';
import { Screen, Skeleton } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { useMembershipManage } from '../../../kit/membership';
import { icons } from '../assets';
import { cardImage, t } from '../data';
import { ChevronLeftRounded } from '../components/icons';
import { VipButton } from '../components/primitives';
import { mb } from '../tokens';
import { useEnsureMembership } from '../store';
import { buildInvoice } from './plansData';
import styles from './plans.module.css';

/**
 * VIPInvoiceScreen — DocumentDownloader.downloadInvoice(invoiceUrl, token) → react-native-pdf. The kit renders the
 * noon One tax invoice PDF page for the demo member. Chrome 1:1: white header (padding 12, shadow2) with 36px round
 * back + share buttons (#E3E3E3 border), 17 bold #0E0E0E "View invoice"; sticky footer (r16 top, shadow3, -16 overlap)
 * with the 56px #101628 "Download" button → "PDF saved successfully".
 */
export function InvoiceScreen({ params }: { params: { state?: string } }) {
  useEnsureMembership(params.state);
  const nav = useNav();
  const s = useMembershipManage();
  const inv = buildInvoice(s);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(id);
  }, []);

  const download = () => {
    setDownloading(true);
    window.setTimeout(() => {
      setDownloading(false);
      nav.toast(`${t('vip_success')} · ${t('vip_pdf_saved_successfully')}`, { tone: 'success' });
    }, 900);
  };

  return (
    <Screen
      background="bgSurface"
      header={
        <div className={styles.invHeader}>
          <button type="button" className={styles.invRoundButton} onClick={nav.back} aria-label="Back">
            <ChevronLeftRounded className={styles.invBackIcon} stroke={mb.color('mbChevronDefault')} strokeWidth={1.9} />
          </button>
          <span className={styles.invTitle}>{t('vip_view_invoice')}</span>
          <button type="button" className={styles.invRoundButton} disabled={loading} onClick={() => nav.toast('Have a look at my noon document')} aria-label="Share">
            <img src={icons.share} width={18} height={18} alt="" />
          </button>
        </div>
      }
      contentStyle={{ background: mb.color('mbPdfBg'), paddingBottom: 32 }}
      footer={
        !loading ? (
          <div className={styles.invFooter}>
            <VipButton className={styles.invDownload} loading={downloading} disabled={downloading} onPress={download}>
              {t('vip_download')}
            </VipButton>
          </div>
        ) : undefined
      }
    >
      {loading ? (
        <div className={styles.invPage}>
          <Skeleton height={24} width="40%" />
          <Skeleton height={14} width="70%" />
          <Skeleton height={160} />
        </div>
      ) : (
        <div className={styles.invPage}>
          <div className={styles.invTop}>
            <span className={styles.invBrand}>noon</span>
            <div className={styles.invTopRight}>
              <span className={styles.invDocTitle}>Tax Invoice</span>
              <span className={styles.invMuted}>{inv.number}</span>
            </div>
          </div>
          <div className={styles.invCols}>
            <div className={styles.invCol}>
              <span className={styles.invLabel}>Sold by</span>
              {inv.seller.map((l) => (
                <span key={l} className={styles.invMuted}>
                  {l}
                </span>
              ))}
            </div>
            <div className={styles.invCol}>
              <span className={styles.invLabel}>Billed to</span>
              <span className={styles.invMuted}>Ankit Debnath</span>
              <span className={styles.invMuted}>ankit@example.com</span>
              <span className={styles.invMuted}>Dubai Marina, Dubai</span>
            </div>
          </div>
          <div className={styles.invMeta}>
            <span>Invoice date</span>
            <strong>{inv.issued}</strong>
            <span>Billing period</span>
            <strong>{inv.period}</strong>
          </div>
          <div className={styles.invTable}>
            <div className={styles.invRowHead}>
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className={styles.invRow}>
              <span>{inv.plan} subscription</span>
              <span>{inv.net}</span>
            </div>
            <div className={styles.invRow}>
              <span>VAT 5%</span>
              <span>{inv.vat}</span>
            </div>
            <div className={styles.invRowTotal}>
              <span>Total (incl. VAT)</span>
              <span>{inv.total}</span>
            </div>
          </div>
          {inv.card && (
            <div className={styles.invPaid}>
              <img src={cardImage(inv.card.brand)} width={32} height={20} alt="" />
              <span>
                Paid with •••• {inv.card.last4} on {inv.issued}
              </span>
            </div>
          )}
          <span className={styles.invFine}>This is a computer-generated invoice and does not require a signature. Demo document.</span>
        </div>
      )}
    </Screen>
  );
}
