import { Module } from '../HomeScreen';
import { Stagger } from '../../../motion/recipes';
import { productRails } from '../data.rails';
import { RailSku } from './RecommendedRail';
import styles from './ProductRail.module.css';

/**
 * Product rail — Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5572 "Bestsellers" / 1337:6349 "Selling out fast": the 2025 title row
 * (`Module`, 17/22 Bold `new-black`, x=14) over a rail of 134px `SkuCard`s (pt12, px12, gap 12).
 */
export function ProductRail({ title, items }: { title: string; items: 'bestsellers' | 'sellingOutFast' }) {
  const list = productRails[items];
  if (!list.length) return null;
  return (
    <Module title={title}>
      <Stagger className={`nk-hscroll ${styles.rail}`}>
        {list.map((item) => (
          <RailSku key={item.id} item={item} />
        ))}
      </Stagger>
    </Module>
  );
}
