import { motion } from 'motion/react';
import { useState } from 'react';
import { Screen } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import backIcon from '@assets/membership/back.webp';
import shareBlack from '@assets/membership/share-black.webp';
import whatsappWhite from '@assets/membership/whatsapp-white.webp';
import { icons } from '../assets';
import { t } from '../data';
import { useEnsureMembership } from '../store';
import { referralLink, referrals, type ReferralStat } from './perksData';
import styles from './perks.module.css';

const statIcons: Record<string, string> = { userGroup: icons.userGroup, gift: icons.gift };

/**
 * VIPReferralsScreen — white shadow2 header (back.webp + "Refer & Earn" 16/24 bold), page title 19 bold centred,
 * CMS header image (headerImageRatio % of width-32), stats rows (r16, 2px server border, icon pill at top -12),
 * CMS modules, sticky footer (dashed #38AE04 code box → copied #DFF1DA, WhatsApp + share buttons 48 r8).
 */
export function ReferralsScreen({ params }: { params: { state?: string } }) {
  useEnsureMembership(params.state);
  const nav = useNav();
  const [copied, setCopied] = useState(false);
  const d = referrals;

  const copy = () => {
    navigator.clipboard?.writeText(d.referralCode).catch(() => {});
    setCopied(true);
  };
  const onButton = async (cta: string) => {
    const url = referralLink(d.referralCode);
    if (cta === '/whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${d.referralMessage} ${url}`)}`, '_blank', 'noopener');
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ url, text: d.referralMessage });
      } catch {
        /* dismissed */
      }
    } else {
      navigator.clipboard?.writeText(`${d.referralMessage} ${url}`).catch(() => {});
      nav.toast('Invite link copied');
    }
  };

  return (
    <Screen
      background="bgSurface"
      safeTop={false}
      header={
        <div className={styles.refHeader}>
          <motion.button type="button" className={styles.refBack} onClick={nav.back} whileTap={{ opacity: 0.2 }} aria-label="Back">
            <img src={backIcon} alt="" />
          </motion.button>
          <span className={styles.refHeaderTitle}>{t('vip_refer_earn')}</span>
        </div>
      }
      footer={
        <div className={styles.refFooter}>
          <div className={styles.refCodeBox} data-copied={copied || undefined}>
            <span className={styles.refCode}>{d.referralCode}</span>
            {copied ? (
              <span className={styles.refCopied}>{d.referralCodeCopiedText}</span>
            ) : (
              <motion.button type="button" className={styles.refCopy} onClick={copy} whileTap={{ opacity: 0.2 }}>
                {d.referralCodeCopyText}
              </motion.button>
            )}
          </div>
          <div className={styles.refButtons}>
            {d.buttons.map((b) => (
              <motion.button
                key={b.cta}
                type="button"
                className={styles.refStickyButton}
                style={{ background: b.color, borderColor: b.borderColor, color: b.textColor }}
                whileTap={{ opacity: 0.2 }}
                onClick={() => onButton(b.cta)}
              >
                <img className={styles.refStickyIcon} src={b.cta === '/whatsapp' ? whatsappWhite : shareBlack} alt="" />
                {b.text}
              </motion.button>
            ))}
          </div>
        </div>
      }
    >
      <h1 className={styles.refPageTitle}>{d.title}</h1>
      {/* headerImageUrl (CMS banner) — placeholder at headerImageRatio */}
      <div className={styles.refHeaderImage} style={{ aspectRatio: `100 / ${d.headerImageRatio}` }}>
        <img src={icons.gift} alt="" className={styles.refHeaderImageIcon} />
        <span className={styles.refHeaderImageText}>
          Refer friends.
          <br />
          Earn free months.
        </span>
      </div>
      {d.stats.rows.map((row, ri) => (
        <div key={ri} className={styles.refStatsRow}>
          {row.map((s: ReferralStat) => (
            <div key={s.key} className={styles.refStat} style={{ borderColor: s.borderColor, background: s.backgroundColor }}>
              <span className={styles.refStatPill} style={{ background: s.borderColor }}>
                <img className={styles.refStatIcon} src={statIcons[s.iconUrl]} alt="" />
              </span>
              <span className={styles.refStatTitle}>{s.title}</span>
              <span className={styles.refStatValue}>{d.dynamicData[s.key]}</span>
            </div>
          ))}
        </div>
      ))}
      <section className={styles.refCms}>
        <span className={styles.refCmsTitle}>{d.howItWorks.title}</span>
        {d.howItWorks.steps.map((s, i) => (
          <div key={s.title} className={styles.refCmsStep}>
            <span className={styles.refCmsIndex}>{i + 1}</span>
            <div className={styles.refCmsText}>
              <span className={styles.refCmsStepTitle}>{s.title}</span>
              <span className={styles.refCmsStepBody}>{s.text}</span>
            </div>
          </div>
        ))}
        <motion.button type="button" className={styles.refHaveCode} whileTap={{ opacity: 0.2 }} onClick={() => nav.push('membership/referralsInput', { preselectedIndex: 1 })}>
          {referralsInputEntry}
        </motion.button>
      </section>
    </Screen>
  );
}

const referralsInputEntry = 'Have a referral code? Enter it here';
