import type { CSSProperties, ReactNode } from 'react';
import { Skeleton } from '../../../components';
import chevronBlueGray from '@assets/checkout/rewards-chevron-blue-gray.webp';
import retryIcon from '@assets/checkout/rewards-retry.svg';
import { checkoutServerColors } from '../tokens';
import { CheckoutTag } from './CheckoutTag';
import styles from './rewards.module.css';

/**
 * Small building blocks shared by the rewards components (burn / earn / installation / coupon status).
 */

/* ───────── HtmlView: server strings with <b>, <highlight>, <p> … tags ───────── */

type TagStyles = Record<string, CSSProperties>;

/** Minimal HtmlView: renders `<tag>…</tag>` segments with the given per-tag stylesheet (unknown tags inherit). */
export function RichText({ value, stylesheet = {}, className, style }: { value?: string | null; stylesheet?: TagStyles; className?: string; style?: CSSProperties }) {
  if (!value) return null;
  const parts = value.split(/(<\/?[a-z0-9]+>)/gi).filter(Boolean);
  const stack: string[] = [];
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    const m = part.match(/^<(\/?)([a-z0-9]+)>$/i);
    if (m) {
      if (m[1]) stack.pop();
      else stack.push(m[2].toLowerCase());
      return;
    }
    const css = stack.reduce<CSSProperties>((acc, tag) => ({ ...acc, ...(tag === 'b' || tag === 'strong' ? { fontWeight: 700 } : null), ...stylesheet[tag] }), {});
    out.push(
      <span key={i} style={css}>
        {part.replace(/&nbsp;/g, ' ')}
      </span>,
    );
  });
  return (
    <span className={className} style={{ ...stylesheet.p, ...style }}>
      {out}
    </span>
  );
}

/* ───────── Provider logos (CDN images in the app → neutral wordmarks here) ───────── */

const sc = checkoutServerColors;
const brands: Record<string, { name: string; color: string; ink: string; italic?: boolean }> = {
  mokafaa: { name: 'mokafaa', color: sc.mokafaaBlue, ink: sc.white },
  quara: { name: 'QUARA', color: sc.quaraViolet, ink: sc.white },
  emkan: { name: 'EMKAN', color: sc.emkanNavy, ink: sc.white },
  qitaf: { name: 'qitaf', color: sc.qitafPurple, ink: sc.white },
  tamam: { name: 'tamam', color: sc.tamamYellow, ink: sc.white },
  share: { name: 'SHARE', color: sc.shareViolet, ink: sc.white },
  skywards: { name: 'Skywards', color: sc.skywardsInk, ink: sc.skywardsLogoInk, italic: true },
  yougotagift: { name: 'YOUGotaGift', color: sc.yougotagiftPink, ink: sc.white },
  flex: { name: 'flex', color: sc.flexBlue, ink: sc.white },
  giftplus: { name: 'Gift+', color: sc.giftplusGreen, ink: sc.white },
  earn: { name: 'pts', color: sc.earnGreen, ink: sc.white },
};

export type LogoVariant = 'checkout' | 'expanded' | 'rounded' | 'mini' | 'toast' | 'page' | 'icon';

/**
 * `icons.checkout` (collapsed 70×26 / expanded 45×45), `icons.rounded` (30 circle), `icons.mini` (40×15),
 * `icons.toast` (39×26), page `icon` (130×58), earn `icon` (38×24).
 */
export function ProviderLogo({ logo, variant, style }: { logo: string; variant: LogoVariant; style?: CSSProperties }) {
  const b = brands[logo] ?? { name: logo, color: sc.neutralLogo, ink: sc.white };
  const fit = (base: number, width: number) => Math.min(base, Math.floor(width / (b.name.length * 0.62)));
  const font = (size: number, weight = 800): CSSProperties => ({ font: `${b.italic ? 'italic ' : ''}${weight} ${size}px/1 var(--nk-font-family)`, letterSpacing: -0.2 });
  switch (variant) {
    case 'checkout':
      return (
        <span className={styles.logoWordmark} style={{ width: '100%', maxWidth: 70, height: 26, color: b.color === sc.skywardsInk ? b.ink : b.color, ...font(fit(15, 66)), ...style }}>
          {b.name}
        </span>
      );
    case 'mini':
      return (
        <span className={styles.logoWordmark} style={{ width: 40, height: 15, color: b.color === sc.skywardsInk ? b.ink : b.color, ...font(fit(10, 40)), ...style }}>
          {b.name}
        </span>
      );
    case 'page':
      return (
        <span className={styles.logoWordmark} style={{ width: 130, height: 58, color: b.color === sc.skywardsInk ? b.ink : b.color, ...font(fit(28, 126)), ...style }}>
          {b.name}
        </span>
      );
    case 'rounded':
      return (
        <span className={styles.logoBadge} style={{ width: 30, height: 30, borderRadius: 15, background: b.color, color: b.ink, ...font(12), ...style }}>
          {b.name.charAt(0)}
        </span>
      );
    case 'expanded':
      return (
        <span className={styles.logoBadge} style={{ width: 45, height: 45, background: b.color, color: b.ink, ...font(b.name.length > 6 ? 8 : 11), ...style }}>
          {b.name}
        </span>
      );
    case 'toast':
      return (
        <span className={styles.logoBadge} style={{ width: 39, height: 26, borderRadius: 4, background: b.color, color: b.ink, ...font(b.name.length > 6 ? 6 : 9), ...style }}>
          {b.name}
        </span>
      );
    case 'icon':
    default:
      return (
        <span className={styles.logoBadge} style={{ width: 38, height: 24, background: b.color, color: b.ink, ...font(b.name.length > 6 ? 6 : 9), ...style }}>
          {b.name}
        </span>
      );
  }
}

