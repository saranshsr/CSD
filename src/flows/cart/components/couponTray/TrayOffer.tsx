import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Button, Lottie, MaskIcon } from '../../../../components';
import { useReduceMotion } from '../../../../motion/recipes';
import iconDiscount from '@assets/cart/coupon-tray/coupon-tray-discount.webp';
import iconCashback from '@assets/cart/coupon-tray/coupon-tray-cashback.webp';
import iconBank from '@assets/cart/coupon-tray/coupon-tray-bank.webp';
import iconOne from '@assets/cart/coupon-tray/coupon-tray-one.webp';
import chevronDown from '@assets/icons/noon-chevron-down.webp';
import chevronThick from '@assets/cart/coupon-tray/chevron-thick.svg';
import applyLoader from '@assets/cart/coupon-tray/coupon-tray-apply-loader.lottie';
import { trayCopy, type TrayOffer as Offer } from '../../data.couponTray';
import { couponTrayMotion as M } from '../../tokens';
import { TiersProgressBar } from './TiersProgressBar';
import { UnlockCriteria } from './UnlockCriteria';
import styles from './tray.module.css';

export interface TrayOfferShared {
  onTnc: (offer: Offer) => void;
  onJoinOne: () => void;
  onShopMore: (offer: Offer) => void;
  /** an apply / remove is in flight somewhere in the tray */
  disabled: boolean;
  isMember: boolean;
  trialEligible: boolean;
}

const VISIBLE_LINES = 2;
const LINE = 18; // baseContentTextStyle lineHeight
const TOP = 12; // CONTENT_TOP_PADDING
const TNC = 24; // TNC_CONTAINER_HEIGHT

/** NoonSalesCouponTrayOfferAssets.getCouponTrayOfferAssets — how an offer's state, type and applied / expired flags look. */
function offerLook(offer: Offer, expired: boolean) {
  const locked = offer.state === 'locked';
  const hasCode = offer.code != null;
  const applied = Boolean(offer.isApplied);
  const look = {
    icon: offer.type === 'bank_discount_v2' ? iconBank : offer.promoType === 'cashback' ? iconCashback : iconDiscount,
    tint: locked ? 'var(--nk-palette-bluish-grey)' : null,
    iconBg: locked ? 'var(--nk-palette-anti-flash-white)' : 'var(--nk-palette-noon-success-subtle)',
    subtitle: hasCode ? (offer.code as string) : trayCopy.autoApplied,
    subtitleTone: hasCode ? (locked ? 'locked' : 'unlocked') : locked ? 'locked' : 'auto',
    button: { text: trayCopy.apply, fg: 'var(--nk-palette-deep-green)', border: 'var(--nk-palette-deep-green)', bold: !locked },
    oneCallout: locked ? ['var(--nk-palette-anti-flash-white)', 'var(--nk-color-bg-surface)'] : ['var(--nk-palette-noon-success-subtle)', 'transparent'],
  };
  if (locked) look.button = { text: trayCopy.apply, fg: 'var(--nk-palette-bluish-grey)', border: 'var(--nk-palette-light-grey-color)', bold: false };
  if (applied) look.button = { text: trayCopy.remove, fg: 'var(--nk-palette-blue-gray900)', border: 'var(--nk-palette-light-grey-color)', bold: false };
  if (expired) look.button = { text: trayCopy.expiredCta, fg: 'var(--nk-palette-bluish-grey)', border: 'var(--nk-palette-light-grey-color)', bold: false };
  return { ...look, locked };
}

