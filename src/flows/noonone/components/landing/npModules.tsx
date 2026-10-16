import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import circleBg from '@assets/noonone/landing-np/icon-circle.svg';
import couponA from '@assets/noonone/landing-np/coupon-a.svg';
import couponB from '@assets/noonone/landing-np/coupon-b.svg';
import couponC from '@assets/noonone/landing-np/coupon-c.svg';
import couponD from '@assets/noonone/landing-np/coupon-d.svg';
import fabLogoA from '@assets/noonone/landing-np/fab-logo-a.svg';
import fabLogoB from '@assets/noonone/landing-np/fab-logo-b.svg';
import gift from '@assets/noonone/landing-np/gift.svg';
import headphone from '@assets/noonone/landing-np/headphone.svg';
import illustration from '@assets/noonone/landing-np/hero-illustration.png';
import mpFood from '@assets/noonone/landing-np/mp-food.svg';
import mpNoon from '@assets/noonone/landing-np/mp-noon.svg';
import mpNownow from '@assets/noonone/landing-np/mp-nownow.svg';
import oneLogo from '@assets/noonone/landing-np/one-logo.png';
import osn from '@assets/noonone/landing-np/osn.svg';
import partnerBottom from '@assets/noonone/landing-np/partner-bottom.svg';
import partnerMask from '@assets/noonone/landing-np/partner-mask.svg';
import texA from '@assets/noonone/landing-np/partner-tex-a.png';
import texB from '@assets/noonone/landing-np/partner-tex-b.png';
import texStc from '@assets/noonone/landing-np/partner-tex-stc.png';
import topFab from '@assets/noonone/landing-np/partner-top-fab.svg';
import topStc from '@assets/noonone/landing-np/partner-top-stc.svg';
import separator from '@assets/noonone/landing-np/separator.svg';
import star from '@assets/noonone/landing-np/star.svg';
import stcLogo from '@assets/noonone/landing-np/stc-logo.svg';
import streamOsn from '@assets/noonone/landing-np/stream-osn.svg';
import tileFood from '@assets/noonone/landing-np/tile-food.svg';
import tileMinutes from '@assets/noonone/landing-np/tile-minutes.png';
import tileNoon from '@assets/noonone/landing-np/tile-noon.svg';
import tileNownow from '@assets/noonone/landing-np/tile-nownow.svg';
import tileSupermallA from '@assets/noonone/landing-np/tile-supermall-a.svg';
import tileSupermallB from '@assets/noonone/landing-np/tile-supermall-b.svg';
import vipGift from '@assets/vip/gift.svg';
import vipSparkle from '@assets/vip/star.svg';
import { HtmlText, MaskIcon, OriginIcon, Pressable } from '../../../../components';
import { Stagger } from '../../../../motion/recipes';
import { useNav } from '../../../../kit/Navigator';
import type { FlyoutData, NpAction, NpModule, NpOfferData, NpMpBenefit, NpPartnerBanner, NpTileId, NpValueProp, NpVideoBanner } from '../../data.landing';
import { landingNpTokens as N, landingTokens as T } from '../../tokens';
import { VIPButton } from '../VIPButton';
import { SavingsOverviewModule, Slider } from './modules';
import { DashedLine } from './DashedLine';
import { Flyout, SubscriptionButton } from './StickyFooter';
import landingStyles from './landing.module.css';
import styles from './np.module.css';
import { useReduceMotion } from '../../../../motion/reducedMotion';

/**
 * Non-member landing (prod, Figma Af34gfmhQ1D0wstXUEHSIF · 24:2604). One component per CMS module; behaviour from the
 * bappzaar VIP modules named on each, visuals from the frame. Rendered in order by NpModuleRenderer.
 */

