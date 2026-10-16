import { MarketplaceTag, ProductImage } from '../../../components';
import { currency, type Product } from '../../../data';
import { copy, isExpress, price2 } from '../data';
import styles from '../details.module.css';

/** AFSReturnsProductDetails — 60×80 framed image, 12/400/18 title, 14/700/20 price (precision 2), "Sold by" row */
export function ProductDetails({ product, hideFlags, className }: { product: Product; hideFlags?: boolean; className?: string }) {
  return (
    <div className={[styles.productDetails, className].filter(Boolean).join(' ')}>
      <div className={styles.productRow}>
        <div className={styles.productImageBox}>
          <ProductImage product={product} width="100%" height="100%" />
        </div>
        <div className={styles.productContent}>
          <span className={styles.productTitle}>{product.title}</span>
          <span className={styles.productPrice}>
            <span className={styles.productCurrency}>{currency}&nbsp;</span>
            {price2(product.price)}
          </span>
          <span className={styles.sellerRow}>
            <span className={styles.soldBy}>
              {`${copy.soldBy} `}
              <span className={styles.sellerName}>{product.seller ?? 'noon'}</span>
            </span>
            {!hideFlags && isExpress(product) && <MarketplaceTag kind="express" />}
          </span>
        </div>
      </div>
    </div>
  );
}
