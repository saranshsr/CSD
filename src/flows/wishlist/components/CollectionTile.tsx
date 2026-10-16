import { ProductImage, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { productById } from '../../../data';
import placeholder from '@assets/wishlist/noon-wishlist-v2-empty-collection-placeholder.webp';
import { copy } from '../data';
import { wishlistTokens } from '../tokens';
import styles from '../wishlist.module.css';

/**
 * NoonWishlistV2CollectionTitle: 126 × 152 tile with the tab, the NoonWishlistV2CollectionImageBackground stack
 * (size 67: centre = previewItems[0] or the placeholder, left = [1], right = [2], sides −8° / 8°, scale 0.88), name and count.
 */
export function CollectionTile({ name, items }: { name: string; items: string[] }) {
  const nav = useNav();
  const s = wishlistTokens.stack;
  const h = s.size;
  const w = h * s.aspect;
  const card = { width: w, height: h, borderRadius: w * s.radius };
  const [center, left, right] = [0, 1, 2].map((i) => (items[i] ? productById(items[i]) : undefined));
  return (
    <Pressable className={styles.tile} onClick={() => nav.toast(`${name} — the collection screen is not in this demo`)}>
      <span className={styles.tileTab} />
      <span className={styles.stack} style={{ width: w * s.boxWidth, height: h }}>
        <span className={`${styles.stackCard} ${styles.stackLeft}`} style={card}>
          {left && <ProductImage product={left} height="100%" fit="cover" emojiScale={0.5} />}
        </span>
        <span className={`${styles.stackCard} ${styles.stackRight}`} style={card}>
          {right && <ProductImage product={right} height="100%" fit="cover" emojiScale={0.5} />}
        </span>
        <span className={`${styles.stackCard} ${styles.stackCenter}`} style={{ ...card, marginLeft: -w / 2 }}>
          {center ? <ProductImage product={center} height="100%" fit="cover" emojiScale={0.5} /> : <img src={placeholder} alt="" />}
        </span>
      </span>
      <span className={styles.tileText}>
        <span className={styles.tileName}>{name}</span>
        <span className={styles.tileCount}>{copy.itemCount(items.length)}</span>
      </span>
    </Pressable>
  );
}