type Box = { w: number; h: number; dx: number; dy?: number } | { inset: string };
const boxStyle = (b: Box): CSSProperties =>
  'inset' in b ? { position: 'absolute', inset: b.inset } : { position: 'absolute', left: `calc(50% - ${b.w / 2}px + ${b.dx}px)`, top: `calc(50% - ${b.h / 2}px + ${b.dy ?? 0}px)`, width: b.w, height: b.h };

// an <img> does not stretch to `inset`, so inset boxes get a wrapper and a 100% image
const art = (src: string, b: Box) =>
  'inset' in b ? (
    <span style={boxStyle(b)}>
      <img src={src} alt="" style={{ display: 'block', width: '100%', height: '100%' }} draggable={false} />
    </span>
  ) : (
    <img src={src} alt="" style={boxStyle(b)} draggable={false} />
  );

/** Savings-widget marketplace tile (Figma "Marketplaces" component), drawn at the 80px centre size. */
function Tile({ id }: { id: NpTileId }) {
  const t = N.tiles;
  return (
    <div className={`${styles.tile} ${styles[`tile_${id}`]}`}>
      {id === 'noon' && art(tileNoon, t.noon)}
      {id === 'food' && art(tileFood, t.food)}
      {id === 'nownow' && art(tileNownow, t.nownow)}
      {id === 'minutes' && <img src={tileMinutes} alt="" className={styles.tileMinutes} style={boxStyle(t.minutes)} draggable={false} />}
      {id === 'supermall' && (
        <>
          {art(tileSupermallA, t.supermallA)}
          {art(tileSupermallB, t.supermallB)}
        </>
      )}
    </div>
  );
}

/** Value-prop marketplace circle (35px, overlapping). */
function MpCircle({ id }: { id: NpTileId }) {
  const c = N.circles;
  return (
    <div className={`${styles.mpCircle} ${styles[`mp_${id}`]}`}>
      {id === 'noon' && art(mpNoon, c.noon)}
      {id === 'food' && art(mpFood, c.food)}
      {id === 'nownow' && art(mpNownow, c.nownow)}
      {id === 'minutes' && <img src={tileMinutes} alt="" className={styles.mpMinutes} style={boxStyle(c.minutes)} draggable={false} />}
      {id === 'supermall' && (
        <>
          {art(tileSupermallA, c.supermallA)}
          {art(tileSupermallB, c.supermallB)}
        </>
      )}
    </div>
  );
}

const glyphSrc = { gift: [gift], osn: [osn], coupon: [couponB, couponA, couponC, couponD] } as const;

function IconCircle({ icon }: { icon: NonNullable<NpValueProp['icon']> }) {
  return (
    <div className={styles.iconCircle}>
      <img className={styles.iconCircleBg} src={circleBg} alt="" />
      {N.glyphs[icon].map(([x, y, w, h], i) => (
        <img key={i} src={glyphSrc[icon][i]} alt="" style={{ position: 'absolute', left: x, top: y, width: w, height: h }} />
      ))}
    </div>
  );
}

/** VIPMembershipOverviewModule — showDefault (non-member): One logo, vip_one_landing_title, illustration, subtitle. */
export function NpOverviewModule({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={styles.header}>
      <Stagger className={styles.headerCol} gap={0.06} y={10}>
        <img className={styles.logo} src={oneLogo} alt="noon One" />
        <span className={styles.title}>{title}</span>
        <img className={styles.illustration} src={illustration} alt="" />
        <span className={styles.subtitle}>{subtitle}</span>
      </Stagger>
    </div>
  );
}

