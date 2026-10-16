import { AnimatePresence, motion } from 'motion/react';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import { Icon } from '../Icon/Icon';
import { spring } from '../../motion/presets';
import { radius, ref } from '../../foundations/tokens';

/** NoonFavourite active heart (pink600) */
const heart = ref.palette('pink600');

/**
 * NoonFavourite: 24px heart in a white 70% circle. Pops to 1.25 when favouriting with a
 * particle burst (web stand-in for the favouriteAnimatedV2 lottie).
 */
export function WishlistHeart({ productId, size = 24, box: boxSize, variant = 'card', toast = true }: { productId: string; size?: number; /** circle diameter (card default `size + 4`); bappzaar NoonFavourite wrapper is 24 */ box?: number; variant?: 'card' | 'button'; toast?: boolean }) {
  const { isWishlisted, toggleWishlist } = useDemoStore();
  const nav = useNav();
  const on = isWishlisted(productId);
  const box = variant === 'button' ? 40 : (boxSize ?? size + 4);
  return (
    <motion.button
      type="button"
      aria-label={on ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={(e) => {
        e.stopPropagation();
        const added = toggleWishlist(productId);
        if (toast) nav.toast(added ? 'Added to Wishlist' : 'Removed from Wishlist', { icon: <Icon name="heart" size={18} fill={added ? ref.color('textInverse') : 'none'} /> });
      }}
      whileTap={{ scale: 0.85 }}
      animate={{ scale: on ? [1, 1.25, 1] : [1, 0.85, 1] }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'relative',
        width: box,
        height: box,
        borderRadius: '50%',
        border: variant === 'button' ? `1px solid ${ref.color('borderSubtle')}` : 0,
        background: variant === 'button' ? ref.palette('whiteAlpha60') : ref.palette('whiteAlpha70'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <Icon name="heart" size={variant === 'button' ? 20 : size - 6} color={on ? heart : ref.color('textInk')} fill={on ? heart : 'none'} strokeWidth={1.8} />
      <AnimatePresence>
        {on && (
          <motion.span key="burst" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0.4 }}
                  animate={{ x: Math.cos(a) * box * 0.7, y: Math.sin(a) * box * 0.7, scale: 1 }}
                  transition={spring.bouncy}
                  style={{ position: 'absolute', left: '50%', top: '50%', width: 4, height: 4, marginLeft: -2, marginTop: -2, borderRadius: radius.r2, background: heart }}
                />
              );
            })}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
