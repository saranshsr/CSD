import type { CSSProperties } from 'react';
import { Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { categoryRows, type CategoryLayer, type CategoryTileData } from '../data.rails';
import tileBg from '@assets/home/2025/categories/tile-bg.svg';
import saleFoldLeft from '@assets/home/2025/categories/sale-fold-left.svg';
import saleFoldRight from '@assets/home/2025/categories/sale-fold-right.svg';
import styles from './CategoryGrid.module.css';

/**
 * Shop by category — Figma `Cat Grid` (iRE9RwO94eMAyW3j3XKNXW · 1337:5151): two rows in one horizontal scroller,
 * padding 16, gaps 16. Each tile is 92×128: the 92×92 rounded grey-fade bg, layered product cut-outs with their soft
 * drop shadows, and a live Noontree SemiBold 13/14 `new-black` label (2 lines). Optional red "SALE" ribbon.
 * Tap → PLP with the category as the query.
 */
export function CategoryGrid() {
  return (
    <div className={`nk-hscroll ${styles.scroller}`}>
      <div className={styles.rows}>
        {categoryRows.map((row, r) => (
          <div key={r} className={styles.row}>
            {row.map((tile) => (
              <CategoryTile key={tile.id} tile={tile} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Figma "Category" (92×128). */
export function CategoryTile({ tile }: { tile: CategoryTileData }) {
  const nav = useNav();
  return (
    <Pressable className={styles.tile} scale={0.96} onClick={() => nav.push('plp/listing', { query: tile.query })} aria-label={tile.query}>
      <img src={tileBg} alt="" className={styles.bg} />
      {tile.layers.map((l, i) => (
        <img key={i} src={l.src} alt="" className={styles.layer} data-shadow={l.shadow} data-fit={l.fit} style={layerStyle(l)} />
      ))}
      <span className={styles.label}>{tile.label}</span>
      {tile.sale && <SaleRibbon />}
    </Pressable>
  );
}

/** Figma layer box → absolute geometry (Figma tile coordinates, not spacing — kept literal). */
function layerStyle(l: CategoryLayer): CSSProperties {
  const t = [l.rotate ? `rotate(${l.rotate}deg)` : '', l.flipY ? 'scaleY(-1)' : ''].filter(Boolean).join(' ');
  return { left: l.x, top: l.y, width: l.w, height: l.h, transform: t || undefined };
}

/** Figma 6287:7335: gradient tab (bottom radii 5) with two folded corners, "SALE" Bold 11 white, top-centre of the tile. */
function SaleRibbon() {
  return (
    <span className={styles.sale}>
      <img src={saleFoldLeft} alt="" className={styles.foldLeft} />
      <img src={saleFoldRight} alt="" className={styles.foldRight} />
      <span className={styles.saleBody}>SALE</span>
    </span>
  );
}
