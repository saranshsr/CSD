import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge, Pressable, SkuCard, Text } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { duration, easing } from '../../../motion/presets';
import muteIcon from '@assets/home/2025/brand/mute.svg';
import { brandAd } from '../data.modules';
import styles from './BrandAdModule.module.css';
import { useReduceMotion } from '../../../motion/reducedMotion';

/**
 * Sponsored brand module "SUMMER ESSENTIALS" (Figma 1337:6106): full-bleed dark gradient section, 418 tall. Brand header
 * (16 Bold +1 tracking uppercase title, 12 sub at 80% white, 56×20 brand logo) with an "Ad" tag at the top-right corner,
 * then a 134×308 r8 video tile (poster image; a muted looping <video> when `brandAd.video` is set) and the SKU rail.
 */
export function BrandAdModule() {
  const nav = useNav();
  const [muted, setMuted] = useState(true);
  // reduced motion: the video doesn't autoplay (its poster shows)
  const reduce = useReduceMotion();
  const openBrand = () => nav.push('plp/listing', { query: brandAd.query });
  return (
    <section className={styles.module} aria-label={`${brandAd.title}, sponsored`}>
      <span className={styles.ad}>
        <Badge bg="var(--nk-color-home-brand-ad-bg)" color={ref.color('borderStrong')}>
          Ad
        </Badge>
      </span>
      <Pressable className={styles.header} onClick={openBrand} scale={1}>
        <span className={styles.headerCopy}>
          <Text variant="text16BoldLh20" color="textInverse" className={styles.title}>
            {brandAd.title}
          </Text>
          <Text variant="text12RegularLh14" color="var(--nk-palette-white-alpha80)">
            {brandAd.sub}
          </Text>
        </span>
        <img loading="lazy" decoding="async" className={styles.logo} src={brandAd.logo} alt={brandAd.logoAlt} width={56} height={20} />
      </Pressable>
      <div className={styles.row}>
        <Pressable className={styles.video} onClick={openBrand} scale={0.98} aria-label={`${brandAd.logoAlt} video`}>
          {brandAd.video ? (
            <video className={styles.media} src={brandAd.video} poster={brandAd.poster} muted={muted} autoPlay={!reduce} loop playsInline />
          ) : (
            <img loading="lazy" decoding="async" className={styles.media} src={brandAd.poster} alt="" draggable={false} />
          )}
        </Pressable>
        <button
          type="button"
          className={styles.mute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={!muted}
          onClick={() => setMuted((m) => !m)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={muted ? 'muted' : 'sound'}
              src={muteIcon}
              alt=""
              width={20}
              height={21}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: muted ? 1 : 0.5 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: duration.fast, ease: easing.out }}
            />
          </AnimatePresence>
        </button>
        <div className={`nk-hscroll ${styles.rail}`}>
          {brandAd.products.map((p) => {
            const c = brandAd.cards[p.id];
            return <SkuCard key={p.id} product={p} badge={null} deliveryNote={brandAd.deliveryNote} fulfilment={c?.fulfilment} imageSize={c?.imageSize} sponsored={c?.sponsored} />;
          })}
        </div>
      </div>
    </section>
  );
}