const pad = (n: number) => String(n).padStart(2, '0');
/** Timer digitsOnly: HH:MM:SS until `iso`; calls onExpire once it passes */
function useCountdown(iso: string | null, onExpire: () => void) {
  const [left, setLeft] = useState(() => (iso ? new Date(iso).getTime() - Date.now() : 0));
  useEffect(() => {
    if (!iso) return;
    const id = window.setInterval(() => {
      const ms = new Date(iso).getTime() - Date.now();
      setLeft(ms);
      if (ms <= 0) {
        window.clearInterval(id);
        onExpire();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [iso, onExpire]);
  const s = Math.max(0, Math.floor(left / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/**
 * NoonSalesCouponTrayOffer — one coupon / bank / auto-applied offer card: expiry strip, header (icon, title, code or
 * "Automatically applies on checkout", noon One "exclusive" callout, Apply / Remove / Expired with the loader Lottie),
 * notched dashed separator, eligibility (tiers bar → unlock criteria → join One banner) and the 2-line text that
 * expands with the chevron, then "T&C Apply".
 */
export function TrayOffer({ offer, bestPrice, shared, loading, onApply, onRemove, className }: { offer: Offer; bestPrice: boolean; shared: TrayOfferShared; loading: boolean; onApply: (code: string) => void; onRemove: (code: string) => void; className?: string }) {
  const reduce = useReduceMotion();
  const [expired, setExpired] = useState(() => offer.expiryTime != null && new Date(offer.expiryTime).getTime() < Date.now());
  const [expanded, setExpanded] = useState(false);
  const [measure, setMeasure] = useState<{ collapsed: number; full: number; canExpand: boolean } | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const timer = useCountdown(expired ? null : offer.expiryTime, () => setExpired(true));
  const look = offerLook(offer, expired);
  const hasTnc = Boolean(offer.tncUrl);
  const text = [offer.header, offer.body].filter(Boolean).join(' ');

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const lines = Math.max(1, Math.round(el.getBoundingClientRect().height / LINE)); // measured unclamped (measure is null on this pass)
    const canExpand = lines > VISIBLE_LINES;
    setMeasure({ collapsed: Math.min(lines, VISIBLE_LINES) * LINE, full: lines * LINE, canExpand });
  }, [text]);

  const tnc = hasTnc ? TNC : 0;
  const height = measure ? (expanded ? measure.full + TOP + tnc : measure.collapsed + TOP + (measure.canExpand ? 0 : tnc)) : undefined;
  const showTnc = hasTnc && (!measure?.canExpand || expanded);
  const showButton = offer.type !== 'auto_applied_discount' && offer.code != null;

  const onHeaderButton = () => {
    if (!offer.code || expired || shared.disabled || loading || look.locked) return;
    if (offer.isApplied) onRemove(offer.code);
    else onApply(offer.code);
  };

  const eligibility = (() => {
    if (offer.tiersProgressBar?.tiers.length) return <TiersProgressBar bar={offer.tiersProgressBar} showAddProducts={offer.plpQuery != null} onAddProducts={() => shared.onShopMore(offer)} disabled={shared.disabled} />;
    if (offer.unlockCriteria) return <UnlockCriteria criteria={offer.unlockCriteria} showShopMore={offer.plpQuery != null} onShopMore={() => shared.onShopMore(offer)} disabled={shared.disabled} />;
    if (!shared.isMember && offer.validCustomerType === 'noon_one') {
      return (
        <div className={styles.joinBanner}>
          <span className={styles.joinBannerText}>{shared.trialEligible ? trayCopy.getOneFree : trayCopy.getOne}</span>
          <span className={styles.joinBannerAction}>
            <Button variant="noonDotted" dottedColor="var(--nk-palette-blue-gray900)" className={styles.dottedAction} disabled={shared.disabled} onClick={shared.onJoinOne}>
              {trayCopy.joinOne}
            </Button>
            <MaskIcon src={chevronThick} size={14} color={shared.disabled ? 'var(--nk-color-tray-blue-gray400)' : 'var(--nk-palette-blue-gray900)'} className="nk-flip-rtl" />
          </span>
        </div>
      );
    }
    return null;
  })();

  return (
    <div className={[styles.offer, className].filter(Boolean).join(' ')} data-testid="coupon-tray-offer" data-code={offer.code ?? undefined} data-state={offer.state}>
      {offer.expiryTime && (
        <div className={styles.expiry}>
          <span className={styles.expiryText}>{expired ? trayCopy.expired : trayCopy.endsIn}</span>
          {!expired && <span className={styles.expiryTimer}>{timer}</span>}
        </div>
      )}
      <div className={styles.offerHeader}>
        <div className={styles.offerHeaderContent}>
          <span className={styles.offerIcon} style={{ background: look.iconBg }}>
            {look.tint ? <MaskIcon src={look.icon} size={24} color={look.tint} /> : <img src={look.icon} width={24} height={24} alt="" />}
          </span>
          <span className={styles.offerHeaderText}>
            <span className={look.locked ? styles.offerTitleLocked : styles.offerTitle}>{offer.title}</span>
            <span className={styles.offerSubtitleRow}>
              <span className={styles[`subtitle_${look.subtitleTone}`]}>{look.subtitle}</span>
              {offer.validCustomerType === 'noon_one' && (
                <span className={styles.oneCallout} style={{ background: `linear-gradient(90deg, ${look.oneCallout[0]}, ${look.oneCallout[1]})` }}>
                  <img src={iconOne} width={22} height={18} alt="noon One" />
                  <span className={styles.oneCalloutText}>{trayCopy.exclusive}</span>
                </span>
              )}
            </span>
          </span>
        </div>
        {showButton && (
          <button
            type="button"
            className={styles.offerButton}
            style={{ borderColor: look.button.border, color: look.button.fg, fontWeight: look.button.bold ? 700 : 600 } as CSSProperties}
            disabled={shared.disabled || loading || expired || look.locked}
            onClick={onHeaderButton}
            aria-busy={loading || undefined}
          >
            {loading && !expired ? <Lottie src={applyLoader} loop size={30} /> : look.button.text}
          </button>
        )}
      </div>
      <div className={styles.separator} data-best-price={bestPrice || undefined}>
        <span className={styles.separatorLine} />
      </div>
      <div className={styles.offerBody}>
        {eligibility}
        {text && (
          <div className={styles.offerContent} style={{ height, transitionDuration: reduce ? '0s' : `${M.expandS}s` }}>
            <span ref={textRef} className={[styles.offerText, measure?.canExpand ? styles.offerTextWithChevron : ''].join(' ')} style={!expanded && measure?.canExpand ? { WebkitLineClamp: VISIBLE_LINES, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}>
              {text}
            </span>
            {measure?.canExpand && (
              <button type="button" className={styles.chevron} aria-expanded={expanded} aria-label={expanded ? 'Show less' : 'Show more'} disabled={shared.disabled} onClick={() => setExpanded((e) => !e)}>
                <motion.img src={chevronDown} width={12} height={12} alt="" animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: reduce ? 0 : M.expandS }} />
              </button>
            )}
            {hasTnc && (
              <motion.span className={styles.tnc} initial={false} animate={{ opacity: showTnc ? 1 : 0 }} transition={{ duration: reduce ? 0 : M.expandS, delay: expanded && !reduce ? M.expandS * 0.9 : 0 }}>
                <Button variant="noonDotted" dottedColor="var(--nk-palette-blue-gray900)" className={styles.tncButton} disabled={shared.disabled || !showTnc} onClick={() => shared.onTnc(offer)}>
                  {trayCopy.tnc}
                </Button>
              </motion.span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
