import { motion } from 'motion/react';
import bundleLottie from '@assets/cart/noon-bundle.lottie';
import { ExpressBadge, HtmlText, Lottie, ProductImage } from '../../components';
import type { ScreenProps } from '../../kit/types';
import { tween } from '../../motion/presets';
import { productById } from '../../data';
import { bundleDetails } from './data.bundles';
import styles from './bundles.module.css';

/**
 * NoonCartVirtualBundlesOverlayScreen: opened from an item callout whose button.action is 'vbundle'.
 * Gradient header (details.header.colors, top 30%) with icon + HTML title, separator, item rows
 * (48×60 r8 image with "xN" qty chip, 2-line title, delivery estimate, unit price), invoice rows
 * (gradient row when entry.colors has 2+ stops).
 */
export function VirtualBundlesSheet({ params }: ScreenProps<{ productId?: string }>) {
  const details = bundleDetails[params.productId ?? 'p8'] ?? bundleDetails.p8;
  const { header, items, invoice } = details;
  const bg = header.colors.length > 1 ? `linear-gradient(180deg, ${header.colors[0]} 0%, ${header.colors[1]} 30%)` : 'var(--nk-color-bg-surface)';
  const icon = (
    <span className={styles.headerIcon}>
      <Lottie src={bundleLottie} loop size={26} />
    </span>
  );

  return (
    <div className={styles.gradient} style={{ background: bg }}>
      <div className={styles.headerContainer}>
        <div className={styles.header}>
          {header.icon.isLeft && icon}
          <HtmlText base value={header.title} className={styles.html} style={{ fontSize: 16, color: 'var(--nk-color-text-strong)' }} />
          {!header.icon.isLeft && icon}
        </div>
        <div className={styles.separator} />
      </div>

      <div className={styles.list}>
        {items.map((item, i) => (
          <motion.div key={item.title} className={styles.item} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...tween('base'), delay: 0.05 * i }}>
            <div className={styles.imageBox}>
              <ProductImage product={productById(item.productId)} width={48} height={60} radius={0} emojiScale={0.5} />
              {item.quantity > 1 && <span className={styles.qty}>x{item.quantity}</span>}
            </div>
            <div className={styles.itemTitle}>
              <HtmlText base value={item.title} lines={2} className={styles.html} />
              {item.deliveryInfo && (
                <div className={styles.eta}>
                  {item.deliveryInfo.icon === 'express' && <ExpressBadge height={16} />}
                  <HtmlText base value={item.deliveryInfo.message} className={styles.delivery} />
                </div>
              )}
            </div>
            <HtmlText base value={item.unitPrice} className={styles.html} />
          </motion.div>
        ))}
      </div>

      {invoice && (
        <div className={styles.footer}>
          {invoice.entries.map((e) => {
            const gradient = e.colors.length > 1;
            return (
              <div
                key={e.title}
                className={[styles.footerRow, gradient ? styles.footerRowGradient : ''].join(' ')}
                style={gradient ? { background: `linear-gradient(90deg, ${e.colors.join(', ')})` } : undefined}
              >
                <HtmlText base value={e.title} className={styles.html} />
                <HtmlText base value={e.amount} className={styles.html} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
