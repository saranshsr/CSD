import aplus1 from '@assets/pdp/new-pdp/aplus-1.webp';
import aplus2 from '@assets/pdp/new-pdp/aplus-2.webp';

/**
 * New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571), section group D: copy and demo content for Product Features (64:5729),
 * sponsored brand (64:5730), extended warranty (64:5731), FBT (64:5732) and Ratings & Reviews (64:5733).
 */

/**
 * Demo A+ creatives (Figma "image 350768" / "image 350769", 1799 × 4096 brand banners). bappzaar renders A+ as SD rich
 * content (not ported, MAPPING.md §14), so a product without its own `aplusImages` shows these instead of its gallery photos.
 */
export const demoAplusImages: string[] = [aplus1, aplus2];

export const npdCopy = {
  /** AI review summary title: "{n} reviews," + "summarised by" (solid indigo) + " noon AI" (gradient) */
  aiSummarisedBy: 'summarised by',
  aiNoonAi: ' noon AI',
  /** review comment toggle: 12/500 brand blue after the clamped text */
  more: 'More',
  less: 'Less',
} as const;
