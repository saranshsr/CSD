# Data layer

Products, categories, variants, the demo user and money helpers. Flows and components import from `src/data`
(`import { getProduct, products, currency } from '../../data'`). Flow folders keep only screen copy and layout feeds
(the home module order, cart section order).

```
src/data/
  products/<id>/       one folder per product
    product.ts         export default defineProduct({ … })
    card.webp          card / first image   (optional; emoji + tint are the fallback)
    gallery-1.webp …   more gallery images  (optional)
  catalog.ts           finds every product folder, attaches photos; products, getProduct, productById, listProducts
  types.ts             Product, ProductInput, ProductCollection, …
  categories.ts        noon taxonomy (categoryById, categoryPath) + the category tiles
  variants.ts          variant families (iPhone 17 Pro matrix)
  users.ts             the signed-in demo user
  money.ts             currency (dirham sign U+E001), formatPrice, discountPct
```

## Add a product

1. Create `src/data/products/<id>/product.ts`. Use the noon SKU as the id for real products (`N…V`, `Z…Z`) and a
   readable slug for invented ones. The folder name must equal `id`.

   ```ts
   import { defineProduct } from '../../define';

   export default defineProduct({
     id: 'N70999999V',
     brand: 'Apple',
     title: 'AirPods 4 with Active Noise Cancellation',
     price: 699,
     was: 799,
     rating: 4.6,
     ratingCount: 1820,
     emoji: '🎧',
     tint: '#EEF2F8', // token-lint-ignore: mock catalog data (product tint / swatch)
     express: true,
     delivery: 'Get it <b>Tomorrow</b>',
     category: 'Electronics',
     categoryId: 'headphones', // optional: a taxonomy id (categories.ts) → breadcrumb
     collection: 'demo',       // demo | live | home | phones | orders
   });
   ```
2. Put its photos next to it: `card.webp` (and `gallery-1.webp`, `gallery-2.webp`, …) at about 3× display size, then
   run `npm run assets:optimize`. The catalogue attaches them as `image` / `images`. No import lines needed.
3. The product now appears in its collection's list (`products` for demo / live / home, `phoneProducts`,
   `orderProducts`) and `getProduct('<id>')` finds it. Open it at `/pdp?productId=<id>`.

`order` sets the position in its list (existing products keep the positions they had; new ones without `order` go
last). `getProduct` returns `undefined` for an unknown id; `productById` falls back to the first product and warns in
dev, so typos are visible.

`src/mocks/products.ts`, `phones.ts` and `categories.ts` re-export from here so old imports and the package's public
names keep working.