/** VIPBenefitsModule (leadingIconUrl sparkle, iconUrl / mpIcons, dashed VIPDashedBorder) + priority-support strip. */
export function NpBenefitsModule({ benefits, footer }: { benefits: NpValueProp[]; footer: { text: string } }) {
  return (
    <div className={styles.valueProps}>
      <div className={styles.vpRows}>
        {benefits.map((b, i) => (
          <div key={i}>
            <div className={styles.vpRow}>
              <div className={styles.vpLead}>
                <span className={styles.star}>
                  <img src={star} alt="" />
                </span>
                <div className={styles.vpText}>
                  <span className={styles.vpTitle}>{b.title}</span>
                  <span className={styles.vpDesc}>{b.description}</span>
                </div>
              </div>
              {b.mpIcons ? (
                <div className={styles.mpRow}>
                  {b.mpIcons.map((id) => (
                    <MpCircle key={id} id={id} />
                  ))}
                </div>
              ) : b.icon ? (
                <IconCircle icon={b.icon} />
              ) : null}
            </div>
            <img className={styles.separator} src={separator} alt="" />
          </div>
        ))}
      </div>
      <div className={styles.support}>
        <img className={styles.supportIcon} src={headphone} alt="" />
        <span className={styles.supportText}>{footer.text}</span>
      </div>
    </div>
  );
}

/** VIPMarketplaceBenefitsCarouselModule → VIPSlider (slideWidth 80, scaleFactor .5, autoplay 3.5s, swipe). */
export function NpSavingsModule({ mpId, mpBenefits }: { mpId: NpTileId; mpBenefits: NpMpBenefit[] }) {
  // highlighted marketplace first (context.currentMarketplace / mpId), the rest in CMS order
  const sorted = [...mpBenefits.filter((m) => m.id === mpId), ...mpBenefits.filter((m) => m.id !== mpId)];
  const { centre, scale, gap } = N.savingsSlider;
  const small = centre * scale;
  const first = centre / 2 + gap + small / 2;
  const step = small + gap;
  // Figma spacing: 26px between tile edges whatever their scale
  const offset = (u: number) => {
    const a = Math.abs(u);
    return Math.sign(u) * (a <= 1 ? a * first : first + (a - 1) * step);
  };
  return (
    <div className={styles.savings}>
      <Slider
        views={sorted.map((m) => (
          <Tile key={m.id} id={m.id} />
        ))}
        labels={sorted.map((m) => (
          <>
            <span className={styles.savingsTitle}>{m.title}</span>
            <span className={styles.savingsSub}>{m.subtitle}</span>
          </>
        ))}
        offset={offset}
        labelHeight={T.slider.labelHeight}
        labelsClassName={styles.savingsLabels}
        labelClassName={styles.savingsLabel}
      />
    </div>
  );
}

/** VIPVideoCarouselModule: slide-size scrolling, muted looping video on the selected card, PageControl, CTA. */
export function NpVideoCarouselModule({ banners, onCta }: { banners: NpVideoBanner[]; onCta: (cta: string) => void }) {
  const [selected, setSelected] = useState(0);
  const step = N.video.cardW + N.video.gap;
  return (
    <div className={styles.videoScroll} onScroll={(e) => setSelected(Math.max(0, Math.min(banners.length - 1, Math.round(e.currentTarget.scrollLeft / step))))}>
      {banners.map((b, i) => (
        <VideoCard key={i} banner={b} isSelected={selected === i} index={i} count={banners.length} onCta={onCta} />
      ))}
    </div>
  );
}

