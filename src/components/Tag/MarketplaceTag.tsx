import type { CSSProperties } from 'react';
import pillExpress from '@assets/marketplace/pill-express.svg';
import pillFood from '@assets/marketplace/pill-food.svg';
import supermallMall from '@assets/marketplace/supermall-mall.svg';
import supermallSuper from '@assets/marketplace/supermall-super.svg';
import marketIcon from '@assets/marketplace/market-icon.svg';
import marketText from '@assets/marketplace/market-text.svg';
import globalContent from '@assets/marketplace/global-content.svg';
import minutesText from '@assets/marketplace/minutes-text.svg';
import logoSupermall from '@assets/marketplace/logo-supermall.svg';
import logoFood from '@assets/marketplace/logo-food.svg';
import logoMinutes from '@assets/marketplace/logo-minutes.svg';
import logoNoon from '@assets/marketplace/logo-noon.svg';
import { radius, ref } from '../../foundations/tokens';

export type MarketplacePill = 'express' | 'supermall' | 'market' | 'global' | 'food' | 'minutes';
export type MarketplaceLogo = 'supermall' | 'food' | 'minutes' | 'noon';

type Layer = { src: string; x: number; y: number; w: number; h: number };

/**
 * Figma "Kids-Side" → Logos → MarketplaceTagsPills/* (60×18, fully rounded). Layer boxes are the auto-layout
 * results of each component (padding / gap / centring) so the composed pills render exactly as in Figma.
 * Token exception: the x / y / w / h layer boxes and the 60×18 artboard are Figma geometry, not spacing — kept literal.
 * Pill fills are palette tokens.
 */
const PILLS: Record<MarketplacePill, { bg?: string; layers: Layer[] }> = {
  express: { layers: [{ src: pillExpress, x: 0, y: 0, w: 60, h: 18 }] },
  food: { layers: [{ src: pillFood, x: 0, y: 0, w: 60, h: 18 }] },
  supermall: {
    bg: ref.palette('rocketBlueSapphire'),
    layers: [
      { src: supermallMall, x: 4.875, y: 6.325, w: 28.466, h: 8.629 },
      { src: supermallSuper, x: 33.955, y: 4.045, w: 20.171, h: 8.561 },
    ],
  },
  market: {
    bg: ref.palette('kitLime83'),
    layers: [
      { src: marketIcon, x: 7.14, y: 4.9, w: 8.557, h: 8.197 },
      { src: marketText, x: 18.889, y: 5.366, w: 34.654, h: 7.267 },
    ],
  },
  global: { bg: ref.palette('kitViolet93'), layers: [{ src: globalContent, x: 7.694, y: 2.531, w: 44.612, h: 12.938 }] },
  minutes: { bg: ref.palette('kitRed49'), layers: [{ src: minutesText, x: 7, y: 5.652, w: 46, h: 6.695 }] },
};

const LOGOS: Record<MarketplaceLogo, { src: string; w: number }> = {
  supermall: { src: logoSupermall, w: 54.162 },
  food: { src: logoFood, w: 43.207 },
  minutes: { src: logoMinutes, w: 53.901 },
  noon: { src: logoNoon, w: 47.203 },
};

/** Marketplace pill (express, supermall, market, global, food, minutes). `height` scales the 60×18 artwork. */
export function MarketplaceTag({ kind, height = 18, style }: { kind: MarketplacePill; height?: number; style?: CSSProperties }) {
  const pill = PILLS[kind];
  const s = height / 18;
  return (
    <span role="img" aria-label={kind} style={{ display: 'inline-block', position: 'relative', flexShrink: 0, width: 60 * s, height, ...style }}>
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 60,
          height: 18,
          borderRadius: radius.full,
          background: pill.bg,
          overflow: 'hidden',
          transform: s !== 1 ? `scale(${s})` : undefined,
          transformOrigin: '0 0',
        }}
      >
        {pill.layers.map((l) => (
          <img key={l.src} src={l.src} alt="" draggable={false} style={{ position: 'absolute', left: l.x, top: l.y, width: l.w, height: l.h, maxWidth: 'none', display: 'block' }} />
        ))}
      </span>
    </span>
  );
}

/** Marketplace wordmark (supermall, food, minutes, noon), 12px tall in Figma; `height` scales it. */
export function MarketplaceWordmark({ kind, height = 12, style }: { kind: MarketplaceLogo; height?: number; style?: CSSProperties }) {
  const logo = LOGOS[kind];
  return <img src={logo.src} alt={kind} draggable={false} style={{ display: 'block', flexShrink: 0, height, width: (logo.w * height) / 12, maxWidth: 'none', ...style }} />;
}
