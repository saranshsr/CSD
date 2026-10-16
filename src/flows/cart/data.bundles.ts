/**
 * NoonVirtualBundleDetailsType mocks (marketplaces/noon/types/NoonVirtualBundlesType.ts), keyed by cart productId.
 * On master this comes from the cart API inside the item callout `details` (button.action === 'vbundle').
 * HTML strings are server copy (not in translations); "Total"/"You are saving"/"Combo Total" use noon_bundle_* keys.
 */
import { t } from './data';

export interface BundleItem {
  /** kit product id (stands in for imageKey → ImageCDN) */
  productId: string;
  quantity: number;
  title: string;
  unitPrice: string;
  deliveryInfo: { isRocket: boolean; message: string; icon: 'express' | null } | null;
}

export interface BundleDetails {
  header: { title: string; colors: string[]; icon: { isLottie: boolean; isLeft: boolean } };
  items: BundleItem[];
  invoice: { entries: Array<{ title: string; amount: string; colors: string[] }> } | null;
}

export const bundleDetails: Record<string, BundleDetails> = {
  p8: {
    header: {
      title: '<b>Buy together and <highlight>save  60</highlight></b>',
      colors: ['var(--nk-palette-kit-green94)', 'var(--nk-color-bg-surface)'],
      icon: { isLottie: true, isLeft: true } // noon-bundle.lottie,
    },
    items: [
      {
        productId: 'p8',
        quantity: 1,
        title: '<b>De’Longhi</b> Dedica Arte Espresso Machine EC885 Stainless Steel',
        unitPrice: '<b> 899</b>',
        deliveryInfo: { isRocket: false, icon: null, message: 'Get it by <b>Thu, Oct 16</b>' },
      },
      {
        productId: 'p13',
        quantity: 1,
        title: '<b>De’Longhi</b> Stainless Steel Milk Frothing Jug 350ml',
        unitPrice: '<b> 79</b>',
        deliveryInfo: { isRocket: false, icon: null, message: 'Get it by <b>Thu, Oct 16</b>' },
      },
      {
        productId: 'p14',
        quantity: 2,
        title: '<b>De’Longhi</b> EcoDecalk Natural Descaler for Coffee Machines 500ml',
        unitPrice: '<b> 98</b>',
        deliveryInfo: { isRocket: false, icon: null, message: 'Get it by <b>Thu, Oct 16</b>' },
      },
    ],
    invoice: {
      entries: [
        { title: `<steel>${t.bundleTotal}</steel>`, amount: '<steel><strike> 1,076</strike></steel>', colors: [] },
        { title: `<highlight>${t.bundleSaving}</highlight>`, amount: '<highlight> 60</highlight>', colors: ['var(--nk-palette-kit-green94)', 'var(--nk-color-bg-surface)'] },
        { title: `<b>${t.bundleComboTotal}</b>`, amount: '<b><medium> 1,016</medium></b>', colors: [] },
      ],
    },
  },
};
