# Product detail

The detail page has to make a decision possible in one screen and then defend it as the user scrolls: media first, then
a tight title / price / proof block, the choice (variant, quantity), and a footer that always shows the price and the one
action. Great PDPs collapse everything else (specs, care, shipping) into one-line accordions and put social proof as a
summary number with a single "Show all" exit. Average PDPs stack two primary buttons, repeat the price three times in
three styles and make the user scroll past specs to find reviews.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Airbnb · listing detail](https://mobbin.com/screens/53d912ff-a3dc-472b-b525-379c327a89e8) | Full-bleed photo with "1 / 27" counter and three round glass buttons (back, share, heart); a white sheet with rounded top overlaps the photo; centred title, two grey meta lines; a 3-cell proof row "4.96 ★★★★★ · Guest favorite · 298 Reviews"; host row; sticky footer: "$356" (underlined, tappable) / "For 2 nights · Sep 5–7" / "Free cancellation" chip and one "Reserve" button | Exactly one primary action, pinned. The footer carries price + context + a reassurance chip, so the CTA never stands alone. Proof is compressed to three numbers in one row with dividers |
| [Airbnb · reviews section](https://mobbin.com/screens/fc136f40-7a43-4d89-9195-70d01010471f) | Big "4.96" with laurels, "Guest favorite", one explanatory line; a sideways carousel of review cards (stars, date, 4-line excerpt, "Show more", reviewer); a full-width grey "Show all 298 reviews" button | One headline number, a few real excerpts, one exit with the count in it. Excerpts truncate at ~4 lines so cards align |
| [Amazon haul · variant + sticky bar](https://mobbin.com/screens/41db9198-e379-404c-ad2f-04d2434ceb10) | Swatch thumbnail with "Only 2 left", "Size: L" label with pills M / L / XL (selected filled), price, free returns, delivery dates, product details, "Customer Reviews 5.0 ★" collapsed; a free-shipping progress strip above a sticky footer of price + "Add to cart" | The selected value is echoed in the label ("Size: L"), so the choice reads without inspecting pills; scarcity sits on the swatch, not in a banner; the footer is price + one button |
| [Amazon · section tabs and accordions](https://mobbin.com/screens/9cbabd2d-9b3c-497d-ae01-297276af5d79) | Sticky tab row "Top / Details / Explore / Reviews" with the active one underlined; collapsible "Product specifications", "Images and videos" (thumb row), "Additional details"; a floating "Add to Cart" pill | On a long PDP the sticky section tabs make reviews one tap away from anywhere; specs are collapsed headers, not walls of text |
| [ZARA · product detail](https://mobbin.com/screens/e783b18c-d379-47c6-96ea-e32451b76c2a) | Large packshot on a neutral tile; two accordion rows "COMPOSITION, CARE & ORIGIN +" and "SHIPPING, EXCHANGES AND RETURNS +"; title + bookmark, price; one full-width outlined "ADD"; a row of 5 thumbnails | Radical restraint: one image, two collapsed info rows, title, price, one button. The type is the same small size for everything; hierarchy comes from position and whitespace, not weight |
| [talabat · grocery item](https://mobbin.com/screens/741d2580-5a1f-4d66-9cd2-e8b7c76103a1) | Packshot with back and cart (badge) buttons; brand link "Closeup"; bold 2-line title; pack size "120 ml x 4"; description truncated with "More", "Ingredients" link; "Frequently bought together" rail with "Save 5%" tags and "+" adds; sticky footer: "Save 20%" chip, price with struck was-price, and a −/1/+ stepper | For fast-moving goods the CTA *is* the stepper once added; the footer keeps saving + price + quantity together; the upsell rail sits above the fold-line with one-tap adds |

## What great looks like (the bar)

- **Media edge to edge at the top** (≈ 40–50% of the first screen), with a position counter or dots and ≤ 3 round
  overlay buttons (back, share, save). Everything else sits on one side margin (≈ 16–24).
- **Title block in this order:** brand / seller link → title (bold, ≤ 2–3 lines) → one grey meta line (size, pack,
  variant) → proof (rating + count) → price. No more than one badge in the block.
- **Variant label echoes the selection** ("Size: L", "Color Red & Green Mix"); options are pills or swatches, selected
  filled; scarcity ("Only 2 left") attaches to the option, not to a banner.
- **One sticky footer with price + exactly one primary action** (Reserve / Add to cart), optionally a context line or a
  reassurance chip. Once in cart, the primary becomes a quantity stepper (talabat).
- **Reviews as a summary:** one headline score, 2–5 truncated excerpts in a carousel, one "Show all N reviews" button.
- **Long-form info collapsed** into one-line accordion rows (2–4 of them); a long page gets sticky section tabs.
- **Section titles ≈ 20–22 bold with generous space above**, body ≈ 14–16; hairlines between sections, not cards in cards.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Screen with media under a floating header | `Screen overlayHeader safeTop={false}` + `SfHeader` | Overlay buttons: `IconButton variant="glass"` |
| Gallery | `SfGallery` (`src/flows/pdp/components/storefront/`) | Counter / dots, edge to edge |
| Title, brand, rating, price block | `SfMainInfo` with `Price`, `RatingPill` | Dirham sign via `currency`; one badge max (`CatalogTag`) |
| Variants | `SfVariantsCard` (storefront) / `Variants` (classic) | Label echoes the selected value |
| Delivery and payments | `SfDeliveryCard` with `EtaBadge`, `SfPaymentOffers` | One line each |
| Specs / care / returns | `SfProductDetails` or `Accordion` | Collapsed by default |
| Reviews entry | `SfReviewsCard` with `Stars` | Summary + excerpts + "Show all N" |
| Bundles / FBT / upsell rail | `SfFbtCard`, `SfRecommendations` | Above recommendations, one-tap add |
| Sticky price + CTA | `SfAtcBar` (glass, brings `GlassFade`), or `ActionBar layout="leadingTrailing" leading={<Price />}` | One primary; becomes `QuantityStepper` after add |
| Save | `WishlistHeart` | In the overlay header, not in the footer |

## Avoid

- Two equal primary buttons ("Add to Cart" and "Buy Now") stacked in the body *and* a sticky bar.
- The price in three places with three styles (block, variant row, footer); body + footer is enough.
- Specs, care and shipping fully expanded before reviews.
- A variant picker whose label doesn't say what's selected.
- Overlay buttons over the gallery without a glass / scrim backing (lost on light photos).
- A card inside a card for every section; use hairlines and spacing.

Last researched: 2026-10-14
