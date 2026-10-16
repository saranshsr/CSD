# Other flows: short briefs

Flows whose code didn't change on this branch beyond moving to `lazyScreen`. Each has a full bappzaar port and a `MAPPING.md` where noted; routes are in `../screens.md`. Snapshot from 2026-10-13.

## returns

Bappzaar `features/afs/returns` @ `d481712d6d9`. Its MAPPING.md is the AFS metric conventions, global tokens vs `returns*` flow tokens.

- Screens:
  - `returns/history`
  - `returns/returnable`
  - `returns/submit` (default `{ orderId: 'o3', productId: 'p5' }`)
  - `returns/summary`
  - `returns/details` (alias `/returns`)
- `returnsStore` holds `returns: ReturnRecord[]`, plus `recordFor` and `pickupAddress`.
- Links to `orders/tracking` and `pdp/detail`. Overlays are in-screen (`ReturnsOverlay`), not sheets.

## noonone (acquisition)

Bappzaar `features/vip`. 22 screens, starting from `noonone/landing` (`/noon-one`, `/noonvip`).

- Overlays use `{ presentation: 'modal', transition: 'noonone-overlay' }`.
- `noononeStore` holds selectedPlan, paymentMethod, addedCards, voucherCode and pendingSuccess. Membership state itself is the kit `useMembership`.
- With no flags, every flagged branch is off: plans = V3, and V1 isn't ported.
- Managing a membership belongs to `membership`, not here.

## membership (management)

Bappzaar VIPManageMembershipV3. Entry `membership/manage` (`/manage-membership`) on transition `mb-modal`.

- Overlays are modal + `mb-overlay`, with their own `VipOverlay` chrome.
- Sub-areas: plans, cancel, family, perks. Perks has its own MAPPING.md in its folder.
- Demo states come from `?state=`: active, trial, cancelled, familyOwner, and so on.
- `useEnsureMembership(state?)` applies the state to the kit `membershipStore`.
- Flags `vip_cancel_v2` and `vip_upgrade_v2` pick the V3/V2 screens.

## wishlist

NoonWishlistV2Screen, 1:1 with bappzaar master (`src/flows/wishlist/MAPPING.md`). Screens `wishlist/wishlist` (`/wishlist`), `wishlist/no-collections`, `wishlist/empty`, `wishlist/loading` and the `wishlist/options` sheet.

- Uses `useDemoStore` for the wishlist and the cart.
- Grid cards are the shared `ProductBoxVertical` with `wishlist` (compact view): ⋮ in place of the heart, `WishlistAtc` + share in the bottom row. Removing an item goes through ⋮ → Remove item, as in the app.
- `WishlistAtc` morphs from add-to-cart into the soft stepper (trash at 1).
- `WishlistHeader` cross-fades its title with the scroll position (no timing).
- `ViewCartPill` shows whenever the cart has items and switches to the Cart tab.
- `EmptyState` plays the real noonWishlistV2EmptyLottie (`src/assets/wishlist/`).
- Not ported: collection screen, naming / rename / delete, move / copy, share sheet, collection limit error bar.

## deals

`deals/deals` (`/deals`, the tab root). CMS strips and heroes captured from noon.com in Oct 2026.

- Every tile goes to `plp/listing`.
- No store.

## categories

Full brief: `categories.md`; every linked view: `categories-views.md`.

## cards

Payment cards. `cards/cards` (`/cards`) is one component driven by defaultParams. `cards/actions`, `cards/delete`, `cards/empty` and `cards/many` are the same screen with different params.

- `cards/add`, `cards/form`, `cards/success` (save_card Lottie).
- `cardsStore` fakes the API with `API_DELAY = 450`.

## address

AddressV2. Entry `address/select` (`/addresses`).

- Modals: `address/map` (`/add-address`), `address/create`, `address/update`, `address/search`, `address/locationOff`.
- Sheets: `address/controls`, `address/locationAccess`.
- `address/selectSheet`: the home header's address tap. `SelectScreen` with `isBottomSheet` inside `FloatingOverlay` (`slideIn`) on a `transparent` modal over the page; picking an address closes it and toasts through `nav.toast`. The home header text stays the static `user.address`, so it doesn't follow the pick.
- `addressStore` holds addresses, the default id, location permission, the search → map hand-off and the locate request.
- `StreetMap` is a fake map. The flow registers its own transitions.