/* ───────── NoonCheckoutTag (shared with payment methods) ───────── */

export function ProviderTag({ tag }: { tag: { message: string; background: { colors: string[] } } }) {
  return <CheckoutTag tag={{ message: tag.message, colors: tag.background.colors }} />;
}

/* ───────── NoonCheckoutProviderCallout ───────── */

export interface CalloutProvider {
  code: string;
  title: string;
  description: string | null;
  isDisabled: boolean;
  tag: { message: string; background: { colors: string[] } } | null;
  logo: string;
}

export function ProviderCallout({ provider, onPress, isExpanded = false, isLoading = false }: { provider: CalloutProvider; onPress?: () => void; isExpanded?: boolean; isLoading?: boolean }) {
  if (isLoading) return <Skeleton height={isExpanded ? 51 : 44} radius={8} style={{ flex: 1, background: 'linear-gradient(90deg, var(--nk-color-bg-muted) 0px, var(--nk-palette-skeleton-gray) 60px, var(--nk-color-bg-muted) 120px) var(--nk-color-bg-muted)', backgroundSize: '400px 100%' }} />;
  return (
    <div className={isExpanded ? styles.calloutWrapperExpanded : styles.calloutWrapper}>
      {provider.tag ? <ProviderTag tag={provider.tag} /> : null}
      <button
        type="button"
        className={`${styles.callout} ${isExpanded ? styles.calloutExpanded : ''} ${provider.isDisabled ? styles.disabled : ''}`}
        onClick={onPress}
        disabled={provider.isDisabled}
      >
        <span className={isExpanded ? styles.logoExpandedContainer : styles.logoCollapsedContainer}>
          <ProviderLogo logo={provider.logo} variant={isExpanded ? 'expanded' : 'checkout'} />
        </span>
        {isExpanded && (
          <span className={styles.calloutInfo}>
            <span className={styles.calloutTitle}>{provider.title}</span>
            {provider.description ? <RichText value={provider.description} className={styles.calloutDescription} /> : null}
          </span>
        )}
        <ChevronDot />
      </button>
    </div>
  );
}

/** 14×14 newBorderColor circle with the 4×7 chevronBlueGray (icons.chevron / chevronBlueGray). */
export function ChevronDot() {
  return (
    <span className={styles.chevronDot}>
      <img className={styles.chevronDotIcon} src={chevronBlueGray} alt="" />
    </span>
  );
}

/* ───────── NoonCheckoutProviderInfoEditButton ───────── */

export function InfoEditButton({ text, onPress, color, disabled, style }: { text: string; onPress: () => void; color: string; disabled?: boolean; style?: CSSProperties }) {
  return (
    <button type="button" className={styles.infoEdit} onClick={onPress} disabled={disabled} style={style}>
      <span className={styles.infoEditGradient} style={{ background: `linear-gradient(90deg, ${color}33, ${color}00)` }}>
        <span className={styles.infoEditText}>{text}</span>
        <EditIcon stroke={color} />
      </span>
    </button>
  );
}

/** icons.checkoutProviderEdit (assets/icons/edit.svg, stroke from props) */
export function EditIcon({ stroke }: { stroke: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M8.43084 2.24334L9.27459 1.39959C9.6407 1.03347 10.2343 1.03347 10.6004 1.39959C10.9665 1.7657 10.9665 2.3593 10.6004 2.72541L5.29109 8.03473C5.02675 8.29907 4.70072 8.49338 4.34244 8.60011L3 9L3.39989 7.65756C3.50661 7.29929 3.70092 6.97325 3.96526 6.70891L8.43084 2.24334ZM8.43084 2.24334L9.75 3.5625M9 7V9.375C9 9.99632 8.49632 10.5 7.875 10.5H2.625C2.00368 10.5 1.5 9.99632 1.5 9.375V4.125C1.5 3.50368 2.00368 3 2.625 3H5"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** icons.retry (currentColor svg) tinted via mask */
export function RetryIcon({ color }: { color: string }) {
  return <span className={styles.mask} style={{ width: 16, height: 16, background: color, WebkitMaskImage: `url(${retryIcon})`, maskImage: `url(${retryIcon})` }} />;
}

/** NoonCheckoutProviderCrescent: 250×70 arc stroked with a faded gradient of the provider colour */
export function Crescent({ color, style }: { color: string; style?: CSSProperties }) {
  const id = `crescent-${color.replace('#', '')}`;
  return (
    <svg width={250} height={70} viewBox="0 0 250 70" style={style} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0} />
          <stop offset="20%" stopColor={color} stopOpacity={0.3} />
          <stop offset="80%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d="M 0 0 A 130 70 0 0 0 250 0" fill="none" stroke={`url(#${id})`} strokeWidth={1} />
    </svg>
  );
}

