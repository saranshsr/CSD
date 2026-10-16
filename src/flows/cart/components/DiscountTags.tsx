import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { DiscountTag } from '../data';
import chevronRight from '@assets/cart/figma/chevron-right.svg';
import styles from './item.module.css';

/**
 * NoonCartItemDiscountTags, Figma "Coupons bar" codes: #F6FEFD, 1px dashed Emerald/700 40%, r8, px 10 py 8, 12/14 600 + 12px chevron.
 * With >1 tag each is capped so ~30px of the next one peeks; 10px white fades at the edges follow scroll.
 */
export function DiscountTags({ tags, onOpen }: { tags?: DiscountTag[]; onOpen: (tag: DiscountTag) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ start: 0, end: 0 });
  const update = () => {
    const el = ref.current;
    if (!el) return;
    const x = Math.abs(el.scrollLeft);
    const distanceFromEnd = el.scrollWidth - (el.clientWidth + x);
    setFade({ start: Math.min(1, x / 20), end: el.scrollWidth <= el.clientWidth ? 0 : Math.min(1, distanceFromEnd / 20) });
  };
  useEffect(update, [tags?.length]);
  if (!tags?.length) return null;
  const multi = tags.length > 1;
  return (
    <div className={styles.discountTags} onClick={(e) => e.stopPropagation()}>
      <div ref={ref} className={styles.discountTagsList} onScroll={update}>
        {tags.map((tag) => (
          <motion.button key={tag.id} type="button" className={styles.discountTag} style={{ maxWidth: multi ? 'calc(100% - 36px)' : '100%' }} whileTap={{ opacity: 0.5 }} onClick={() => onOpen(tag)}>
            <span className={styles.discountTagText}>{tag.tag}</span>
            <img src={chevronRight} alt="" className="nk-flip-rtl" />
          </motion.button>
        ))}
      </div>
      <span className={styles.fadeStart} style={{ opacity: fade.start }} />
      <span className={styles.fadeEnd} style={{ opacity: fade.end }} />
    </div>
  );
}
