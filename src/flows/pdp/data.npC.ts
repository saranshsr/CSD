import type { Product } from '../../data';

/**
 * New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571) copy and mock data for section group C. Copy keys follow
 * noon-en.json (bappzaar master).
 */
export const npcCopy = {
  productOverview: 'Product Overview', // noon_product_overview
  description: 'Description', // noon_description
  aiTitle: 'Summarised by AI', // ai_overview.title.text (Figma 84:8038)
  offersTag: 'Get extra 5% cashback', // Figma 64:5693 first card
} as const;

/** bappzaar NoonProductOverviewAiType, reduced to what the card renders. */
export type AiOverview = { title: string; items: { title: string; description: string }[] };

/** Mock `ai_overview` (mp-catalog product.ai_overview) by category; products without one show only the accordions, as in the app. */
const overviews: Record<string, AiOverview['items']> = {
  Mobiles: [
    { title: 'Pro-grade cameras', description: '48MP Fusion system with long-range telephoto zoom for sharp detail in any light.' },
    { title: 'All-day battery', description: 'Lasts a full day of heavy use, with fast wired and MagSafe charging.' },
    { title: 'Built to last', description: 'Aluminium unibody and Ceramic Shield front for better drop and scratch resistance.' },
    { title: 'Keep in mind', description: 'Charger not included in the box' },
  ],
  'Mobile Accessories': [
    { title: 'Power 3 devices', description: '65W fast charging for up to three devices simultaneously.' },
    { title: 'Broad compatibility', description: 'Works with MacBook, iPhone, Samsung, and other USB-C devices.' },
    { title: 'Travel-ready design', description: 'Compact GaN charger with efficient cooling.' },
    { title: 'Keep in mind', description: '240V power not supported' },
  ],
};

export function aiOverviewFor(product: Pick<Product, 'category'>): AiOverview | undefined {
  const items = overviews[product.category];
  return items ? { title: npcCopy.aiTitle, items } : undefined;
}