function VideoCard({ banner, isSelected, index, count, onCta }: { banner: NpVideoBanner; isSelected: boolean; index: number; count: number; onCta: (cta: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  // reduced motion: the video doesn't autoplay (its poster shows)
  const reduce = useReduceMotion();
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (isSelected && !reduce) void v.play().catch(() => {});
    else v.pause();
  }, [isSelected, reduce]);
  return (
    <div className={styles.videoCard}>
      {banner.videoUrl || banner.placeholderUrl ? (
        <video ref={video} className={styles.video} src={banner.videoUrl} poster={banner.placeholderUrl} muted loop playsInline />
      ) : (
        // demo stand-in for the CMS video / placeholderUrl (the frame's slot is an empty "Replace this" layer)
        <div className={styles.poster}>
          <img className={styles.posterLogo} src={streamOsn} alt="" />
        </div>
      )}
      <div className={styles.videoTop}>
        <div className={styles.videoTopText}>
          <span className={styles.videoTitle}>{banner.title}</span>
          <span className={styles.videoSub}>{banner.subTitle}</span>
        </div>
        <img className={styles.videoLogo} src={streamOsn} alt="OSN+" />
      </div>
      <div className={styles.videoBottomShade} />
      <div className={styles.videoBottom}>
        {count > 1 && (
          <div className={styles.dots} aria-hidden>
            {Array.from({ length: count }, (_, k) => (
              <span key={k} className={k === index ? styles.dotActive : styles.dot} />
            ))}
          </div>
        )}
        <VIPButton className={styles.videoCta} textClassName={styles.videoCtaText} title={banner.buttonText} onPress={() => onCta(banner.cta)} />
      </div>
    </div>
  );
}

const texSrc = { a: texA, b: texB, stc: texStc } as const;

function PartnerCard({ banner, onPress }: { banner: NpPartnerBanner; onPress: () => void }) {
  const P = N.partnerTex;
  const textures = banner.id === 'fab' ? P.fab : P.stc;
  const logos = banner.id === 'fab' ? P.fabLogo.map((b, i) => [i ? fabLogoB : fabLogoA, b] as const) : P.stcLogo.map((b) => [stcLogo, b] as const);
  return (
    <Pressable className={styles.partner} scale={0.98} onClick={onPress} aria-label={banner.title.join(' ')}>
      <img className={styles.partnerTop} src={banner.id === 'fab' ? topFab : topStc} alt="" />
      <div className={`${styles.partnerTex} ${banner.id === 'stc' ? styles.partnerTexStc : ''}`} style={{ maskImage: `url("${partnerMask}")`, WebkitMaskImage: `url("${partnerMask}")` }}>
        {textures.map((t, i) => (
          <div key={i} className={styles.texBox} style={{ left: t.left, top: t.top, width: t.w, height: t.h }}>
            <img src={texSrc[t.tex]} alt="" style={{ width: t.iw, height: t.ih, opacity: t.opacity, transform: `rotate(${t.rot}deg)` }} />
          </div>
        ))}
      </div>
      {logos.map(([src, [x, y, w, h]], i) => (
        <img key={i} src={src} alt="" style={{ position: 'absolute', left: x, top: y, width: w, height: h }} />
      ))}
      <img className={styles.partnerBottom} src={partnerBottom} alt="" />
      <span className={styles.duration}>{banner.durationText}</span>
      <div className={styles.partnerFoot}>
        <span className={styles.partnerTitle}>
          {banner.title[0]}
          <br />
          {banner.title[1]}
        </span>
        <span className={styles.viewNow}>
          <span className={styles.viewNowText}>{banner.buttonText}</span>
          <OriginIcon name="chevron-right" size={17} color="var(--nk-palette-white)" />
        </span>
      </div>
    </Pressable>
  );
}

/** VIPBannerCarouselModule (title + horizontal banner list, tap → linkUrl). */
export function NpPartnersModule({ title, banners, onAction }: { title: string; banners: NpPartnerBanner[]; onAction: (a: NpAction) => void }) {
  return (
    <div className={styles.partners}>
      <span className={styles.sectionTitle}>{title}</span>
      <div className={styles.partnerRow}>
        {banners.map((b) => (
          <PartnerCard key={b.id} banner={b} onPress={() => onAction(b.action)} />
        ))}
      </div>
    </div>
  );
}

/** "Have a coupon code?" → VIPOffersOverlayScreen (VIPUtil.showReferralsInputOverlay, voucher tab). */
export function NpCouponModule({ title, actionText, onPress }: { title: string; actionText: string; onPress: () => void }) {
  return (
    <Pressable className={styles.coupon} scale={0.99} onClick={onPress}>
      <span className={styles.couponTitle}>{title}</span>
      <span className={styles.couponAction}>{actionText}</span>
    </Pressable>
  );
}

