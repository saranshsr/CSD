import { currency, formatPrice, productById, type Product } from '../../data';
import type { PdpContent } from './data';

/** New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571) copy for section group A (header, gallery, main info, bundle card, footer). */
export const npaCopy = {
  /** Figma "Buy now" (bappzaar noon_buy_now is "Buy Now") */
  buyNow: 'Buy now',
  /** gallery catalog tag (Figma 64:5584 "noon's Pick") */
  noonsPick: 'noon’s Pick',
  /** NoonBundleBanner banner_text: "Saving Đ45 with Combo" */
  comboSaving: (n: number) => `Saving ${currency}${formatPrice(n)} with Combo`,
  /** NoonBundleHelpScreen title / body (noon_bundle_you_are_saving) */
  comboHelp: (n: number) => `You are saving ${currency}${formatPrice(n)} when you buy this as a combo`,
  /** NoonAvailableBundlesTag title "Bundle up & Save upto <b>Đ20 off</b>" + subtitle */
  bundleTitle: 'Bundle up & Save upto',
  bundleOff: (n: number) => `${currency}${formatPrice(n)} off`,
  bundleSubtitle: (n: number) => `${n} ${n === 1 ? 'combo' : 'combos'} available`,
  bundleOpen: (n: number) => `${n} ${n === 1 ? 'combo' : 'combos'} with this product`,
} as const;

/** One combo: this product + one accessory, sold together for `saving` less (bappzaar NoonBundleType.savings). */
export interface PdpCombo {
  items: Product[];
  saving: number;
}

/** A combo saves 15% of the accessory's price (demo rule; SD sends bundle_info.savings). */
const comboRate = 0.15;
const maxCombos = 3;

/**
 * Available bundles (NoonAvailableBundlesTag / NoonBundleBanner): one combo per FBT accessory (content.fbt, the
 * current product first), at most 3. No accessories → no bundle card and no saving banner.
 */
export function combosFor(product: Product, content: PdpContent): PdpCombo[] {
  const ids = (content.fbt ?? []).filter((id) => id !== product.id).slice(0, maxCombos);
  return ids.map((id) => {
    const extra = productById(id);
    return { items: [product, extra], saving: Math.max(1, Math.round(extra.price * comboRate)) };
  });
}

/** "upto" saving over the available combos */
export const bestComboSaving = (combos: PdpCombo[]) => combos.reduce((m, c) => Math.max(m, c.saving), 0);
