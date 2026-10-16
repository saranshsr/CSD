import type { CSSProperties } from 'react';
import type { Product } from '../../data';
import { ref } from '../../foundations/tokens';

/**
 * Product media placeholder. Renders `product.image` if set, otherwise a tinted tile with the
 * product emoji — so prototypes look complete with zero assets. 2% black overlay like the app.
 */
export function ProductImage({
  product,
  width = '100%',
  height,
  aspect,
  radius = 0,
  emojiScale = 0.42,
  style,
  dim,
  fit = 'contain',
}: {
  product: Pick<Product, 'emoji' | 'tint' | 'image' | 'title'>;
  width?: number | string;
  height?: number | string;
  /** width / height, e.g. 0.8 for PLP card, 1/1.2 for PDP gallery */
  aspect?: number;
  radius?: number;
  emojiScale?: number;
  style?: CSSProperties;
  dim?: boolean;
  /** object-fit of `product.image` (bappzaar `resizeMode`); default `contain` */
  fit?: 'contain' | 'cover';
}) {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        aspectRatio: height ? undefined : aspect,
        borderRadius: radius,
        overflow: 'hidden',
        background: product.image ? ref.color('bgSurface') : `radial-gradient(120% 90% at 50% 35%, ${ref.color('bgSurface')} 0%, ${product.tint} 70%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        opacity: dim ? 0.6 : 1,
        containerType: 'size',
        ...style,
      }}
    >
      {product.image ? (
        <img src={product.image} alt={product.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: fit }} />
      ) : (
        <span style={{ fontSize: `min(${Math.round(emojiScale * 100)}cqh, ${Math.round(emojiScale * 110)}cqw)`, lineHeight: 1, filter: `drop-shadow(0 8px 10px ${ref.palette('blackAlpha12')})` }} role="img" aria-label={product.title}>
          {product.emoji}
        </span>
      )}
      <div style={{ position: 'absolute', inset: 0, background: ref.color('imageOverlay'), pointerEvents: 'none' }} />
    </div>
  );
}