/** VIPExpandableTextModule variant "grouped": collapsible title, rows start collapsed, 300ms expand, chevron −180°. */
export function NpFaqModule({ title, collapsible, rows }: { title: string; collapsible: boolean; rows: { header: string; body: string }[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const { ms, chevronEase, layoutEase } = T.expand;
  const t = { duration: ms / 1000, ease: layoutEase };
  return (
    <div className={styles.faq}>
      <button type="button" className={`nk-pressable ${styles.faqTitleRow}`} disabled={!collapsible} onClick={() => setCollapsed((c) => !c)}>
        <span className={styles.faqTitle}>{title}</span>
        <motion.span className={styles.chevron} animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: ms / 1000, ease: chevronEase }}>
          <OriginIcon name="chevron-down" size={20} color="var(--nk-color-vip-np-chevron)" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div className={styles.faqList} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: ms / 1000, ease: chevronEase }}>
            {rows.map((r, i) => (
              <button key={i} type="button" className={`nk-pressable ${styles.faqRow}`} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} aria-expanded={!!open[i]}>
                <span className={styles.faqHeaderRow}>
                  <span className={styles.faqHeader}>{r.header}</span>
                  <motion.span className={styles.chevron} animate={{ rotate: open[i] ? -180 : 0 }} transition={{ duration: ms / 1000, ease: chevronEase }}>
                    <OriginIcon name="chevron-down" size={20} color="var(--nk-color-vip-np-chevron)" />
                  </motion.span>
                </span>
                <AnimatePresence initial={false}>
                  {open[i] && (
                    <motion.span className={styles.faqBodyWrap} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={t}>
                      <span className={styles.faqBody}>{r.body}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** VIPOfferPlanModule: gradient-bordered card (200° / RTL 155°, stops 0 / .25), title html + right-hugging tag, dashed separator, subtitle row. */
export function NpOfferPlanModule({ offerData }: { offerData: NpOfferData }) {
  const { title, subtitle, borderColors, tag } = offerData;
  const [c0, c1] = borderColors;
  return (
    <div className={styles.offerBorder} style={{ background: `linear-gradient(var(--nk-np-offer-angle), ${c0} 0%, ${c1 ?? c0} 25%)` }}>
      <div className={styles.offer}>
        <div className={styles.offerTitleRow}>
          <HtmlText value={title} className={styles.offerTitle} />
          {tag.text && (
            <span className={styles.offerTagBorder} style={{ background: `linear-gradient(var(--nk-np-offer-tag-angle), ${tag.borderColors.join(', ')})` }}>
              <span className={styles.offerTag} style={{ background: tag.backgroundColor }}>
                <MaskIcon src={vipSparkle} size={14} color={tag.textColor} className={styles.offerTagIcon} />
                <HtmlText value={tag.text} className={styles.offerTagText} style={{ color: tag.textColor }} />
              </span>
            </span>
          )}
        </div>
        <img className={styles.offerDash} src={separator} alt="" />
        <div className={styles.offerSubRow}>
          <MaskIcon src={vipGift} size={18} color="var(--nk-color-best-price-ink)" className={styles.offerSubIcon} />
          <HtmlText value={subtitle} className={styles.offerSub} />
        </div>
      </div>
    </div>
  );
}

/** VIPModuleRenderer for the non-member landing: switch on module type, CTAs through ModuleHelper-style actions. */
export function NpModuleRenderer({ modules, onCreate }: { modules: NpModule[]; onCreate: () => void }) {
  const nav = useNav();
  const onAction = (a: NpAction) => ('cta' in a ? onCreate() : nav.push(a.route, a.params));
  return (
    <div className={styles.column}>
      {modules.map((m, i) => {
        switch (m.type) {
          case 'VIP_MEMBERSHIP_OVERVIEW_MODULE':
            return <NpOverviewModule key={i} title={m.title} subtitle={m.subtitle} />;
          case 'VIP_BENEFITS_MODULE':
            return <NpBenefitsModule key={i} benefits={m.benefits} footer={m.footer} />;
          case 'VIP_MARKETPLACE_BENEFITS_CAROUSEL_MODULE':
            return <NpSavingsModule key={i} mpId={m.mpId} mpBenefits={m.mpBenefits} />;
          case 'VIP_VIDEO_MODULE_CAROUSEL':
            return <NpVideoCarouselModule key={i} banners={m.banners} onCta={() => onCreate()} />;
          case 'VIP_BANNER_MODULE_CAROUSEL':
            return <NpPartnersModule key={i} title={m.title} banners={m.banners} onAction={onAction} />;
          case 'VIP_COUPON_ENTRY':
            return <NpCouponModule key={i} title={m.title} actionText={m.actionText} onPress={() => onAction(m.action)} />;
          case 'VIP_OFFER_PLAN_MODULE':
            return <NpOfferPlanModule key={i} offerData={m.offerData} />;
          case 'VIP_SAVINGS_BREAKDOWN_MODULE':
            return (
              <SavingsOverviewModule
                key={i}
                bare
                customerState={m.savingsData.customerState}
                title={m.savingsData.title}
                savingsText={m.savingsData.savingsText}
                multiplier={m.savingsData.savingsMultiplier}
                subtitle={m.savingsData.subtitle}
              />
            );
          case 'VIP_EXPANDABLE_TEXT_MODULE':
            return <NpFaqModule key={i} title={m.title} collapsible={m.collapsible} rows={m.rows} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

/** Bottom section 24:2745: VIPLandingScreen.renderStickyFooter ('/create' → VIPSubscriptionButtonV2), no flyout / view-plans link in prod. */
/**
 * VIPLandingScreen.renderStickyFooter, prod non-member: offerFlyout strip on top (the footer loses its top radius, the
 * flyout carries it) · the '/create' CTA (Figma 24:2745 styling) · dashed "View other plans" link (viewPlansButton).
 */
export function NpStickyFooter({
  subscription,
  flyout,
  onFlyout,
  viewPlansTitle,
  onViewPlans,
}: {
  subscription: Parameters<typeof SubscriptionButton>[0];
  flyout?: FlyoutData;
  onFlyout?: (url: string) => void;
  viewPlansTitle?: string;
  onViewPlans?: () => void;
}) {
  return (
    <div className={styles.footerWrap} data-flyout={flyout ? '' : undefined}>
      {flyout && <Flyout data={flyout} onNavigate={onFlyout} />}
      <div className={styles.footer}>
        <SubscriptionButton {...subscription} buttonClassName={styles.cta} buttonPayClassName={styles.ctaPay} textClassName={styles.ctaText} />
        {viewPlansTitle && onViewPlans && (
          <div className={landingStyles.viewPlansWrap}>
            <DashedLine className={landingStyles.viewPlansDash} strokeWidth={4} strokeSpacing={5} strokeHeight={1} color="var(--nk-color-text-body)" />
            <VIPButton className={landingStyles.viewPlans} textClassName={landingStyles.viewPlansText} title={viewPlansTitle} onPress={onViewPlans} />
          </div>
        )}
      </div>
    </div>
  );
}

/** VIPLandingScreen.renderHeader back button, prod size (40 circle, 1.25 #E3E3E3) with the Origin chevron. */
export function NpBackButton({ onBack }: { onBack: () => void }) {
  return (
    <Pressable className={styles.backButton} scale={1} whileTap={{ opacity: 0.2 }} onClick={onBack} aria-label="Back">
      <OriginIcon name="chevron-left" size={24} color="var(--nk-color-vip-np-text404040)" />
    </Pressable>
  );
}

export const npHeaderWrapperClass = styles.headerWrapper;
