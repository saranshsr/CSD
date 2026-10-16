/**
 * R&R 2.0 assets, copied from repo vbirla789/R-R-2.0-with-checkbox `public/` into src/assets/reviews
 * (PNGs → webp at ≤ 900px long edge, then `node scripts/optimize-assets.mjs src/assets/reviews`).
 * Not copied: `orders/active1.png`, `orders/active2.png` (= pastorder-1), `orders/airpods.png` — only the repo's
 * own order list used them; our orders list keeps its mock products.
 */
import productCase from '@assets/reviews/product-case.webp';
import iphone from '@assets/reviews/iphone.webp';
import pastOrder1 from '@assets/reviews/pastorder-1.webp';
import pastOrder2 from '@assets/reviews/pastorder-2.webp';
import pastOrder3 from '@assets/reviews/pastorder-3.webp';
import washer from '@assets/reviews/washer.webp';
import review1 from '@assets/reviews/review-1.webp';
import review2 from '@assets/reviews/review-2.webp';
import reviewPhoto1 from '@assets/reviews/review-photo-1.webp';
import reviewPhoto2 from '@assets/reviews/review-photo-2.webp';
import reviewPhoto3 from '@assets/reviews/review-photo-3.webp';
import starsLoading from '@assets/reviews/stars-loading.lottie';
import reviewSuccess from '@assets/reviews/review-success.lottie';

export const reviewsImages = {
  /** bike phone holder (public/product-case.webp) */
  productCase,
  /** Apple iPhone 16 Pro (public/orders/iphone.png) */
  iphone,
  /** refrigerator (public/orders/pastorder-1.png) */
  pastOrder1,
  /** Jaguar Classic Black (public/orders/pastorder-2.png) */
  pastOrder2,
  /** Spigen AirPods Pro case (public/orders/pastorder-3.png) */
  pastOrder3,
  /** Milton bottle — the repo file is called washer.png (public/orders/washer.png) */
  washer,
  /** the reviewer's attached photos on the Submitted card (public/review-1.png, review-2.png) */
  review1,
  review2,
  /** spare review photos (public/review-photo-1..3.webp) — what "Gallery" adds in AddPhotos */
  reviewPhoto1,
  reviewPhoto2,
  reviewPhoto3,
} as const;

/** Flow Lotties — pass via `<Lottie src={reviewsLotties.starsLoading} />` (they differ from the kit's `starLoading` / `reviewCheck`). */
export const reviewsLotties = {
  /** AILoaderScreen: 18px looping sparkle stars next to "Finangling through your choices" */
  starsLoading,
  /** SubmittedScreen: full-page success animation, plays once and holds its last frame */
  reviewSuccess,
} as const;
