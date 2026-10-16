import { ProductImage, Pressable } from '../../../components';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav, useParams } from '../../../kit/Navigator';
import { productById, type Product } from '../../../data';
import { orders } from '../../orders/data';
import ordersCenter from '@assets/icons/noon-account-orders-center.svg';
import ordersLeft from '@assets/icons/noon-account-orders-left.svg';
import ordersRight from '@assets/icons/noon-account-orders-right.svg';
import wishlistLeft from '@assets/icons/noon-account-wishlist-left.svg';
import wishlistCenter from '@assets/icons/noon-account-wishlist-center.svg';
import wishlistRight from '@assets/icons/noon-account-wishlist-right.svg';
import styles from '../account.module.css';

/** NoonAccountActionCard MAX_ICONS */
const MAX_ICONS = 4;
/** NoonAccountMyOrdersActionCard defaultIcons / NoonAccountMyWishlistActionCard defaultWishlistIcons */
const ordersDefaults = [ordersCenter, ordersLeft, ordersRight, wishlistRight];
const wishlistDefaults = [wishlistLeft, wishlistCenter, wishlistRight, wishlistLeft];

const isActive = (s: string) => s === 'processing' || s === 'shipped' || s === 'out_for_delivery';
const uniq = (ps: Product[]) => ps.filter((p, i) => ps.findIndex((q) => q.id === p.id) === i);

/**
 * "My Orders" / "My Wishlist" (bappzaar master NoonAccountActionCard + NoonAccountMy{Orders,Wishlist}ActionCard): white r12
 * cards (p10 top/sides), 16/700/22 title, then four 48×68 tiles overlapping by 10 (first on top). With order / wishlist
 * images the tiles show up to four product photos (white 3px border, cover) and fill the rest with the default icons;
 * with none they show the four default icons (2px border). Plain RN Pressable → no press visual, haptic only.
 * `account/account?orders=none` / `?wishlist=none` preview the default icons.
 */
export function ActionCards() {
  const nav = useNav();
  const { orders: ordersParam, wishlist: wishParam } = useParams<{ orders?: 'none'; wishlist?: 'none' }>();
  const { wishlist } = useDemoStore();
  // server: NoonOrderService.getRecentPlacedImages().express — kit: products of the demo orders, active ones first
  const list = ordersParam === 'none' ? [] : [...orders].sort((a, b) => Number(isActive(b.status)) - Number(isActive(a.status)));
  const orderProducts = uniq(list.flatMap((o) => o.items.map((it) => it.product)));
  // server: NoonWishlistV2Service.wishlistHomeItems(1, 4) — kit: the demo wishlist
  const wishProducts = wishParam === 'none' ? [] : wishlist.map(productById);
  return (
    <div className={styles.actionRow}>
      <ActionCard title="My Orders" items={orderProducts} defaults={ordersDefaults} onPress={() => nav.push('orders/list')} />
      <ActionCard title="My Wishlist" items={wishProducts} defaults={wishlistDefaults} onPress={() => nav.push('wishlist/wishlist')} />
    </div>
  );
}

function ActionCard({ title, items, defaults, onPress }: { title: string; items: Product[]; defaults: string[]; onPress: () => void }) {
  const shown = items.slice(0, MAX_ICONS);
  const withImages = shown.length > 0;
  return (
    <Pressable className={styles.actionCard} onClick={onPress} scale={1}>
      <span className={styles.actionTitle}>{title}</span>
      <span className={styles.tiles} aria-hidden>
        {defaults.map((icon, i) => {
          const p = shown[i];
          return (
            // zIndex MAX_ICONS − index: the first tile sits on top
            <span key={i} className={`${styles.tile} ${withImages ? styles.tileImages : ''}`} style={{ zIndex: MAX_ICONS - i }}>
              {p ? <ProductImage product={p} width="var(--nk-layout-acct-tile-w)" height="var(--nk-layout-acct-tile-h)" radius={9} fit="cover" emojiScale={0.4} style={{ marginInlineEnd: 2 }} /> : <img src={icon} alt="" />}
              {withImages && <span className={styles.tileOverlay} />}
            </span>
          );
        })}
      </span>
    </Pressable>
  );
}
