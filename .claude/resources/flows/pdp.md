# pdp: flow brief

Read with `../screens.md`, `src/flows/pdp/FIGMA-MAPPING.md` (the look) and `src/flows/pdp/MAPPING.md` (bappzaar behaviour and values). Skill: `/pdp`. This brief reflects the branch as of 2026-10-13.

## What `pdp/detail` is now

- **Look**: the "New PDP" Figma, Af34gfmhQ1D0wstXUEHSIF · 64:5571. It builds on Storefront 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115.
- **Behaviour**: bappzaar `NoonProductDetails`.
- Truth is `mixed`, verified 2026-10-12. The default product is the live iPhone 17 Pro (`IPHONE_17_PRO_ID`, from `data.live.ts`).
- All four screens are `lazyScreen`:
  - `pdp/detail`
  - `pdp/deliveryVariants` (all five delivery cards stacked)
  - `pdp/variants` (sheet)
  - `pdp/added` (sheet)

## Section groups, not variants

`sfA`–`sfE` (Storefront) and `npA`–`npE` (New PDP deltas) are **section groups**. All of them are always merged into `pdpFlowTokens` in `src/flows/pdp/tokens.ts`.

| Group | Sections |
|---|---|
| A | header, gallery, main info, bundle |
| B | delivery, newer model, free gifts, variants |
| C | trust, payments, product details (AI overview), warranty, info, bestseller |
| D | seller, A+ features, sponsored brand, FBT |
| E | reviews, rails, ATC bar |

- Token keys are prefixed `pdpSfa…` / `pdpNpa…`. They become `--nk-<kind>-pdp-np<x>-*` vars.
- The `data.np?.ts` files hold copy plus mock derivations, which components import directly:
  - `combosFor` and `bestComboSaving` (A)
  - `freebiesFor` and `fasterLanesFor` (B)
  - `aiOverviewFor` (C)
  - `demoAplusImages` (D)
  - `railCopy` (E)
- JS-only numbers (scroll thresholds, motion) go in `pdpTokens`, not in the CSS-var token set.

## Runtime switches

- **Delivery variant**: `crossSell | noCrossSell | market | express | global`.
  - It is derived from the data by `deliveryVariantFor(content)`.
  - The `delivery` URL param can force any of them, e.g. `/pdp?delivery=global`. `global` is force-only.
- **`productId`**: a SKU with `sku` uses `liveContent`, otherwise the mock `mockContent`.
- **`recsVariant`** 0/1/2 on `pdp/added`. The default 0 means no recommendations, because every A/B flag is off with no bucket assigned.
- **`sizeMissing`** on `pdp/variants`.

## Render order (`src/flows/pdp/DetailScreen.tsx`)

SfHeader → SfGallery (pinned and shrinking) → SfMainInfo → SfBundleCard → SfSponsoredRow → SfDeliveryCard → SfNewerModelCard → SfFreeGifts → SfVariantsCard → SfPaymentOffers → SfTrustCard → SfProductDetails → SfAdditionalInfo → SfBestsellerRow → SfSellerCard → SfProductFeatures → SfSponsoredBrandCard → SfExtendedWarranty → SfFbtCard → SfReviewsCard → SfRecommendations → SfAtcBar (Qty · Buy now · Add to cart · back to top).

All of these live in `src/flows/pdp/components/storefront/`. Most wrap themselves in `Card` from `components/Sections.tsx`.

The pre-Storefront components were removed. What remains in `src/flows/pdp/components/` besides `storefront/`: `Sections.tsx` (`Card`, plus the `VipPreference` nudge), `Asset.tsx`, `Variants.tsx` (`VariantSelection`), `RecoCard`, `Stars`.

## Recipes

- **New section**:
  1. create `Sf<Name>.tsx` with a CSS module, wrapped in `Card` and taking `content: PdpContent`;
  2. put copy and derivations in a `data.np?.ts`;
  3. put tokens with no central equivalent in a `tokens.np?.ts`, prefixed and marked `token-lint-ignore`, and add the file to the `mergeTokens` call;
  4. place the section in DetailScreen's order;
  5. make it **self-hiding** when its data is empty, as SfFreeGifts, the bundle and the AI overview do.
- **New delivery variant**: add it to `DeliveryVariant` and `deliveryVariants` in `SfDeliveryCard.tsx`, and to `labels` in `DeliveryVariantsScreen.tsx`. `labels` is a `Record`, so TypeScript flags a missing key.
- **Switching SKU in place**: DetailScreen keeps `productId` in local state.
  - Picker taps go through `onSelect`. It records the scroll anchor and calls `rebase` from `useTabBarScrollHide`, so the page doesn't jump.
  - Buying options and lanes use `nav.replace('pdp/detail')`. Recommendations and newer model use `nav.push`.
- **Scroll**:
  - the gallery pins via CSS sticky, with a spacer for its travel;
  - content overlaps the image by 20 on a page-grey layer;
  - the header goes solid at 150 − 50;
  - back-to-top shows after one device height;
  - opening an accordion scrolls the page 120 (`onAccordionOpen`).

## Gotchas

- Buy Now is **back** (New PDP group A, #041F62, → checkout). The Storefront table above it in FIGMA-MAPPING.md still says it was dropped; group A wins.
- The selected option's `salePrice` drives the shown price only when the option has no `productId`.
- Fashion products preselect the first in-stock size, and DetailScreen never passes `interceptAdd`. Only the `ProductCard` "+" opens `pdp/variants`.
- The live iPhone has no `was` price or catalog tag. Use mock product `p2` to see them.
- There are no italics or letter-spacing in the kit type scale. FIGMA-MAPPING lists these as known gaps.
